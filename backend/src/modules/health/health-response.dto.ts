export class HealthResponseDto {
  /** Service availability. Database readiness will be added in MCH-81. */
  status!: 'ok';
  /** Process uptime in seconds. */
  uptime!: number;
  /** Current server time in ISO 8601 format. */
  timestamp!: string;
}
