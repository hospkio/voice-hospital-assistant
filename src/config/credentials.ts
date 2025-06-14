
export interface Credentials {
  googleCloudApiKey: string;
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
  };
}

export const defaultCredentials: Credentials = {
  googleCloudApiKey: '',
  dialogflowProjectId: '',
  dialogflowAgentId: '',
  dialogflowLanguageCode: 'en',
  dialogflowCX: {
    projectId: '',
    agentId: '',
    location: 'global'
  },
  vision: {
    enabled: false
  }
};
