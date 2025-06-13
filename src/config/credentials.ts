
// Hardcoded API credentials - Replace with your actual keys
export const API_CREDENTIALS = {
  apiKey: 'AIzaSyAUMuJMxBl9ph2ULMEeql9JNz_QN76d_w8', // Replace with your Google Cloud API key
  projectId: 'spartan-cosmos-462009-j5', // Replace with your Google Cloud project ID
  dialogflowCX: {
    projectId: 'spartan-cosmos-462009-j5', // Replace with your Dialogflow CX project ID
    location: 'us-central1',
    agentId: '0647bca7-cdea-42ff-9303-db4b14113b91' // Replace with your Dialogflow CX agent ID
  },
  vision: {
    apiKey: '084f3f3d3e4709297bcd50a6b730fe177a9fcd06' // Replace with your Vision API key (optional)
  }
};

// Helper function to get credentials
export const getCredentials = () => {
  return API_CREDENTIALS;
};

// Helper function to check if credentials are configured
export const areCredentialsConfigured = () => {
  return !!(API_CREDENTIALS.apiKey && API_CREDENTIALS.projectId);
};
