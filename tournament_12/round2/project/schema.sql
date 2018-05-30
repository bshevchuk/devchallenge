--
-- PostgreSQL syntax (use "serial" for incremental fields)
--

--
-- Judges
--
CREATE TABLE IF NOT EXISTS "judges" (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR NOT NULL
);

-- set unique index to "judges.username"
CREATE UNIQUE INDEX IF NOT EXISTS "index_judges_username" ON judges(username);

--
-- Availabilities
--
CREATE TABLE IF NOT EXISTS "availabilities" (
  id BIGSERIAL PRIMARY KEY,
  judge_id BIGINT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "availabilities_judge_date_start_end_idx" ON "availabilities"("judge_id", "date_start","date_end");
CREATE INDEX IF NOT EXISTS "availabilities_date_start_end_idx" ON "availabilities"("date_start","date_end");
