
export interface Credentials {
  googleCloudApiKey: string;
  apiKey: string; // Add root level apiKey for backward compatibility
  projectId: string; // Add root level projectId for backward compatibility
  dialogflowProjectId: string;
  dialogflowAgentId: string;
  dialogflowLanguageCode: string;
  dialogflowCX: {
    projectId: string;
    agentId: string;
    location: string;
  };
  vision: {
    enabled: boolean;
    apiKey: string; // Add apiKey to vision interface
  };
}

export const defaultCredentials: Credentials = {
  googleCloudApiKey: '',
  apiKey: '', // Add default for root level apiKey
  projectId: '', // Add default for root level projectId
  dialogflowProjectId: '',
  dialogflowAgentId: '',
  dialogflowLanguageCode: 'en',
  dialogflowCX: {
    projectId: '',
    agentId: '',
    location: 'global'
  },
  vision: {
    enabled: false,
    apiKey: '' // Add default for vision apiKey
  }
};
