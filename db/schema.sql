-- DB bootstrap (optional for persistent DBs)
CREATE TABLE IF NOT EXISTS leads(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  product TEXT,
  message TEXT
);
CREATE TABLE IF NOT EXISTS views(
  name TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
);
