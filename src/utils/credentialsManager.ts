
import { Credentials, defaultCredentials } from '@/config/credentials';

export class CredentialsManager {
  private credentials: Credentials = defaultCredentials;

  setCredentials(newCredentials: Partial<Credentials>): void {
    this.credentials = { ...this.credentials, ...newCredentials };
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('googleCloudCredentials', JSON.stringify(this.credentials));
    } catch (error) {
      console.warn('Could not save credentials to localStorage:', error);
    }
  }

  getCredentials(): Credentials {
    return { ...this.credentials };
  }

  clearCredentials(): void {
    this.credentials = defaultCredentials;
    try {
      localStorage.removeItem('googleCloudCredentials');
    } catch (error) {
      console.warn('Could not clear credentials from localStorage:', error);
    }
  }

  loadCredentials(): void {
    try {
      const stored = localStorage.getItem('googleCloudCredentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.credentials = { ...defaultCredentials, ...parsed };
      }
    } catch (error) {
      console.warn('Could not load credentials from localStorage:', error);
      this.credentials = defaultCredentials;
    }
  }

  hasValidCredentials(): boolean {
    return Boolean(this.credentials.googleCloudApiKey?.trim());
  }
}

export const credentialsManager = new CredentialsManager();
