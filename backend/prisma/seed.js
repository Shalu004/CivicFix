import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CivicFix database seeding (Ghaziabad, UP, India)...');

  const forceReset = process.env.FORCE_RESET_SEED === 'true';

  if (forceReset) {
    console.log('⚠️ FORCE_RESET_SEED is true. Clearing existing database records...');
    await prisma.statusHistory.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.user.deleteMany();
  } else {
    console.log('🛡️ Safe seed mode active. Preserving existing user and report data.');
  }

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const citizenPasswordHash = await bcrypt.hash('Citizen@12345', 10);

  // 1. Create or Update Admin (Safe Upsert)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@civicfix.local' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
      name: 'System Admin',
      email: 'admin@civicfix.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  // 2. Create or Update Citizens (Safe Upsert)
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@civicfix.local' },
    update: { name: 'Shalu Thakur', passwordHash: citizenPasswordHash, role: 'CITIZEN' },
    create: {
      name: 'Shalu Thakur',
      email: 'citizen@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  const citizen2 = await prisma.user.upsert({
    where: { email: 'priya@civicfix.local' },
    update: { passwordHash: citizenPasswordHash, role: 'CITIZEN' },
    create: {
      name: 'Priya Verma',
      email: 'priya@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  const citizen3 = await prisma.user.upsert({
    where: { email: 'amit@civicfix.local' },
    update: { passwordHash: citizenPasswordHash, role: 'CITIZEN' },
    create: {
      name: 'Amit Gupta',
      email: 'amit@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  console.log('✅ Demo Users verified/seeded:');
  console.log('   Admin:   admin@civicfix.local / Admin@12345');
  console.log('   Citizen: citizen@civicfix.local / Citizen@12345');

  // Check if sample issues already exist to prevent duplication on multiple seed runs
  const existingIssueCount = await prisma.issue.count();
  if (existingIssueCount > 0 && !forceReset) {
    console.log(`ℹ️ Database already contains ${existingIssueCount} issue records. Skipping demo issues creation.`);
    console.log('🎉 Seeding completed safely!');
    return;
  }

  // 3. Sample Ghaziabad Civic Issues (Demonstration / Seed Data)
  const sampleIssues = [
    {
      title: 'Large Pothole on Kala Pathar Road, Indirapuram',
      description: 'Demo report showing a 6-inch deep pothole causing severe traffic slowdowns and hazard for two-wheelers near Kala Pathar crossing.',
      category: 'POTHOLE',
      address: 'Kala Pathar Road, Nyay Khand 2, Indirapuram, Ghaziabad',
      latitude: 28.6369,
      longitude: 77.3698,
      status: 'VERIFIED',
      authenticity: 'VERIFIED',
      voteCount: 12,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted by citizen.' },
          { status: 'VERIFIED', note: 'Inspected by municipal road team; report confirmed.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Overflowing Sewage Line near Vaishali Metro Station',
      description: 'Demo report showing sewage water leaking onto pedestrian walkway near Sector 4 market and metro entrance.',
      category: 'SEWAGE',
      address: 'Sector 4, Near Vaishali Metro Station, Vaishali, Ghaziabad',
      latitude: 28.6476,
      longitude: 77.3828,
      status: 'IN_PROGRESS',
      authenticity: 'VERIFIED',
      voteCount: 18,
      reporterId: citizen2.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'VERIFIED', note: 'Municipal team assigned.', changedByAdminId: admin.id },
          { status: 'IN_PROGRESS', note: 'Drainage repair team dispatched with suction machine.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Uncollected Garbage Accumulation at Sector 10 Market',
      description: 'Demo report highlighting commercial waste bins overflowing near local shops and blocking pedestrian passage.',
      category: 'GARBAGE',
      address: 'Sector 10 Market, Vasundhara, Ghaziabad',
      latitude: 28.6606,
      longitude: 77.3782,
      status: 'PENDING',
      authenticity: 'UNVERIFIED',
      voteCount: 4,
      reporterId: citizen3.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' }
        ]
      }
    },
    {
      title: 'Flickering Streetlight on Raj Nagar Extension Main Road',
      description: 'Demo report showing streetlight unit SL-204 flickering rapidly and turning off at night near residential tower complex.',
      category: 'STREETLIGHT',
      address: 'Raj Nagar Extension Main Road, Ghaziabad',
      latitude: 28.7050,
      longitude: 77.4350,
      status: 'RESOLVED',
      authenticity: 'VERIFIED',
      voteCount: 9,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'VERIFIED', note: 'Electrical inspection completed.', changedByAdminId: admin.id },
          { status: 'IN_PROGRESS', note: 'Replacing faulty LED luminaire.', changedByAdminId: admin.id },
          { status: 'RESOLVED', note: 'New LED streetlight luminaire installed and tested.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Exposed Electrical Junction Box on Sidewalk',
      description: 'Demo report showing high-voltage electrical cable junction box cover missing near commercial complex.',
      category: 'ELECTRICITY',
      address: 'Kaushambi Central Park Road, Kaushambi, Ghaziabad',
      latitude: 28.6430,
      longitude: 77.3190,
      status: 'ESCALATED',
      authenticity: 'VERIFIED',
      voteCount: 22,
      reporterId: citizen2.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'ESCALATED', note: 'Automatically escalated: Community vote threshold of 10 votes reached.' }
        ]
      }
    },
    {
      title: 'Low Water Pressure and Turbid Water Supply',
      description: 'Demo report regarding low tap water pressure reported across residential block during morning supply hours.',
      category: 'WATER',
      address: 'GH-7 Boulevard, Crossings Republik, Ghaziabad',
      latitude: 28.6250,
      longitude: 77.4350,
      status: 'REJECTED',
      authenticity: 'SPAM',
      voteCount: 1,
      reporterId: citizen3.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'REJECTED', note: 'Duplicate report. Issue already registered under ticket #W-409.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Waterlogging on Site 4 Main Road',
      description: 'Demo report showing stagnant rainwater accumulation near factory gate creating difficulty for commuting workers.',
      category: 'OTHER',
      address: 'Site 4 Industrial Area, Sahibabad, Ghaziabad',
      latitude: 28.6720,
      longitude: 77.3510,
      status: 'PENDING',
      authenticity: 'UNVERIFIED',
      voteCount: 3,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' }
        ]
      }
    },
    {
      title: 'Damaged Footpath Slabs near District Center',
      description: 'Demo report showing broken concrete slabs on pedestrian walking track near commercial center.',
      category: 'POTHOLE',
      address: 'Block 10, Raj Nagar, Ghaziabad',
      latitude: 28.6830,
      longitude: 77.4470,
      status: 'IN_PROGRESS',
      authenticity: 'VERIFIED',
      voteCount: 7,
      reporterId: citizen2.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'VERIFIED', note: 'Civil maintenance team assigned.', changedByAdminId: admin.id },
          { status: 'IN_PROGRESS', note: 'Footpath paving tiles being replaced.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Garbage Dumping near Bypass Flyover Ramp',
      description: 'Demo report highlighting illegal plastic and construction debris dumping along roadside slope.',
      category: 'GARBAGE',
      address: 'Bypass Road, Vijay Nagar, Ghaziabad',
      latitude: 28.6490,
      longitude: 77.4390,
      status: 'VERIFIED',
      authenticity: 'VERIFIED',
      voteCount: 11,
      reporterId: citizen3.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' },
          { status: 'VERIFIED', note: 'Sanitation inspector verified site.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Faulty Distribution Transformer Sparking',
      description: 'Demo report showing roadside transformer unit sparking during high load periods.',
      category: 'ELECTRICITY',
      address: 'C-Block, Kavi Nagar, Ghaziabad',
      latitude: 28.6740,
      longitude: 77.4520,
      status: 'PENDING',
      authenticity: 'UNVERIFIED',
      voteCount: 5,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Demo report submitted.' }
        ]
      }
    }
  ];

  for (const issueData of sampleIssues) {
    const createdIssue = await prisma.issue.create({
      data: issueData
    });

    // Seed votes
    if (createdIssue.voteCount > 0) {
      const voters = [citizen, citizen2, citizen3];
      for (let i = 0; i < Math.min(createdIssue.voteCount, voters.length); i++) {
        await prisma.vote.create({
          data: {
            userId: voters[i].id,
            issueId: createdIssue.id
          }
        }).catch(() => {}); // ignore unique constraint duplicates
      }
    }
  }

  console.log(`✅ Seeded ${sampleIssues.length} Ghaziabad sample issues with votes and history timeline.`);
  console.log('🎉 Ghaziabad seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
