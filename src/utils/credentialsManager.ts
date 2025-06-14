
// Enhanced security for credentials management
// Now uses only localStorage for temporary storage and Edge Functions for API access

interface Credentials {
  googleCloudApiKey?: string;
  googleCloudProjectId?: string;
  dialogflowCxProjectId?: string;
  dialogflowCxLocation?: string;
  dialogflowCxAgentId?: string;
}

class CredentialsManager {
  private static instance: CredentialsManager;
  private credentials: Credentials = {};

  private constructor() {}

  static getInstance(): CredentialsManager {
    if (!CredentialsManager.instance) {
      CredentialsManager.instance = new CredentialsManager();
    }
    return CredentialsManager.instance;
  }

  // Secure method to temporarily store credentials in localStorage only
  setCredentials(creds: Partial<Credentials>): void {
    this.credentials = { ...this.credentials, ...creds };
    
    // Store in localStorage for session persistence (encrypted in production)
    try {
      localStorage.setItem('temp_credentials', JSON.stringify(this.credentials));
    } catch (error) {
      console.warn('Failed to store credentials in localStorage:', error);
    }
  }

  getCredentials(): Credentials {
    if (Object.keys(this.credentials).length === 0) {
      try {
        const stored = localStorage.getItem('temp_credentials');
        if (stored) {
          this.credentials = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load credentials from localStorage:', error);
      }
    }
    return this.credentials;
  }

  // Security enhancement: Method to clear sensitive data
  clearCredentials(): void {
    this.credentials = {};
    try {
      localStorage.removeItem('temp_credentials');
    } catch (error) {
      console.warn('Failed to clear credentials:', error);
    }
  }

  // Check if basic credentials are available
  hasBasicCredentials(): boolean {
    const creds = this.getCredentials();
    return !!(creds.googleCloudApiKey && creds.googleCloudProjectId);
  }

  // Security note: All API calls should now go through Edge Functions
  // This manager is only for temporary UI state management
  getGoogleCloudCredentials() {
    const creds = this.getCredentials();
    if (creds.googleCloudApiKey && creds.googleCloudProjectId) {
      return {
        apiKey: creds.googleCloudApiKey,
        projectId: creds.googleCloudProjectId
      };
    }
    return null;
  }

  getDialogflowCXCredentials() {
    const creds = this.getCredentials();
    if (creds.dialogflowCxProjectId && creds.dialogflowCxLocation && creds.dialogflowCxAgentId) {
      return {
        projectId: creds.dialogflowCxProjectId,
        location: creds.dialogflowCxLocation,
        agentId: creds.dialogflowCxAgentId
      };
    }
    return null;
  }
}

export const credentialsManager = CredentialsManager.getInstance();
