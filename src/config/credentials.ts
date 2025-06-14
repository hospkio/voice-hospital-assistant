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
  googleCloudApiKey: "AIzaSyAUMuJMxBl9ph2ULMEeql9JNz_QN76d_w8",
  apiKey: "AIzaSyAUMuJMxBl9ph2ULMEeql9JNz_QN76d_w8", // Add default for root level apiKey
  projectId: "spartan-cosmos-462009-j5", // Add default for root level projectId
  dialogflowProjectId: "spartan-cosmos-462009-j5",
  dialogflowAgentId: "0647bca7-cdea-42ff-9303-db4b14113b91",
  dialogflowLanguageCode: "en",
  dialogflowCX: {
    projectId: "spartan-cosmos-462009-j5",
    agentId: "0647bca7-cdea-42ff-9303-db4b14113b91",
    location: "us-central1",
  },
  vision: {
    enabled: true,
    apiKey: "084f3f3d3e4709297bcd50a6b730fe177a9fcd06", // Add default for vision apiKey
  },
};
