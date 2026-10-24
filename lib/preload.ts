// Tiny registry the loading screen waits on. Anything that must be ready before the
// site is revealed calls `track(name)` (synchronously, before effects run - e.g. in a
// layout effect) and `done(name)` when it's ready.

type Listener = () => void;

const tasks = new Map<string, boolean>();
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function track(name: string) {
  if (!tasks.has(name)) {
    tasks.set(name, false);
    emit();
  }
}

export function done(name: string) {
  if (tasks.get(name) !== true) {
    tasks.set(name, true);
    emit();
  }
}

export function progress() {
  if (tasks.size === 0) return 0;
  let n = 0;
  tasks.forEach((v) => v && n++);
  return n / tasks.size;
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
