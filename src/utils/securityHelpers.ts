
// Security utility functions for the kiosk application

export class SecurityHelpers {
  // Rate limiting helper
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of this.rateLimitMap.entries()) {
      if (value.resetTime < windowStart) {
        this.rateLimitMap.delete(key);
      }
    }

    const current = this.rateLimitMap.get(identifier);
    
    if (!current || current.resetTime < windowStart) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/[<>]/g, '') // Basic XSS prevention
      .replace(/['"\\;]/g, '') // SQL injection prevention
      .trim();
  }

  // Phone number validation
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Session ID validation
  static validateSessionId(sessionId: string): boolean {
    const sessionRegex = /^session_\d+$/;
    return sessionRegex.test(sessionId);
  }

  // Generate secure session ID
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log security events
  static logSecurityEvent(event: string, details: any): void {
    console.log(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Check for suspicious patterns
  static detectSuspiciousActivity(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Secure data storage helper
  static secureLocalStorage = {
    setItem(key: string, value: any): void {
      try {
        const sanitizedKey = SecurityHelpers.sanitizeInput(key);
        localStorage.setItem(sanitizedKey, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to store data securely:', error);
      }
    },

    getItem<T>(key: string): T | null {
      try {
        const sanitizedKey = SecurityHelpers.sanitizeInput(key);
        const item = localStorage.getItem(sanitizedKey);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn('Failed to retrieve data securely:', error);
        return null;
      }
    },

    removeItem(key: string): void {
      try {
        const sanitizedKey = SecurityHelpers.sanitizeInput(key);
        localStorage.removeItem(sanitizedKey);
      } catch (error) {
        console.warn('Failed to remove data securely:', error);
      }
    }
  };
}

export default SecurityHelpers;
