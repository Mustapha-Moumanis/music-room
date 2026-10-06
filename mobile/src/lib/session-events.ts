type SessionExpiredHandler = () => void | Promise<void>;

let handler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(next: SessionExpiredHandler) {
  handler = next;
}

export async function expireSession() {
  await handler?.();
}
