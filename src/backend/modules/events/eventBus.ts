import type { EventEnvelope, EventType, ID } from '../scrutiny/contracts';

class EventBus {
  private events: EventEnvelope[] = [];
  private listeners: Map<EventType, Array<(event: EventEnvelope) => void>> = new Map();

  emit<K extends EventType>(event: EventEnvelope<K>): void {
    this.events.push(event as EventEnvelope);
    const handlers = this.listeners.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event as EventEnvelope);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${event.type}:`, err);
      }
    }
  }

  on<K extends EventType>(type: K, handler: (event: EventEnvelope<K>) => void): () => void {
    const list = this.listeners.get(type) || [];
    list.push(handler as (event: EventEnvelope) => void);
    this.listeners.set(type, list);
    return () => {
      const idx = list.indexOf(handler as (event: EventEnvelope) => void);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  getEvents(applicationId?: ID): EventEnvelope[] {
    if (!applicationId) return [...this.events];
    return this.events.filter(e => e.applicationId === applicationId);
  }

  clear(): void {
    this.events = [];
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
