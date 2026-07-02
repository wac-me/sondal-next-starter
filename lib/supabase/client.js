// Klient Supabase do użytku w komponentach klienckich ("use client")
// Używa publicznego klucza anon — bezpieczny do ujawnienia w przeglądarce,
// bo wszystkie zabezpieczenia są na poziomie RLS w bazie danych.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
