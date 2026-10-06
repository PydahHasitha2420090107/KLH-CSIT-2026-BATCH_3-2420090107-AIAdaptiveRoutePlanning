import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { seedDatabase } from './seed.js'

const dbFilePath = env.databaseUrl.replace(/^file:/, '')
const effectiveDbPath = env.nodeEnv === 'test' ? ':memory:' : dbFilePath
export const db = new Database(effectiveDbPath)

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
    status TEXT NOT NULL CHECK(status IN ('Available','In Use','Maintenance','AVAILABLE','ON_TRIP','ACTIVE','INACTIVE','On Trip','Inactive')),
    condition TEXT NOT NULL CHECK(condition IN ('Excellent','Good','Fair','Poor','EXCELLENT','GOOD','FAIR','POOR')),
    mileage INTEGER NOT NULL,
    fuel_efficiency REAL NOT NULL,
    maintenance_risk INTEGER NOT NULL,
    assigned_driver_id TEXT,
    fuel_level INTEGER NOT NULL,
    maintenance_due TEXT NOT NULL,
    capacity INTEGER DEFAULT 1,
    fuel_type TEXT DEFAULT 'diesel',
    driver_id TEXT,
    last_maintenance TEXT,
    next_maintenance TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    license TEXT NOT NULL,
    availability TEXT NOT NULL CHECK(availability IN ('Available','On Trip','Off Duty','available','on_trip','off_duty')),
    assigned_vehicle_id TEXT,
    current_trip_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('Active','Inactive','active','inactive')),
    license_number TEXT,
    license_expiry TEXT,
    assigned_vehicle TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id)
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Pending','Assigned','In Transit','Delayed','Delivered','REQUESTED','ASSIGNED','PICKUP_STARTED','LOADING','IN_TRANSIT','NEAR_DESTINATION','CANCELLED','PENDING','Completed','Cancelled')),
    vehicle TEXT NOT NULL,
    driver TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('Low','Medium','High','LOW','MEDIUM','HIGH')),
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
    pickup_location TEXT,
    pickup_address TEXT,
    destination_address TEXT,
    material_type TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    assigned_vehicle_id TEXT,
    assigned_driver_id TEXT,
    estimated_time TEXT,
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
    status TEXT NOT NULL CHECK(status IN ('Planned','In Progress','Completed','STARTED','IN_PROGRESS','CANCELLED','PLANNED','completed','cancelled')),
    route TEXT NOT NULL,
    vehicle_id TEXT,
    driver_id TEXT,
    start_time TEXT,
    end_time TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(shipment_id) REFERENCES shipments(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('info','warning','success','critical','INFO','WARNING','SUCCESS','CRITICAL')),
    role TEXT NOT NULL CHECK(role IN ('all','user','driver','manager')),
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notification_reads (
    notification_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    maintenance_type TEXT,
    service_date TEXT,
    cost REAL,
    next_service_date TEXT,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_shipments_customer ON shipments(customer_id);
  CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
  CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
  CREATE INDEX IF NOT EXISTS idx_drivers_availability ON drivers(availability);
`)

const migrations: Record<string, string[]> = {
  vehicles: [
    'capacity INTEGER DEFAULT 1',
    "fuel_type TEXT DEFAULT 'diesel'",
    'driver_id TEXT',
    'last_maintenance TEXT',
    'next_maintenance TEXT',
  ],
  drivers: ['license_number TEXT', 'license_expiry TEXT', 'assigned_vehicle TEXT'],
  shipments: [
    'pickup_location TEXT',
    'pickup_address TEXT',
    'destination_address TEXT',
    'material_type TEXT',
    'preferred_date TEXT',
    'preferred_time TEXT',
    'assigned_vehicle_id TEXT',
    'assigned_driver_id TEXT',
    'estimated_time TEXT',
  ],
  trips: ['vehicle_id TEXT', 'driver_id TEXT', 'start_time TEXT', 'end_time TEXT', 'created_at TEXT'],
  notifications: ['title TEXT'],
  maintenance_records: ['maintenance_type TEXT', 'service_date TEXT', 'cost REAL', 'next_service_date TEXT'],
}

for (const [table, definitions] of Object.entries(migrations)) {
  const existingColumns = new Set((db.pragma(`table_info(${table})`) as Array<{ name: string }>).map((column) => column.name))
  for (const definition of definitions) {
    const columnName = definition.split(' ', 1)[0]
    if (!existingColumns.has(columnName)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`)
    }
  }
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_drivers_user ON drivers(user_id);
  CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(assigned_driver_id);
  CREATE INDEX IF NOT EXISTS idx_shipments_driver ON shipments(driver);
  CREATE INDEX IF NOT EXISTS idx_shipments_assigned_driver ON shipments(assigned_driver_id);
  CREATE INDEX IF NOT EXISTS idx_shipments_assigned_vehicle ON shipments(assigned_vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_trips_shipment ON trips(shipment_id);
  CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
  CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_records(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
`)

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash)
}

if (env.nodeEnv !== 'production') {
  seedDatabase()
}

db.exec(`
  CREATE TRIGGER IF NOT EXISTS validate_driver_references_insert
  BEFORE INSERT ON drivers
  WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id)
    OR (NEW.assigned_vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.assigned_vehicle_id))
    OR (NEW.current_trip_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM trips WHERE id = NEW.current_trip_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid driver relationship');
  END;

  CREATE TRIGGER IF NOT EXISTS validate_driver_references_update
  BEFORE UPDATE OF user_id, assigned_vehicle_id, current_trip_id ON drivers
  WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id)
    OR (NEW.assigned_vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.assigned_vehicle_id))
    OR (NEW.current_trip_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM trips WHERE id = NEW.current_trip_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid driver relationship');
  END;

  CREATE TRIGGER IF NOT EXISTS validate_shipment_references_insert
  BEFORE INSERT ON shipments
  WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.customer_id)
    OR (NEW.assigned_vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.assigned_vehicle_id))
    OR (NEW.assigned_driver_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM drivers WHERE id = NEW.assigned_driver_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid shipment relationship');
  END;

  CREATE TRIGGER IF NOT EXISTS validate_shipment_references_update
  BEFORE UPDATE OF customer_id, assigned_vehicle_id, assigned_driver_id ON shipments
  WHEN NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.customer_id)
    OR (NEW.assigned_vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.assigned_vehicle_id))
    OR (NEW.assigned_driver_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM drivers WHERE id = NEW.assigned_driver_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid shipment relationship');
  END;

  CREATE TRIGGER IF NOT EXISTS validate_trip_references_insert
  BEFORE INSERT ON trips
  WHEN NOT EXISTS (SELECT 1 FROM shipments WHERE id = NEW.shipment_id)
    OR (NEW.vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.vehicle_id))
    OR (NEW.driver_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM drivers WHERE id = NEW.driver_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid trip relationship');
  END;

  CREATE TRIGGER IF NOT EXISTS validate_trip_references_update
  BEFORE UPDATE OF shipment_id, vehicle_id, driver_id ON trips
  WHEN NOT EXISTS (SELECT 1 FROM shipments WHERE id = NEW.shipment_id)
    OR (NEW.vehicle_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vehicles WHERE id = NEW.vehicle_id))
    OR (NEW.driver_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM drivers WHERE id = NEW.driver_id))
  BEGIN
    SELECT RAISE(ABORT, 'invalid trip relationship');
  END;
`)

export function ensureUserSeed() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count === 0) {
    seedDatabase()
  }
}

export function getDb() {
  return db
}
