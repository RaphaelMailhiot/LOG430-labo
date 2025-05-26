import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../data/magasin.db');
export const db = new Database(dbPath);

// Création des tables si nécessaire
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  sale_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY(sale_id) REFERENCES sales(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`);


// Insertion de données initiales si la table products est vide
const row = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
const count = row.c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, stock)
    VALUES (?, ?, ?, ?)
  `);
  insert.run('Clavier', 'Informatique', 49.99, 20);
  insert.run('Souris', 'Informatique', 19.99, 35);
  insert.run('Écran', 'Informatique', 199.99, 10);
  insert.run('Câble HDMI', 'Accessoires', 9.99, 50);
  insert.run('Casque audio', 'Audio', 59.99, 15);
}