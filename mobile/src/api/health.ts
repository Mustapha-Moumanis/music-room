import { create } from 'axios';
import { randomUUID } from 'expo-crypto';

import { normalizeBackendUrl } from '../config/backend';
import { clientInfoHeaders } from '../lib/client-info';
import { ApiError, toApiError } from './errors';

// Independent client: a candidate must never use stored routing or authentication.
const healthClient = create({ timeout: 8000 });
export async function pingHealth(candidateUrl: string): Promise<{ ok: true; latencyMs: number }> {
  const origin = normalizeBackendUrl(candidateUrl);
  const started = Date.now();
  try {
    const response = await healthClient.get<{ status?: string }>(`${origin}/api/health`, {
      headers: { ...clientInfoHeaders(), 'X-Request-Id': randomUUID() },
    });
    if (response.status !== 200 || response.data?.status !== 'ok') {
      throw new ApiError('INVALID_RESPONSE', 'Reached server but /api/health did not return 200 {status: "ok"}');
    }
    return { ok: true, latencyMs: Math.max(0, Date.now() - started) };
  } catch (error) {
    throw toApiError(error, origin, '/api/health');
  }
}
