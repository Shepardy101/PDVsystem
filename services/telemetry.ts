export type UiEvent = {
  userId?: string | null;
  page: string;
  area: string;
  action: string;
  meta?: Record<string, any> | null;
};

export async function logUiEvent(event: UiEvent) {
  try {
    await fetch('/api/telemetry/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, ts: Date.now() }),
    });
  } catch (err) {
    // Ignora erros para não impactar UX
    console.debug('[telemetry] falha ao enviar evento', err);
  }
}
