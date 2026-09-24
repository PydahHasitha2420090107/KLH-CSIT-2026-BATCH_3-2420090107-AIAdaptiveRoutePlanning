import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { seedDatabase } from './seed.js'

const dbFilePath = env.databaseUrl.replace('file:', '')
export const db = new Database(dbFilePath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user','driver','manager'))
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    registration_number TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Available','In Use','Maintenance')),
    condition TEXT NOT NULL CHECK(condition IN ('Excellent','Good','Fair','Poor')),
    mileage INTEGER NOT NULL,
    fuel_efficiency REAL NOT NULL,
    maintenance_risk INTEGER NOT NULL,
    assigned_driver_id TEXT,
    fuel_level INTEGER NOT NULL,
    maintenance_due TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    license TEXT NOT NULL,
    availability TEXT NOT NULL CHECK(availability IN ('Available','On Trip','Off Duty')),
    assigned_vehicle_id TEXT,
    current_trip_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('Active','Inactive')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (current_trip_id) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending','Assigned','In Transit','Delayed','Delivered')),
    vehicle TEXT NOT NULL,
    driver TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('Low','Medium','High')),
    estimated_delivery TEXT NOT NULL,
    current_location TEXT NOT NULL,
    progress INTEGER NOT NULL,
    type TEXT NOT NULL,
    weight TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    special_handling TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_contact TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_contact TEXT NOT NULL,
    route TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance TEXT NOT NULL,
    estimated_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Planned','In Progress','Completed')),
    route TEXT NOT NULL,
    FOREIGN KEY(shipment_id) REFERENCES shipments(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('info','warning','success','critical')),
    role TEXT NOT NULL CHECK(role IN ('all','user','driver','manager')),
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_recommendations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    score INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Low','Medium','High')),
    recommendation TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('maintenance','fuel','route','allocation'))
  );

  CREATE TABLE IF NOT EXISTS service_health (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('ONLINE','DEGRADED','OFFLINE')),
    description TEXT NOT NULL,
    detail TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  );
`)

const defaultUser = 'customer@smartfleet.io'
const users = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultUser) as { id?: string } | undefined
if (!users) {
  seedDatabase()
}

export function ensureUserSeed() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count === 0) {
    seedDatabase()
  }
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash)
}

export function getDb() {
  return db
}
