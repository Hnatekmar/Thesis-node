-- DB Schema
DROP TABLE IF EXISTS genome;
CREATE TABLE genome (
    id SERIAL PRIMARY KEY,
    fitness REAL,
    generation INTEGER,
    saveTime DATE
);

CREATE TYPE logType AS ENUM ('AVG', 'MIN', 'MAX');

DROP TABLE IF EXISTS GenerationStatistics;
CREATE TABLE GenerationStatistics (
    id INTEGER REFERENCES genome(id),
    genome JSON,
    type logType
);