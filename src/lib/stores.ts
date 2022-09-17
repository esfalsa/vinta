import { writable } from 'svelte/store';

export const password = writable<string>(sessionStorage.getItem('password') || '');

password.subscribe((val) => sessionStorage.setItem('password', val));
