import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@examprep.com' },
    update: {},
    create: {
      email: 'admin@examprep.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@examprep.com' },
    update: {},
    create: {
      email: 'teacher@examprep.com',
      password: teacherPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'TEACHER',
    },
  })

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@examprep.com' },
    update: {},
    create: {
      email: 'student@examprep.com',
      password: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT',
    },
  })

  // Create sample documents
  const mathDocument = await prisma.document.create({
    data: {
      title: 'Advanced Mathematics Fundamentals',
      description: 'Comprehensive guide to advanced mathematics concepts',
      content: 'This document covers advanced mathematical concepts including calculus, linear algebra, and differential equations.',
      subject: 'Mathematics',
      tags: ['calculus', 'algebra', 'advanced'],
      isPublic: true,
      creatorId: teacher.id,
    },
  })

  const physicsDocument = await prisma.document.create({
    data: {
      title: 'Physics Principles and Applications',
      description: 'Core physics concepts with practical examples',
      content: 'Fundamental physics principles covering mechanics, thermodynamics, and electromagnetism.',
      subject: 'Physics',
      tags: ['mechanics', 'thermodynamics', 'electromagnetism'],
      isPublic: true,
      creatorId: teacher.id,
    },
  })

  // Create sample questions
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        text: 'What is the derivative of x²?',
        type: 'MULTIPLE_CHOICE',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: '2x',
        explanation: 'The derivative of x² is 2x using the power rule.',
        difficulty: 2,
        points: 1,
        subject: 'Mathematics',
        tags: ['calculus', 'derivatives'],
        creatorId: teacher.id,
        documentId: mathDocument.id,
      },
    }),
    prisma.question.create({
      data: {
        text: 'Which of the following is Newton\'s first law?',
        type: 'MULTIPLE_CHOICE',
        options: [
          'F = ma',
          'An object at rest stays at rest unless acted upon by an external force',
          'For every action there is an equal and opposite reaction',
          'Energy cannot be created or destroyed'
        ],
        correctAnswer: 'An object at rest stays at rest unless acted upon by an external force',
        explanation: 'Newton\'s first law states that an object will remain at rest or in uniform motion unless acted upon by an external force.',
        difficulty: 1,
        points: 1,
        subject: 'Physics',
        tags: ['mechanics', 'newton-laws'],
        creatorId: teacher.id,
        documentId: physicsDocument.id,
      },
    }),
    prisma.question.create({
      data: {
        text: 'Is the Earth round?',
        type: 'TRUE_FALSE',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'The Earth is approximately spherical in shape.',
        difficulty: 1,
        points: 1,
        subject: 'Physics',
        tags: ['earth-science', 'basic'],
        creatorId: teacher.id,
      },
    }),
  ])

  // Create sample attempts
  const attempt = await prisma.attempt.create({
    data: {
      userId: student.id,
      documentId: mathDocument.id,
      score: 0.75,
      maxScore: 1,
      timeSpent: 120,
      status: 'COMPLETED',
      answers: {
        question1: '2x',
        question2: 'An object at rest stays at rest unless acted upon by an external force',
      },
      completedAt: new Date(),
      questions: {
        connect: questions.map(q => ({ id: q.id })),
      },
    },
  })

  // Create sample subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: student.id,
      planName: 'Premium Student',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      price: 99.99,
      features: ['Unlimited practice', 'Advanced analytics', 'Priority support'],
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👥 Created ${3} users`)
  console.log(`📚 Created ${2} documents`)
  console.log(`❓ Created ${3} questions`)
  console.log(`📊 Created ${1} attempt`)
  console.log(`💳 Created ${1} subscription`)

  console.log('\n🔑 Default login credentials:')
  console.log('Admin: admin@examprep.com / admin123')
  console.log('Teacher: teacher@examprep.com / teacher123')
  console.log('Student: student@examprep.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
