import { prisma } from "./prisma";

export async function getOperationsSnapshot() {
  const [vehicles, drivers, trips, maintenance] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { regNumber: "asc" } }),
    prisma.driver.findMany(),
    prisma.trip.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { vehicle: true, driver: true } }),
    prisma.maintenance.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 6, include: { vehicle: true } }),
  ]);

  return {
    metrics: {
      activeVehicles: vehicles.filter((item) => item.status === "ON_TRIP").length,
      availableVehicles: vehicles.filter((item) => item.status === "AVAILABLE").length,
      inMaintenance: vehicles.filter((item) => item.status === "IN_SHOP").length,
      activeTrips: trips.filter((item) => item.status === "DISPATCHED").length,
      driversOnDuty: drivers.filter((item) => item.status === "ON_TRIP").length,
    },
    vehicles,
    trips,
    alerts: maintenance.map((item) => ({
      id: item.id,
      vehicle: item.vehicle.regNumber,
      issue: item.issue,
      status: item.status,
      createdAt: item.createdAt,
    })),
  };
}
