import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Socket, createConnection } from 'net';

interface TCPResponse {
  success: boolean;
  userId?: string;
  isSubscriber?: boolean;
  error?: string;
  type?: string;
}

interface AuthResponse extends TCPResponse {
  userId?: string;
}

interface SubscriberResponse extends TCPResponse {
  isSubscriber?: boolean;
}

@Injectable()
export class TcpClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TcpClientService.name);
  private client: Socket | null = null;
  private readonly host: string;
  private readonly port: number;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  constructor() {
    this.host = process.env.MAIN_SERVER_HOST || 'localhost';
    this.port = parseInt(process.env.MAIN_SERVER_TCP_PORT || '3001', 10);
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect(): void {
    if (this.isConnected) {
      return;
    }

    this.logger.log(`Attempting to connect to TCP server at ${this.host}:${this.port}`);

    this.client = createConnection({
      host: this.host,
      port: this.port,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log(`Connected to TCP server at ${this.host}:${this.port}`);
    });

    this.client.on('data', (data) => {
      // Handle welcome message or any other unsolicited data
      const message = data.toString().trim();
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'connected') {
          this.logger.debug('Received welcome message from TCP server');
        }
      } catch (error) {
        this.logger.debug('Received non-JSON data from TCP server:', message);
      }
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Connection to TCP server closed');
      this.scheduleReconnect();
    });

    this.client.on('error', (error) => {
      this.logger.error('TCP client error:', error.message);
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.client.on('timeout', () => {
      this.logger.warn('TCP connection timeout');
      this.client?.end();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    this.reconnectAttempts++;

    this.logger.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      this.client.end();
      this.client = null;
    }

    this.isConnected = false;
    this.logger.log('Disconnected from TCP server');
  }

  private async sendMessage(message: any): Promise<TCPResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.client) {
        reject(new Error('Not connected to TCP server'));
        return;
      }

      const messageStr = JSON.stringify(message) + '\n';
      let responseReceived = false;
      let responseTimeout: NodeJS.Timeout;

      const responseHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim());
          responseReceived = true;
          cleanup();
          resolve(response);
        } catch (error) {
          this.logger.error('Failed to parse TCP response:', error);
          cleanup();
          reject(new Error('Invalid response format'));
        }
      };

      const errorHandler = (error: Error) => {
        cleanup();
        reject(error);
      };

      const timeoutHandler = () => {
        cleanup();
        reject(new Error('TCP response timeout'));
      };

      const cleanup = () => {
        if (this.client) {
          this.client.removeListener('data', responseHandler);
          this.client.removeListener('error', errorHandler);
        }
        if (responseTimeout) {
          clearTimeout(responseTimeout);
        }
      };

      // Set up listeners
      this.client.on('data', responseHandler);
      this.client.on('error', errorHandler);

      // Set timeout for response (10 seconds)
      responseTimeout = setTimeout(timeoutHandler, 10000);

      // Send the message
      this.client.write(messageStr, (error) => {
        if (error) {
          cleanup();
          reject(error);
        }
      });
    });
  }

  async verifyAuthentication(token: string): Promise<AuthResponse> {
    try {
      this.logger.debug('Verifying authentication token via TCP');

      const message = {
        type: 'authenticated',
        token: token
      };

      const response = await this.sendMessage(message);

      if (response.success && response.userId) {
        this.logger.debug(`Authentication successful for user: ${response.userId}`);
        return {
          success: true,
          userId: response.userId
        };
      } else {
        this.logger.debug(`Authentication failed: ${response.error || 'Unknown error'}`);
        return {
          success: false,
          error: response.error || 'Authentication failed'
        };
      }
    } catch (error) {
      this.logger.error('TCP authentication request failed:', error.message);
      return {
        success: false,
        error: 'TCP communication failed'
      };
    }
  }

  async checkSubscription(token: string): Promise<SubscriberResponse> {
    try {
      this.logger.debug('Checking subscription status via TCP');

      const message = {
        type: 'subscriber',
        token: token
      };

      const response = await this.sendMessage(message);

      if (response.success && typeof response.isSubscriber === 'boolean') {
        this.logger.debug(`Subscription check successful: ${response.isSubscriber ? 'subscriber' : 'not subscriber'}`);
        return {
          success: true,
          isSubscriber: response.isSubscriber
        };
      } else {
        this.logger.debug(`Subscription check failed: ${response.error || 'Unknown error'}`);
        return {
          success: false,
          isSubscriber: false,
          error: response.error || 'Subscription check failed'
        };
      }
    } catch (error) {
      this.logger.error('TCP subscription check failed:', error.message);
      return {
        success: false,
        isSubscriber: false,
        error: 'TCP communication failed'
      };
    }
  }

  getConnectionStatus(): { connected: boolean; host: string; port: number } {
    return {
      connected: this.isConnected,
      host: this.host,
      port: this.port
    };
  }
}
