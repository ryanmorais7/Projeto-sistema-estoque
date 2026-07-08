// Inicialização do client Supabase (via CDN, sem etapa de build).
// A anon key é pública por design do Supabase: o controle de acesso real
// deve vir das políticas de Row Level Security (RLS) nas tabelas do banco,
// não do sigilo desta chave.

const SUPABASE_URL = 'https://vkoqsjfykybrtwhhrpiz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb3FzamZ5a3licnR3aGhycGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjM3MzcsImV4cCI6MjA5NTE5OTczN30.i3u9fTjbx022oqa4LwKpF8BMLfehBVEv560peCbnWSM';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
