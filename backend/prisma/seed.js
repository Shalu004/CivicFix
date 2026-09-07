import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CivicFix database seeding...');

  // Clean existing data
  await prisma.statusHistory.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const citizenPasswordHash = await bcrypt.hash('Citizen@12345', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@civicfix.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  // 2. Create Citizen
  const citizen = await prisma.user.create({
    data: {
      name: 'John Citizen',
      email: 'citizen@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  // 3. Additional Citizens for realistic voting data
  const citizen2 = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  const citizen3 = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'david@civicfix.local',
      passwordHash: citizenPasswordHash,
      role: 'CITIZEN'
    }
  });

  console.log('✅ Users seeded:');
  console.log('   Admin:   admin@civicfix.local / Admin@12345');
  console.log('   Citizen: citizen@civicfix.local / Citizen@12345');

  // 4. Sample Issues
  const sampleIssues = [
    {
      title: 'Dangerous Pothole on Main Street Crossing',
      description: 'Large 8-inch deep pothole causing severe traffic slowdowns and damage to vehicle tires. Needs urgent asphalt repair.',
      category: 'POTHOLE',
      address: '104 Main Street, Downtown Sector 4',
      latitude: 40.7128,
      longitude: -74.0060,
      status: 'VERIFIED',
      authenticity: 'VERIFIED',
      voteCount: 12,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Reported by citizen.' },
          { status: 'VERIFIED', note: 'Inspected by field inspector; report confirmed.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Overflowing Sewage Line near Community Park',
      description: 'Sewage water leaking onto sidewalk near the children playground entrance, creating severe odor and hygiene concerns.',
      category: 'SEWAGE',
      address: '45 Park Avenue, Westside',
      latitude: 40.7150,
      longitude: -74.0090,
      status: 'IN_PROGRESS',
      authenticity: 'VERIFIED',
      voteCount: 18,
      reporterId: citizen2.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Report submitted.' },
          { status: 'VERIFIED', note: 'Municipal team assigned.', changedByAdminId: admin.id },
          { status: 'IN_PROGRESS', note: 'Water sanitation crew dispatched to replace broken pipe section.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Uncollected Garbage Accumulation at Market Square',
      description: 'Commercial waste bins overflowing for 3 consecutive days. Trash blocking pedestrian walkway.',
      category: 'GARBAGE',
      address: '12 Market Square, Central District',
      latitude: 40.7180,
      longitude: -74.0020,
      status: 'PENDING',
      authenticity: 'UNVERIFIED',
      voteCount: 4,
      reporterId: citizen3.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Report submitted.' }
        ]
      }
    },
    {
      title: 'Flickering Streetlight near School Bus Stop',
      description: 'Streetlight #SL-402 flickering rapidly and going pitch dark at night, endangering children during evening activities.',
      category: 'STREETLIGHT',
      address: '88 Elm Street, North Ward',
      latitude: 40.7220,
      longitude: -74.0110,
      status: 'RESOLVED',
      authenticity: 'VERIFIED',
      voteCount: 9,
      reporterId: citizen.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Report submitted.' },
          { status: 'VERIFIED', note: 'Inspected by electrical department.', changedByAdminId: admin.id },
          { status: 'IN_PROGRESS', note: 'Replacing LED fixture unit.', changedByAdminId: admin.id },
          { status: 'RESOLVED', note: 'New LED luminaire installed and tested successfully.', changedByAdminId: admin.id }
        ]
      }
    },
    {
      title: 'Exposed Electrical Junction Box on Sidewalk',
      description: 'High voltage junction box cover is missing, exposing bare wires within reach of pedestrians.',
      category: 'ELECTRICITY',
      address: '302 Broadway St, Eastside',
      latitude: 40.7110,
      longitude: -73.9980,
      status: 'ESCALATED',
      authenticity: 'VERIFIED',
      voteCount: 22,
      reporterId: citizen2.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Report submitted.' },
          { status: 'ESCALATED', note: 'Automatically escalated: Threshold of 10 votes reached.' }
        ]
      }
    },
    {
      title: 'Low Water Pressure and Discolored Water Supply',
      description: 'Multiple housing units reporting muddy tap water and low pressure since morning.',
      category: 'WATER',
      address: '55 Riverfront Drive, Southside',
      latitude: 40.7080,
      longitude: -74.0150,
      status: 'REJECTED',
      authenticity: 'SPAM',
      voteCount: 1,
      reporterId: citizen3.id,
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Report submitted.' },
          { status: 'REJECTED', note: 'Duplicate report. Issue already being addressed under ticket #W-804.', changedByAdminId: admin.id }
        ]
      }
    }
  ];

  for (const issueData of sampleIssues) {
    const createdIssue = await prisma.issue.create({
      data: issueData
    });

    // Seed some votes
    if (createdIssue.voteCount > 0) {
      const voters = [citizen, citizen2, citizen3];
      for (let i = 0; i < Math.min(createdIssue.voteCount, voters.length); i++) {
        await prisma.vote.create({
          data: {
            userId: voters[i].id,
            issueId: createdIssue.id
          }
        }).catch(() => {}); // ignore unique constraint duplicate seeding
      }
    }
  }

  console.log(`✅ Seeded ${sampleIssues.length} sample issues with votes and history timeline.`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
