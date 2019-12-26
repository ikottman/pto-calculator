import { writable, derived } from 'svelte/store';

export const selectedDays = writable([]);
export const velocity = writable(0);
export const starting = writable(0);
export const plannedPto = derived(selectedDays, $selectedDays => $selectedDays.length * 8);