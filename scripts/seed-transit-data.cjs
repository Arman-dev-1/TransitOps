require("dotenv").config();
const { Client } = require("pg");
const { randomUUID } = require("crypto");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("BEGIN");
  try {
    await client.query('DELETE FROM "Maintenance"');
    await client.query('DELETE FROM "Trip"');
    await client.query('DELETE FROM "Driver"');
    await client.query('DELETE FROM "Vehicle"');
    const vehicles = [[randomUUID(), "TO-101", "Metroline Electric 12m", "Electric bus", 70, 18420, "AVAILABLE"], [randomUUID(), "TO-214", "CityLink Hybrid", "Hybrid bus", 64, 42790, "ON_TRIP"], [randomUUID(), "TO-308", "Metroline Electric 12m", "Electric bus", 70, 21940, "IN_SHOP"], [randomUUID(), "TO-412", "Commuter XL", "Diesel bus", 82, 63510, "AVAILABLE"]];
    for (const vehicle of vehicles) await client.query('INSERT INTO "Vehicle" ("id", "regNumber", "name", "type", "maxLoadCapacity", "odometer", "status") VALUES ($1,$2,$3,$4,$5,$6,$7)', vehicle);
    const drivers = [[randomUUID(), "Aarav Mehta", "DL-803942", "2028-06-30", "ON_TRIP", 98], [randomUUID(), "Priya Shah", "DL-572184", "2027-09-14", "AVAILABLE", 96], [randomUUID(), "Rohan Iyer", "DL-915607", "2028-01-22", "ON_TRIP", 99], [randomUUID(), "Meera Nair", "DL-246818", "2027-03-08", "OFF_DUTY", 97]];
    for (const driver of drivers) await client.query('INSERT INTO "Driver" ("id", "name", "licenseNumber", "licenseExpiry", "status", "safetyScore") VALUES ($1,$2,$3,$4,$5,$6)', driver);
    const trips = [[randomUUID(), "Central Station", "Airport Terminal 2", 48, "DISPATCHED", vehicles[1][0], drivers[0][0]], [randomUUID(), "Riverside Depot", "Tech Park", 55, "DISPATCHED", vehicles[0][0], drivers[2][0]], [randomUUID(), "Old City", "University Campus", 42, "DRAFT", vehicles[3][0], drivers[1][0]]];
    for (const trip of trips) await client.query('INSERT INTO "Trip" ("id", "source", "destination", "cargoWeight", "status", "vehicleId", "driverId") VALUES ($1,$2,$3,$4,$5,$6,$7)', trip);
    await client.query('INSERT INTO "Maintenance" ("id", "vehicleId", "issue", "status") VALUES ($1,$2,$3,$4)', [randomUUID(), vehicles[2][0], "Battery cooling system inspection", "OPEN"]);
    await client.query('INSERT INTO "Maintenance" ("id", "vehicleId", "issue", "status") VALUES ($1,$2,$3,$4)', [randomUUID(), vehicles[3][0], "Scheduled brake inspection", "OPEN"]);
    await client.query("COMMIT"); console.log("Transit Ops operational data seeded.");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { await client.end(); }
}
main().catch((error) => { console.error(error); process.exit(1); });
