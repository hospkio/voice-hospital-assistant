
import { API_CREDENTIALS, getCredentials as getHardcodedCredentials, areCredentialsConfigured as checkHardcodedCredentials } from '@/config/credentials';

interface GoogleCloudCredentials {
  apiKey: string;
  projectId: string;
  dialogflowCX: {
    projectId: string;
    location: string;
    agentId: string;
    serviceAccountKey?: string;
  };
  vision: {
    apiKey: string;
  };
}

const CREDENTIALS_KEY = 'google_cloud_credentials';

const getDefaultCredentials = (): GoogleCloudCredentials => ({
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
});

export const credentialsManager = {
  // Save credentials to localStorage as JSON (kept for backward compatibility)
  saveCredentials: (credentials: Partial<GoogleCloudCredentials>) => {
    try {
      const existing = credentialsManager.getCredentials();
      
      const updated = {
        ...existing,
        ...credentials,
        dialogflowCX: {
          ...existing.dialogflowCX,
          ...(credentials.dialogflowCX || {})
        },
        vision: {
          ...existing.vision,
          ...(credentials.vision || {})
        }
      };
      
      const encoded = btoa(JSON.stringify(updated));
      localStorage.setItem(CREDENTIALS_KEY, encoded);
      console.log('✅ Credentials saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save credentials:', error);
      return false;
    }
  },

  // Load credentials - prioritize hardcoded credentials, then localStorage
  getCredentials: (): GoogleCloudCredentials => {
    try {
      // First try to use hardcoded credentials
      const hardcodedCreds = getHardcodedCredentials();
      if (checkHardcodedCredentials()) {
        console.log('✅ Using hardcoded credentials from config file');
        return hardcodedCreds;
      }

      // Fallback to localStorage if hardcoded credentials are not configured
      const encoded = localStorage.getItem(CREDENTIALS_KEY);
      if (!encoded) {
        return getDefaultCredentials();
      }
      
      const decoded = JSON.parse(atob(encoded));
      
      const defaultCreds = getDefaultCredentials();
      const merged = {
        ...defaultCreds,
        ...decoded,
        dialogflowCX: {
          ...defaultCreds.dialogflowCX,
          ...(decoded.dialogflowCX || {})
        },
        vision: {
          ...defaultCreds.vision,
          ...(decoded.vision || {})
        }
      };
      
      return merged;
    } catch (error) {
      console.error('❌ Failed to load credentials:', error);
      return getDefaultCredentials();
    }
  },

  // Check if credentials are configured (check hardcoded first, then localStorage)
  areCredentialsConfigured: (): boolean => {
    if (checkHardcodedCredentials()) {
      return true;
    }
    const creds = credentialsManager.getCredentials();
    return !!(creds.apiKey && creds.projectId);
  },

  // Clear all credentials
  clearCredentials: () => {
    localStorage.removeItem(CREDENTIALS_KEY);
    console.log('🗑️ Credentials cleared from localStorage');
  }
};
