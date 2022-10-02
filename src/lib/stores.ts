import { writable } from 'svelte/store';

export const password = writable<string>(sessionStorage.getItem('password') || '');
password.subscribe((val) => sessionStorage.setItem('password', val));

export const selected = writable<number[]>(JSON.parse(sessionStorage.getItem('selected') || '[]'));
selected.subscribe((val) => sessionStorage.setItem('selected', JSON.stringify(val)));

export const nations = writable<Nation[]>();
