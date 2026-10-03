-- Raised by Keya reviewing #224 (#181).
--
-- validateNewReading() in temperature-utils.ts refuses anything outside
-- 90-110 F, but that is application-side only. temperature_readings is
-- insertable by any authenticated user under the "own temperature readings"
-- RLS policy, so a direct PostgREST request or a future code path that skips
-- the helper can still store a physiologically impossible reading. RLS decides
-- WHOSE row it is, not whether the value makes sense.
--
-- 90 and 110 are the same bounds as MIN_TEMP_F / MAX_TEMP_F in
-- temperature-utils.ts and the same bounds validate() uses in
-- packages/fever-rules. All three have to move together if they ever move.
--
-- This is a range check, not a fever threshold. Nothing here says a reading is
-- normal, raised or serious. ADR-007.

alter table temperature_readings
  add constraint temperature_readings_temp_f_range
  check (temp_f between 90 and 110);
