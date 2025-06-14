// Security improvement: Remove hardcoded credentials
// All API keys should now be stored as Supabase secrets and accessed via Edge Functions

export interface GoogleCloudCredentials {
  apiKey: string;
  projectId: string;
}

export interface DialogflowCXCredentials {
  projectId: string;
  location: string;
  agentId: string;
}

// These are now placeholder interfaces - actual credentials come from Supabase secrets
export const getGoogleCloudCredentials = (): GoogleCloudCredentials | null => {
  console.warn('Direct credential access deprecated. Use Edge Functions instead.');
  return null;
};

export const getDialogflowCXCredentials = (): DialogflowCXCredentials | null => {
  console.warn('Direct credential access deprecated. Use Edge Functions instead.');
  return null;
};

// Keep minimal configuration for client-side use
export const SUPABASE_CONFIG = {
  url: "https://ciozbquqgfypwvgezxof.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpb3picXVxZ2Z5cHd2Z2V6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTA3ODIsImV4cCI6MjA2NDY4Njc4Mn0.2F_uAiP8axzrV2epNPyx2IP9XaP3xfE7aWtHJinrCAU"
};
