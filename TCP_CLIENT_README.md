# NestJS TCP Client Guards for Authentication & Authorization

This implementation provides NestJS guards that communicate with the Express.js TCP server (`mainServer`) for user authentication and subscription verification.

## Architecture Overview

```
┌─────────────────┐    TCP (3001)    ┌─────────────────┐
│   NestJS App    │◄────────────────►│  Express App    │
│ (contentServer) │                  │  (mainServer)   │
│                 │                  │                 │
│ • AuthGuard     │                  │ • TCP Server    │
│ • SubscriberGuard│                  │ • Supabase Auth │
│ • TCP Client    │                  │ • Subscription DB│
└─────────────────┘                  └─────────────────┘
```

## Features

- **TCP Client Service**: Persistent connection to mainServer with automatic reconnection
- **Authentication Guard**: Validates JWT tokens via TCP communication
- **Subscriber Guard**: Checks active subscriptions via TCP communication
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Connection Management**: Automatic reconnection with exponential backoff
- **Logging**: Detailed logging for debugging and monitoring

## File Structure

```
src/
├── tcp/
│   ├── tcp-client.service.ts    # TCP client with reconnection logic
│   └── tcp.module.ts           # TCP module configuration
├── guards/
│   ├── auth.guard.ts           # Authentication guard
│   ├── subscriber.guard.ts     # Subscriber guard
│   └── guards.module.ts        # Guards module configuration
├── content/
│   ├── content.controller.ts   # Sample controller with guards
│   └── content.module.ts       # Content module
└── app.module.ts               # Updated to include TCP and Guards modules
```

## Environment Variables

Add these to your `.env` file:

```env
# Main Server TCP Connection
MAIN_SERVER_HOST=localhost
MAIN_SERVER_TCP_PORT=3001
```

## TCP Client Service

### `TcpClientService`

**Key Features:**
- Automatic connection establishment on module initialization
- Exponential backoff reconnection (1s → 2s → 4s → ... → 30s max)
- Request/response correlation with 10-second timeouts
- Connection status monitoring
- Graceful shutdown handling

**Methods:**
```typescript
verifyAuthentication(token: string): Promise<{success: boolean, userId?: string, error?: string}>
checkSubscription(token: string): Promise<{success: boolean, isSubscriber: boolean, error?: string}>
getConnectionStatus(): {connected: boolean, host: string, port: number}
```

## Guards

### `AuthGuard`

**Purpose**: Validates JWT tokens against the mainServer

**Behavior:**
- Extracts Bearer token from `Authorization` header
- Sends `authenticated` request to TCP server
- Returns `401 Unauthorized` if token is invalid
- Attaches user info to request object on success

**Usage:**
```typescript
@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(AuthGuard)
  getProtectedData() {
    // User is authenticated
    return { message: 'Protected content' };
  }
}
```

### `SubscriberGuard`

**Purpose**: Ensures user has an active subscription

**Behavior:**
- Requires `AuthGuard` to run first (user must be authenticated)
- Sends `subscriber` request to TCP server
- Returns `403 Forbidden` if user is not a subscriber
- Attaches subscriber status to request object

**Usage:**
```typescript
@Controller('premium')
export class PremiumController {
  @Get()
  @UseGuards(AuthGuard, SubscriberGuard)
  getPremiumData() {
    // User is authenticated AND has active subscription
    return { message: 'Premium content' };
  }
}
```

## Sample Implementation

### Content Controller

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { SubscriberGuard } from '../guards/subscriber.guard';

@Controller('content')
export class ContentController {
  @Get('public')
  getPublicContent() {
    return {
      message: 'Public content - accessible to everyone',
      timestamp: new Date().toISOString()
    };
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  getProtectedContent() {
    return {
      message: 'Protected content - requires authentication',
      userId: 'user-info-will-be-attached-by-guard',
      timestamp: new Date().toISOString()
    };
  }

  @Get('premium')
  @UseGuards(AuthGuard, SubscriberGuard)
  getPremiumContent() {
    return {
      message: 'Premium subscriber-only content',
      userId: 'authenticated-user-id',
      isSubscriber: true,
      timestamp: new Date().toISOString()
    };
  }

  @Get('user-info')
  @UseGuards(AuthGuard)
  getUserInfo() {
    // The guard attaches user info to the request object
    return {
      message: 'User information from authenticated request',
      user: {
        id: 'user-id-from-guard',
        uid: 'user-uid-for-compatibility',
        token: 'bearer-token'
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

## TCP Message Protocol

### Authentication Request
```json
{
  "type": "authenticated",
  "token": "eyJhbGc..."
}
```

### Authentication Response
```json
{
  "success": true,
  "userId": "user-123"
}
```

### Subscriber Request
```json
{
  "type": "subscriber",
  "token": "eyJhbGc..."
}
```

### Subscriber Response
```json
{
  "success": true,
  "isSubscriber": true
}
```

## Error Handling

### HTTP Status Codes

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Valid token but insufficient permissions (no subscription)
- **500 Internal Server Error**: TCP communication failure

### Error Messages

- `"Authorization header is required"`
- `"Invalid authorization header format"`
- `"Authentication failed: Invalid token"`
- `"Premium content requires an active subscription"`
- `"Authentication service unavailable"`

## Module Configuration

### App Module Updates

```typescript
import { TcpModule } from './tcp/tcp.module';
import { GuardsModule } from './guards/guards.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [
    // ... existing modules
    TcpModule,
    GuardsModule,
    ContentModule,
  ],
  // ... rest of configuration
})
export class AppModule {}
```

## Connection Management

### Automatic Reconnection

The TCP client implements exponential backoff reconnection:

1. **Initial Connection**: Attempts to connect immediately
2. **Connection Loss**: Waits 1 second, then retries
3. **Failed Attempts**: Doubles wait time (2s, 4s, 8s, 16s, 30s max)
4. **Max Attempts**: Continues retrying indefinitely with 30s intervals

### Connection Status

```typescript
const status = tcpClientService.getConnectionStatus();
// Returns: { connected: true, host: 'localhost', port: 3001 }
```

## Logging

### Log Levels

- **LOG**: Connection established, successful operations
- **WARN**: Connection issues, authentication failures
- **ERROR**: TCP communication errors, parsing failures
- **DEBUG**: Detailed operation information (when enabled)

### Sample Logs

```
[Nest] LOG [TcpClientService] Attempting to connect to TCP server at localhost:3001
[Nest] LOG [TcpClientService] Connected to TCP server at localhost:3001
[Nest] DEBUG [AuthGuard] Authentication successful for user: user-123
[Nest] WARN [SubscriberGuard] Access denied: User is not a subscriber
[Nest] ERROR [TcpClientService] TCP client error: ECONNREFUSED
```

## Testing

### Manual Testing

1. **Start mainServer** (Express.js with TCP server on port 3001)
2. **Start contentServer** (NestJS app)
3. **Test endpoints**:

```bash
# Public access (no auth required)
curl http://localhost:3000/content/public

# Protected access (requires valid JWT)
curl -H "Authorization: Bearer <valid-jwt>" \
     http://localhost:3000/content/protected

# Premium access (requires valid JWT + active subscription)
curl -H "Authorization: Bearer <valid-jwt>" \
     http://localhost:3000/content/premium
```

### Integration Testing

```typescript
// Test TCP client directly
const tcpService = app.get(TcpClientService);
const authResult = await tcpService.verifyAuthentication('test-token');
expect(authResult.success).toBe(false);
```

## Security Considerations

- **Token Validation**: All tokens validated server-side via Supabase
- **Connection Security**: TCP communication (consider TLS for production)
- **Error Information**: Sensitive error details not exposed to clients
- **Rate Limiting**: Consider implementing rate limiting for guard calls
- **Token Expiry**: JWT tokens should have reasonable expiry times

## Performance Considerations

- **Connection Pooling**: Single persistent TCP connection
- **Request Timeouts**: 10-second timeout for TCP responses
- **Concurrent Requests**: Handles multiple simultaneous requests
- **Memory Management**: Automatic cleanup on disconnection
- **Error Recovery**: Automatic reconnection prevents service disruption

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure mainServer is running on port 3001
   - Check `MAIN_SERVER_HOST` and `MAIN_SERVER_TCP_PORT` environment variables

2. **Authentication Always Fails**
   - Verify Supabase configuration in mainServer
   - Check JWT token format and validity

3. **Subscription Check Fails**
   - Ensure database connection in mainServer
   - Verify subscription table structure

4. **Timeout Errors**
   - Check network connectivity between servers
   - Verify mainServer is not overloaded

### Debug Mode

Enable detailed logging by setting log level to 'debug' in your NestJS configuration:

```typescript
app.useLogger(['log', 'error', 'warn', 'debug']);
```

## Future Enhancements

- **Connection Pooling**: Multiple TCP connections for high load
- **Message Encryption**: TLS encryption for TCP communication
- **Circuit Breaker**: Fail-fast mechanism for mainServer outages
- **Metrics**: Request latency and success rate monitoring
- **Caching**: Cache authentication results to reduce TCP calls

## API Reference

### TcpClientService

#### `verifyAuthentication(token: string)`
Validates a JWT token against the mainServer.

**Parameters:**
- `token`: JWT token string

**Returns:**
```typescript
Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}>
```

#### `checkSubscription(token: string)`
Checks if an authenticated user has an active subscription.

**Parameters:**
- `token`: JWT token string

**Returns:**
```typescript
Promise<{
  success: boolean;
  isSubscriber: boolean;
  error?: string;
}>
```

### Guards

#### `AuthGuard.canActivate(context: ExecutionContext)`
Validates authentication for a request.

**Throws:**
- `UnauthorizedException` for invalid/missing tokens

#### `SubscriberGuard.canActivate(context: ExecutionContext)`
Validates subscription status for authenticated users.

**Throws:**
- `ForbiddenException` for non-subscribers

## Deployment Considerations

- **Environment Variables**: Set `MAIN_SERVER_HOST` and `MAIN_SERVER_TCP_PORT` appropriately
- **Network Security**: Ensure TCP port 3001 is accessible between servers
- **Load Balancing**: Consider TCP connection affinity if using load balancers
- **Monitoring**: Monitor TCP connection health and reconnection frequency

This implementation provides a robust, scalable solution for cross-service authentication and authorization using TCP communication between NestJS and Express.js applications.
