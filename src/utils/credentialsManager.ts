
interface GoogleCloudCredentials {
  apiKey: string;
  projectId: string;
  dialogflowCX: {
    projectId: string;
    location: string;
    agentId: string;
    serviceAccountKey?: string; // For OAuth2 authentication
  };
  vision: {
    apiKey: string;
  };
}

const CREDENTIALS_KEY = 'google_cloud_credentials';

export const credentialsManager = {
  // Save credentials to localStorage as JSON
  saveCredentials: (credentials: Partial<GoogleCloudCredentials>) => {
    try {
      const existing = credentialsManager.getCredentials();
      const updated = { ...existing, ...credentials };
      const encoded = btoa(JSON.stringify(updated));
      localStorage.setItem(CREDENTIALS_KEY, encoded);
      console.log('✅ Credentials saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save credentials:', error);
      return false;
    }
  },

  // Load credentials from localStorage
  getCredentials: (): GoogleCloudCredentials => {
    try {
      const encoded = localStorage.getItem(CREDENTIALS_KEY);
      if (!encoded) {
        return {
          apiKey: '',
          projectId: '',
          dialogflowCX: {
            projectId: '',
            location: 'us-central1',
            agentId: ''
          },
          vision: {
            apiKey: ''
          }
        };
      }
      const decoded = JSON.parse(atob(encoded));
      return decoded;
    } catch (error) {
      console.error('❌ Failed to load credentials:', error);
      return {
        apiKey: '',
        projectId: '',
        dialogflowCX: {
          projectId: '',
          location: 'us-central1',
          agentId: ''
        },
        vision: {
          apiKey: ''
        }
      };
    }
  },

  // Check if credentials are configured
  areCredentialsConfigured: (): boolean => {
    const creds = credentialsManager.getCredentials();
    return !!(creds.apiKey && creds.projectId);
  },

  // Clear all credentials
  clearCredentials: () => {
    localStorage.removeItem(CREDENTIALS_KEY);
    console.log('🗑️ Credentials cleared');
  }
};
