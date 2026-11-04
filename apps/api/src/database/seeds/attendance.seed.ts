import { db } from '../drizzle.client';
import { employees, Employee } from '../schema/employees';
import { attendanceRecords } from '../schema/attendance';
import { exceptions } from '../schema/exceptions';
import { Location } from '../schema/locations';
import { User } from '../schema/users';

export async function seedAttendance(
  locationsList: Location[],
  usersList: User[]
) {
  console.log('Seeding employees, attendance records, and exception audits...');

  const chn1 = locationsList.find((l) => l.name === 'CHN-1') || locationsList[0];
  const blr1 = locationsList.find((l) => l.name === 'BLR-1') || locationsList[0];
  const blr3 = locationsList.find((l) => l.name === 'BLR-3') || locationsList[0];

  const anita = usersList.find((u) => u.name === 'Anita Menon') || usersList[0];
  const sarah = usersList.find((u) => u.name === 'Sarah Mitchell') || usersList[0];

  const employeeData = [
    {
      employeeCode: 'TRIL-4821',
      name: 'Ravi Kumar',
      department: 'Engineering',
      role: 'Senior Frontend Dev',
      assignedLocationId: chn1?.id,
      reportingManagerName: 'Anita Menon',
      reportingManagerId: anita?.id,
      email: 'ravi.kumar@company.com',
    },
    {
      employeeCode: 'TRIL-4822',
      name: 'Priya S',
      department: 'Engineering',
      role: 'Backend Architect',
      assignedLocationId: chn1?.id,
      reportingManagerName: 'Anita Menon',
      reportingManagerId: anita?.id,
      email: 'priya.s@company.com',
    },
    {
      employeeCode: 'TRIL-4823',
      name: 'Arun Das',
      department: 'Product',
      role: 'Technical Product Manager',
      assignedLocationId: blr1?.id,
      reportingManagerName: 'Sarah Mitchell',
      reportingManagerId: sarah?.id,
      email: 'arun.das@company.com',
    },
    {
      employeeCode: 'TRIL-4824',
      name: 'Nithya R',
      department: 'Operations',
      role: 'Site Coordinator',
      assignedLocationId: chn1?.id,
      reportingManagerName: 'Anita Menon',
      reportingManagerId: anita?.id,
      email: 'nithya.r@company.com',
    },
    {
      employeeCode: 'TRIL-4825',
      name: 'Vikram T',
      department: 'DevOps',
      role: 'Site Reliability Engineer',
      assignedLocationId: blr3?.id,
      reportingManagerName: 'Sarah Mitchell',
      reportingManagerId: sarah?.id,
      email: 'vikram.t@company.com',
    },
  ];

  const insertedEmployees: Employee[] = [];
  for (const emp of employeeData) {
    const [inserted] = await db
      .insert(employees)
      .values(emp)
      .onConflictDoUpdate({
        target: employees.employeeCode,
        set: {
          name: emp.name,
          department: emp.department,
          role: emp.role,
          assignedLocationId: emp.assignedLocationId,
          reportingManagerName: emp.reportingManagerName,
          reportingManagerId: emp.reportingManagerId,
        },
      })
      .returning();
    if (inserted) insertedEmployees.push(inserted);
  }

  const ravi = insertedEmployees.find((e) => e.employeeCode === 'TRIL-4821');
  const priya = insertedEmployees.find((e) => e.employeeCode === 'TRIL-4822');
  const arun = insertedEmployees.find((e) => e.employeeCode === 'TRIL-4823');
  const vikram = insertedEmployees.find((e) => e.employeeCode === 'TRIL-4825');

  const now = new Date();
  const todayAt = (hours: number, minutes: number) => {
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const daysAgoAt = (days: number, hours: number, minutes: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // 1. Ravi Kumar's check-in outside geofence (Rejected)
  if (ravi && chn1) {
    const [raviRecord] = await db
      .insert(attendanceRecords)
      .values({
        employeeId: ravi.id,
        locationId: chn1.id,
        attemptedCheckInAt: todayAt(9, 2),
        selfieCapuredAt: todayAt(9, 14),
        checkOutAt: todayAt(18, 15),
        latitude: '13.0228000',
        longitude: '80.2195000',
        gpsAccuracyMeters: '8.00',
        isMockLocation: false,
        distanceFromBoundaryMeters: '900.00',
        livenessPassed: true,
        blinkAttemptCount: 1,
        status: 'Rejected',
        siteNameSnapshot: chn1.name,
      })
      .returning();

    // Create Exception for Ravi's geofence breach
    if (raviRecord) {
      await db.insert(exceptions).values({
        attendanceRecordId: raviRecord.id,
        employeeId: ravi.id,
        type: 'GEOFENCE',
        status: 'Pending',
      });
    }

    // Historical records for Ravi (AM 05 detail view)
    const pastRecords = [
      { days: 1, inH: 9, inM: 12, outH: 18, outM: 8, status: 'Present' },
      { days: 2, inH: 9, inM: 38, outH: 18, outM: 22, status: 'Late' },
      { days: 3, inH: 8, inM: 58, outH: 17, outM: 45, status: 'Present' },
      { days: 4, inH: 9, inM: 4, outH: 18, outM: 1, status: 'Present' },
    ];

    for (const pr of pastRecords) {
      await db.insert(attendanceRecords).values({
        employeeId: ravi.id,
        locationId: chn1.id,
        attemptedCheckInAt: daysAgoAt(pr.days, pr.inH, pr.inM),
        checkOutAt: daysAgoAt(pr.days, pr.outH, pr.outM),
        latitude: chn1.latitude,
        longitude: chn1.longitude,
        gpsAccuracyMeters: '6.50',
        isMockLocation: false,
        distanceFromBoundaryMeters: '0.00',
        livenessPassed: true,
        status: pr.status,
        siteNameSnapshot: chn1.name,
      });
    }
  }

  // 2. Priya S inside CHN-1 (Present)
  if (priya && chn1) {
    await db.insert(attendanceRecords).values({
      employeeId: priya.id,
      locationId: chn1.id,
      attemptedCheckInAt: todayAt(9, 14),
      checkOutAt: todayAt(18, 0),
      latitude: chn1.latitude,
      longitude: chn1.longitude,
      gpsAccuracyMeters: '5.00',
      isMockLocation: false,
      distanceFromBoundaryMeters: '0.00',
      livenessPassed: true,
      status: 'Present',
      siteNameSnapshot: chn1.name,
    });
  }

  // 3. Arun Das (Late: 09:42 AM > 09:30 AM cutoff)
  if (arun && blr1) {
    await db.insert(attendanceRecords).values({
      employeeId: arun.id,
      locationId: blr1.id,
      attemptedCheckInAt: todayAt(9, 42),
      latitude: blr1.latitude,
      longitude: blr1.longitude,
      gpsAccuracyMeters: '7.20',
      isMockLocation: false,
      distanceFromBoundaryMeters: '0.00',
      livenessPassed: true,
      status: 'Late',
      siteNameSnapshot: blr1.name,
    });
  }

  // 4. Vikram T (Present)
  if (vikram && blr3) {
    await db.insert(attendanceRecords).values({
      employeeId: vikram.id,
      locationId: blr3.id,
      attemptedCheckInAt: todayAt(8, 58),
      checkOutAt: todayAt(17, 30),
      latitude: blr3.latitude,
      longitude: blr3.longitude,
      gpsAccuracyMeters: '4.80',
      isMockLocation: false,
      distanceFromBoundaryMeters: '0.00',
      livenessPassed: true,
      status: 'Present',
      siteNameSnapshot: blr3.name,
    });
  }

  console.log(`Seeded ${insertedEmployees.length} employees and related records.`);
}
