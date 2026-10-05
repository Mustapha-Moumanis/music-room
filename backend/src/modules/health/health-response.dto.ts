export class HealthResponseDto {
  /** Service availability. */
  status!: 'ok' | 'degraded';
  /** Database connectivity. */
  db!: 'up' | 'down';
  /** Process uptime in seconds. */
  uptime!: number;
  /** Current server time in ISO 8601 format. */
  timestamp!: string;
}
