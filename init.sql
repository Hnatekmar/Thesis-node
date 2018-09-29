-- DB Schema

CREATE TABLE genome (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genome JSON,
    fitness REAL,
    generation INTEGER,
    saveTime DATE
);