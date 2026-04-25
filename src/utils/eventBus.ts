type EventMap = {
  unreadMessagesUpdated: number;
};

class EventBus {
  private listeners: Partial<Record<keyof EventMap, Array<(data: any) => void>>> = {};

  on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(callback);
    return () => this.off(event, callback);
  }

  off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter((cb) => cb !== callback);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    this.listeners[event]?.forEach((cb) => cb(data));
  }
}

export const eventBus = new EventBus();
