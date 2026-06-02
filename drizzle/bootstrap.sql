-- Run this ONCE against your Supabase project before applying Drizzle migrations.
-- In the Supabase dashboard → Database → Extensions, or via psql:
--   psql "$DIRECT_URL" -f drizzle/bootstrap.sql
create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";
