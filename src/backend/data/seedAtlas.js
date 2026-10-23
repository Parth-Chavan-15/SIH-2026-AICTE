import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_workflow';

export const SEED_APPLICATIONS = [
  {
    applicationNumber: 'AICTE-2026-WR-10921',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    institutionCode: '1-1049281',
    region: 'Western',
    state: 'Maharashtra',
    city: 'Pune',
    applicationType: 'Extension of Approval (EoA)',
    academicYear: '2027-28',
    program: 'Engineering & Technology',
    proposedIntake: 840,
    routeType: 'Scrutiny Only',
    currentStage: 'Scrutiny in Progress',
    currentStageStartedAt: new Date(Date.now() - 4 * 86400000),
    submittedAt: new Date(Date.now() - 7 * 86400000),
    stageDeadlineDays: 7,
    assignedOfficer: 'Shri R. K. Deshmukh (WRO)',
    priority: 'Medium',
    slaStatus: 'within_sla',
    isEscalated: false,
    documents: [
      {
        name: 'Land & Building Title Deed',
        category: 'Land & Building',
        fileName: 'COEP_Land_Deed_Registered.pdf',
        fileSize: '4.2 MB',
        uploadedAt: new Date(Date.now() - 7 * 86400000),
        verified: true,
        verifiedBy: 'Shri R. K. Deshmukh',
        verificationDate: new Date(Date.now() - 3 * 86400000),
        status: 'Verified',
      },
      {
        name: 'Fire Safety NOC',
        category: 'Land & Building',
        fileName: 'Fire_NOC_PMC_Pune.pdf',
        fileSize: '1.8 MB',
        uploadedAt: new Date(Date.now() - 7 * 86400000),
        verified: true,
        verifiedBy: 'Shri R. K. Deshmukh',
        verificationDate: new Date(Date.now() - 3 * 86400000),
        status: 'Verified',
        expiryDate: new Date(Date.now() + 600 * 86400000),
      },
    ],
    observations: [],
    timeline: [
      {
        stage: 'Application Submitted',
        action: 'Application submitted online with statutory fees paid',
        actorName: 'Dr. Arvind Mehta',
        actorRole: 'Principal & Authorized Signatory',
        timestamp: new Date(Date.now() - 7 * 86400000),
        status: 'completed',
        durationDays: 3,
      },
      {
        stage: 'Scrutiny in Progress',
        action: 'Assigned to Western Regional Office for document scrutiny',
        actorName: 'Shri R. K. Deshmukh',
        actorRole: 'Regional Officer (WRO)',
        timestamp: new Date(Date.now() - 4 * 86400000),
        status: 'active',
        durationDays: 4,
      },
    ],
  },
  {
    applicationNumber: 'AICTE-2026-NR-33104',
    institutionName: 'Apex Institute of Technology & Management',
    institutionCode: '1-3382910',
    region: 'Northern',
    state: 'Uttar Pradesh',
    city: 'Kanpur',
    applicationType: 'Increase in Intake / Additional Course',
    academicYear: '2027-28',
    program: 'Engineering & Technology',
    proposedIntake: 600,
    routeType: 'Scrutiny + EVC + SAC/SHC',
    currentStage: 'Deficiency Communicated',
    currentStageStartedAt: new Date(Date.now() - 17 * 86400000),
    submittedAt: new Date(Date.now() - 32 * 86400000),
    stageDeadlineDays: 10,
    assignedOfficer: 'Shri Manoj Kumar Tiwari (NRO)',
    priority: 'High',
    slaStatus: 'overdue',
    isEscalated: true,
    escalatedTo: 'Dr. Sunita Sharma (Director Approval Bureau)',
    documents: [
      {
        name: 'Building Structural Stability Certificate',
        category: 'Land & Building',
        fileName: 'Apex_Structural_Cert_PWD.pdf',
        fileSize: '2.1 MB',
        uploadedAt: new Date(Date.now() - 32 * 86400000),
        verified: false,
        status: 'Rejected',
        rejectionReason: 'Certificate expired on 30-Aug-2026. Needs renewal from Govt empaneled structural engineer.',
      },
    ],
    observations: [
      {
        stage: 'Deficiency Communicated',
        authorName: 'Shri Manoj Kumar Tiwari',
        authorRole: 'Regional Officer (NRO)',
        timestamp: new Date(Date.now() - 17 * 86400000),
        type: 'Deficiency',
        comment: 'Mandatory structural certificate is expired. Institution must upload fresh endorsement.',
        mandatoryResolutionRequired: true,
        resolved: false,
      },
    ],
    timeline: [
      {
        stage: 'Application Submitted',
        action: 'Application submitted online',
        actorName: 'Dr. Ramesh Chandra',
        actorRole: 'Principal',
        timestamp: new Date(Date.now() - 32 * 86400000),
        status: 'completed',
        durationDays: 5,
      },
      {
        stage: 'Deficiency Communicated',
        action: 'Structural certificate deficiency communicated to college',
        actorName: 'Shri Manoj Kumar Tiwari',
        actorRole: 'Regional Officer',
        timestamp: new Date(Date.now() - 17 * 86400000),
        status: 'overdue',
        durationDays: 17,
      },
    ],
  },
  {
    applicationNumber: 'AICTE-2026-SR-44029',
    institutionName: 'Madras Institute of Applied Sciences & Research',
    institutionCode: '1-4491022',
    region: 'Southern',
    state: 'Tamil Nadu',
    city: 'Chennai',
    applicationType: 'New Technical Institution',
    academicYear: '2027-28',
    program: 'Engineering & Technology',
    proposedIntake: 360,
    routeType: 'Scrutiny + EVC + SAC/SHC',
    currentStage: 'EVC Scheduled',
    currentStageStartedAt: new Date(Date.now() - 3 * 86400000),
    submittedAt: new Date(Date.now() - 21 * 86400000),
    stageDeadlineDays: 15,
    assignedOfficer: 'Dr. V. Soundararajan (SRO)',
    priority: 'High',
    slaStatus: 'within_sla',
    isEscalated: false,
    documents: [],
    observations: [],
    timeline: [
      {
        stage: 'Application Submitted',
        action: 'Submitted with initial fee',
        actorName: 'Dr. K. Swaminathan',
        actorRole: 'Director',
        timestamp: new Date(Date.now() - 21 * 86400000),
        status: 'completed',
      },
      {
        stage: 'Scrutiny Cleared',
        action: 'All statutory documents scrutinized and verified',
        actorName: 'Dr. V. Soundararajan',
        actorRole: 'Regional Officer (SRO)',
        timestamp: new Date(Date.now() - 5 * 86400000),
        status: 'completed',
      },
      {
        stage: 'EVC Scheduled',
        action: 'Expert Visit Committee constituted and visit confirmed',
        actorName: 'Prof. S. K. Ramanathan',
        actorRole: 'EVC Committee Chair',
        timestamp: new Date(Date.now() - 3 * 86400000),
        status: 'active',
      },
    ],
  },
  {
    applicationNumber: 'AICTE-2026-ER-55102',
    institutionName: 'Bengal Institute of Technology & Management',
    institutionCode: '1-5582910',
    region: 'Eastern',
    state: 'West Bengal',
    city: 'Kolkata',
    applicationType: 'Extension of Approval (EoA)',
    academicYear: '2027-28',
    program: 'Management (MBA)',
    proposedIntake: 180,
    routeType: 'Scrutiny Only',
    currentStage: 'Approval Issued',
    currentStageStartedAt: new Date(Date.now() - 2 * 86400000),
    submittedAt: new Date(Date.now() - 25 * 86400000),
    stageDeadlineDays: 7,
    assignedOfficer: 'Shri A. K. Banerjee (ERO)',
    priority: 'Low',
    slaStatus: 'within_sla',
    isEscalated: false,
    documents: [],
    observations: [],
    timeline: [
      {
        stage: 'Application Submitted',
        action: 'Application filed online',
        actorName: 'Dr. Debabrata Roy',
        actorRole: 'Director',
        timestamp: new Date(Date.now() - 25 * 86400000),
        status: 'completed',
      },
      {
        stage: 'Approval Issued',
        action: 'EoA Order issued with digital signature',
        actorName: 'Dr. Sunita Sharma',
        actorRole: 'Director (Approval Bureau)',
        timestamp: new Date(Date.now() - 2 * 86400000),
        status: 'completed',
      },
    ],
  },
  {
    applicationNumber: 'AICTE-2026-CR-66219',
    institutionName: 'Bhopal Institute of Engineering & Technology',
    institutionCode: '1-6629103',
    region: 'Central',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    applicationType: 'Introduction of Supernumerary Seats (FN/PIO/OCI)',
    academicYear: '2027-28',
    program: 'Engineering & Technology',
    proposedIntake: 60,
    routeType: 'Scrutiny Only',
    currentStage: 'Scrutiny in Progress',
    currentStageStartedAt: new Date(Date.now() - 2 * 86400000),
    submittedAt: new Date(Date.now() - 5 * 86400000),
    stageDeadlineDays: 7,
    assignedOfficer: 'Dr. P. K. Mishra (CRO)',
    priority: 'Medium',
    slaStatus: 'within_sla',
    isEscalated: false,
    documents: [],
    observations: [],
    timeline: [],
  },
  {
    applicationNumber: 'AICTE-2026-SW-77182',
    institutionName: 'Karnataka Global Academy of Technology',
    institutionCode: '1-7729104',
    region: 'South-Western',
    state: 'Karnataka',
    city: 'Bengaluru',
    applicationType: 'Increase in Intake / Additional Course',
    academicYear: '2027-28',
    program: 'Engineering & Technology (AI & DS)',
    proposedIntake: 120,
    routeType: 'Scrutiny + EVC + SAC/SHC',
    currentStage: 'Deficiency Communicated',
    currentStageStartedAt: new Date(Date.now() - 9 * 86400000),
    submittedAt: new Date(Date.now() - 19 * 86400000),
    stageDeadlineDays: 10,
    assignedOfficer: 'Shri T. N. Venkatesh (SWRO)',
    priority: 'High',
    slaStatus: 'approaching_deadline',
    isEscalated: false,
    documents: [],
    observations: [],
    timeline: [],
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const count = await Application.countDocuments();
    console.log(`Current applications count in MongoDB Atlas: ${count}`);

    if (count === 0) {
      console.log('Seeding initial AICTE applications into MongoDB Atlas...');
      await Application.insertMany(SEED_APPLICATIONS);
      console.log(`✅ Successfully inserted ${SEED_APPLICATIONS.length} applications into Atlas!`);

      // Seed an initial audit log
      await AuditLog.create({
        timestamp: new Date(),
        actorName: 'Shri R. K. Deshmukh',
        actorRole: 'Regional Officer (WRO)',
        action: 'SYSTEM_BOOT',
        applicationNumber: 'AICTE-2026-WR-10921',
        reason: 'Initialized statutory repository for SIH 26262 AICTE Approval Workflow',
        tamperProofHash: `sha256-init-e8b7c3d19f8a02a4b88914c622998aef9120`,
        result: 'SUCCESS',
      });
      console.log('✅ Audit log seeded.');
    } else {
      console.log(`Atlas already has ${count} applications.`);
    }

    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Atlas:', err);
    process.exit(1);
  }
}

seed();
