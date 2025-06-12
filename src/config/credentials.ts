
// Hardcoded API credentials - Replace with your actual keys
export const API_CREDENTIALS = {
  apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Google Cloud API key
  projectId: 'your-project-id', // Replace with your Google Cloud project ID
  dialogflowCX: {
    projectId: 'your-dialogflow-project-id', // Replace with your Dialogflow CX project ID
    location: 'us-central1',
    agentId: 'your-agent-id' // Replace with your Dialogflow CX agent ID
  },
  vision: {
    apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Replace with your Vision API key (optional)
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
