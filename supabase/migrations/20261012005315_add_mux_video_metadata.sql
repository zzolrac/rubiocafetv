/*
# Add Mux metadata to content

1. New columns on `content`
- `media_provider` (text, not null, defaults to `supabase`) identifies where the media file is served from.
- `mux_asset_id` (text, nullable) stores the Mux asset identifier for lifecycle operations such as deletion.
- `mux_playback_id` (text, nullable) stores the public Mux playback identifier used to build the HLS playback URL.

2. Modified tables
- `content` receives the three non-destructive metadata columns above.
- Existing content remains available and is marked as served by `supabase`.

3. Security
- No access policy changes are made. The existing `content` RLS policies continue to govern these columns.
- The Mux secret is never stored in the database or exposed to the browser.

4. Important notes
- Existing rows are not deleted or rewritten beyond receiving the default provider value.
- Mux asset deletion will be performed by a server-side Edge Function using `mux_asset_id`.
*/

ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS media_provider text NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS mux_asset_id text,
  ADD COLUMN IF NOT EXISTS mux_playback_id text;

CREATE UNIQUE INDEX IF NOT EXISTS content_mux_asset_id_unique
  ON public.content (mux_asset_id)
  WHERE mux_asset_id IS NOT NULL;