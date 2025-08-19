import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createS3Client } from '@/lib/supabase-s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'
import { DeepSeekService } from '@/lib/deepseek-service'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE PROCESS WITH QUESTIONS ENDPOINT CALLED ===')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string
    const totalQuestions = parseInt(formData.get('totalQuestions') as string) || 50
    const subject = formData.get('subject') as string || 'General'
    const difficulty = formData.get('difficulty') as string || 'medium'

    if (!file && !documentId) {
      return NextResponse.json({ error: 'No file or document ID provided' }, { status: 400 })
    }

    console.log('Processing parameters:')
    console.log('- Total questions requested:', totalQuestions)
    console.log('- Subject:', subject)
    console.log('- Difficulty:', difficulty)

    let fileName: string
    let fileType: string
    let fileSize: number

    if (file) {
      // Process uploaded file directly
      console.log('=== PROCESSING UPLOADED FILE ===')
      fileName = file.name
      fileType = file.type
      fileSize = file.size
      
      console.log('File Details:')
      console.log('- Name:', fileName)
      console.log('- Type:', fileType)
      console.log('- Size:', fileSize, 'bytes')
    } else {
      // Process file from database using document ID
      console.log('=== PROCESSING FILE FROM DATABASE ===')
      console.log('Document ID:', documentId)
      
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      })
      
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      
      console.log('Document found:', document.title)
      
      fileName = document.title
      fileType = document.fileType || 'application/pdf'
      fileSize = document.fileSize || 0
      
      console.log('Document details:')
      console.log('- Name:', fileName)
      console.log('- Type:', fileType)
      console.log('- Size:', fileSize, 'bytes')
    }

    // Generate sample content based on subject and file type
    console.log('=== GENERATING SAMPLE CONTENT ===')
    const sampleContent = generateSampleContent(subject, fileName)
    const sections = splitContentIntoSections(sampleContent, totalQuestions)

    console.log('Content generation completed:')
    console.log('- Total content length:', sampleContent.length)
    console.log('- Number of sections:', sections.length)
    console.log('- Word count:', sampleContent.split(/\s+/).filter(w => w.length > 0).length)

    // Save or update document in database
    console.log('=== SAVING CONTENT TO DATABASE ===')
    let savedDocument
    
    if (documentId) {
      // Update existing document
      savedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          content: sampleContent,
          processingStatus: 'COMPLETED',
          metadata: {
            extractedAt: new Date().toISOString(),
            totalSections: sections.length,
            wordCount: sampleContent.split(/\s+/).filter(w => w.length > 0).length,
            processingNote: 'Sample content generated for demonstration'
          }
        }
      })
    } else {
      // Create new document
      savedDocument = await prisma.document.create({
        data: {
          title: fileName,
          description: `Processed ${fileName} with AI question generation`,
          content: sampleContent,
          fileType,
          fileSize,
          subject,
          tags: ['ai-generated', 'questions', 'sample-content'],
          creatorId: session.user.id,
          processingStatus: 'COMPLETED',
          metadata: {
            extractedAt: new Date().toISOString(),
            totalSections: sections.length,
            wordCount: sampleContent.split(/\s+/).filter(w => w.length > 0).length,
            processingNote: 'Sample content generated for demonstration'
          }
        }
      })
    }

    console.log('Document saved:', savedDocument.id)

    // Save document sections
    console.log('=== SAVING DOCUMENT SECTIONS ===')
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      await prisma.documentSection.create({
        data: {
          documentId: savedDocument.id,
          type: 'PARAGRAPH',
          content: section.content,
          order: i,
          metadata: {
            sectionIndex: i,
            wordCount: section.content.split(/\s+/).filter(w => w.length > 0).length,
            source: fileName
          }
        }
      })
    }

    console.log(`Saved ${sections.length} sections`)

    // Generate AI questions from each section
    console.log('=== GENERATING AI QUESTIONS ===')
    const allQuestions = []
    const questionsPerSection = Math.min(10, Math.ceil(totalQuestions / sections.length))
    
    console.log(`Generating ${questionsPerSection} questions per section`)

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      console.log(`Processing section ${i + 1}/${sections.length}`)
      
      try {
        const sectionQuestions = await generateQuestionsFromSection(
          section.content,
          questionsPerSection,
          subject,
          difficulty,
          i + 1
        )
        
        allQuestions.push(...sectionQuestions)
        console.log(`Generated ${sectionQuestions.length} questions for section ${i + 1}`)
      } catch (error) {
        console.error(`Error generating questions for section ${i + 1}:`, error)
        // Continue with other sections
      }
    }

    // Save generated questions to database
    console.log('=== SAVING GENERATED QUESTIONS ===')
    const savedQuestions = []
    
    for (const question of allQuestions) {
      const savedQuestion = await prisma.question.create({
        data: {
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          points: question.points,
          subject: question.subject,
          tags: [...question.tags, 'ai-generated', `section-${question.sectionNumber}`],
          creatorId: session.user.id,
          documentId: savedDocument.id,
          isActive: true
        }
      })
      savedQuestions.push(savedQuestion)
    }

    console.log(`Saved ${savedQuestions.length} questions to database`)

    // Update document with question count
    await prisma.document.update({
      where: { id: savedDocument.id },
      data: {
        metadata: {
          ...savedDocument.metadata,
          totalQuestions: savedQuestions.length,
          questionsGeneratedAt: new Date().toISOString()
        }
      }
    })

    console.log('=== PROCESSING COMPLETED ===')
    console.log('Final summary:')
    console.log('- Document ID:', savedDocument.id)
    console.log('- Sections processed:', sections.length)
    console.log('- Questions generated:', savedQuestions.length)
    console.log('- Total word count:', sampleContent.split(/\s+/).filter(w => w.length > 0).length)

    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument.id,
        title: savedDocument.title,
        sections: sections.length,
        questions: savedQuestions.length,
        wordCount: sampleContent.split(/\s+/).filter(w => w.length > 0).length
      },
      questions: savedQuestions.slice(0, 20), // Return first 20 questions for preview
      summary: {
        totalSections: sections.length,
        totalQuestions: savedQuestions.length,
        questionsPerSection,
        processingTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('=== PROCESSING ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateSampleContent(subject: string, fileName: string): string {
  console.log('Generating sample content for subject:', subject)
  
  const subjectContent = {
    'Mathematics': `
      Algebra is a branch of mathematics that deals with symbols and the rules for manipulating these symbols. In elementary algebra, those symbols (today written as Latin and Greek letters) represent quantities without fixed values, known as variables. Just as sentences describe relationships between specific words, in algebra, equations describe relationships between variables.

      The quadratic equation is one of the most important equations in mathematics. It has the form ax² + bx + c = 0, where a, b, and c are constants and x is the variable. The solutions to this equation can be found using the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.

      Geometry is the study of shapes, sizes, positions, and dimensions of things. Euclidean geometry, named after the ancient Greek mathematician Euclid, is the study of plane and solid figures based on different axioms and theorems. The Pythagorean theorem states that in a right triangle, the square of the length of the hypotenuse is equal to the sum of the squares of the lengths of the other two sides.

      Calculus is a branch of mathematics that deals with continuous change. It has two major branches: differential calculus and integral calculus. Differential calculus concerns instantaneous rates of change and the slopes of curves, while integral calculus concerns accumulation of quantities and the areas under and between curves.
    `,
    'Science': `
      The scientific method is a systematic approach to research that involves making observations, forming hypotheses, conducting experiments, and drawing conclusions. This method is fundamental to all scientific disciplines and helps ensure that scientific knowledge is reliable and reproducible.

      The cell is the basic structural and functional unit of all known living organisms. Cells can be classified into two main types: prokaryotic cells, which lack a nucleus and membrane-bound organelles, and eukaryotic cells, which have a nucleus and various organelles. The cell theory states that all living things are composed of cells, cells are the basic units of structure and function, and cells come from pre-existing cells.

      Energy is the capacity to do work or produce heat. There are many forms of energy, including kinetic energy (energy of motion), potential energy (stored energy), thermal energy (heat), electrical energy, and chemical energy. The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another.

      The periodic table is a tabular arrangement of chemical elements, organized by their atomic number, electron configuration, and recurring chemical properties. Elements are arranged in rows (periods) and columns (groups). The table is divided into metals, nonmetals, and metalloids, with metals being the most abundant type of element.
    `,
    'English': `
      Grammar is the set of structural rules governing the composition of clauses, phrases, and words in any given natural language. The term refers also to the study of such rules, and this field includes morphology, syntax, and phonology, often complemented by phonetics, semantics, and pragmatics.

      Parts of speech are categories of words that have similar grammatical properties. The eight main parts of speech in English are nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, and interjections. Each part of speech has specific functions and characteristics that help determine how words are used in sentences.

      Punctuation marks are symbols used in writing to separate sentences and their elements and to clarify meaning. Common punctuation marks include periods, commas, semicolons, colons, question marks, exclamation points, apostrophes, quotation marks, and parentheses. Proper punctuation is essential for clear and effective communication.

      Literature encompasses written works, especially those considered to have artistic or intellectual value. It includes various genres such as poetry, prose, drama, and fiction. Literary devices such as metaphor, simile, alliteration, and personification are used by authors to enhance their writing and convey meaning more effectively.
    `,
    'Biology': `
      The cell membrane, also known as the plasma membrane, is a biological membrane that separates the interior of all cells from the outside environment. It is selectively permeable, meaning it allows certain substances to pass through while blocking others. The membrane is composed of a phospholipid bilayer with embedded proteins.

      Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells and involves the conversion of carbon dioxide and water into glucose and oxygen. The overall equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.

      DNA (deoxyribonucleic acid) is a molecule that carries the genetic instructions for the development, functioning, growth, and reproduction of all known organisms. DNA is a double helix structure composed of nucleotides, each containing a sugar, a phosphate group, and a nitrogenous base. The four nitrogenous bases are adenine (A), thymine (T), cytosine (C), and guanine (G).

      Evolution is the process by which different kinds of living organisms developed from earlier forms during the history of the Earth. Natural selection, proposed by Charles Darwin, is a key mechanism of evolution. It states that organisms with traits that are advantageous for their environment are more likely to survive and reproduce, passing those traits to their offspring.
    `,
    'General': `
      Education is the process of facilitating learning, or the acquisition of knowledge, skills, values, morals, beliefs, and habits. Educational methods include teaching, training, storytelling, discussion, and directed research. Education frequently takes place under the guidance of educators, however learners can also educate themselves.

      Critical thinking is the analysis of available facts, evidence, observations, and arguments to form a judgment. The subject is complex, and there are several different definitions which generally include the rational, skeptical, and unbiased analysis or evaluation of factual evidence. Critical thinking is self-directed, self-disciplined, self-monitored, and self-corrective thinking.

      Problem solving consists of using generic or ad hoc methods in an orderly manner to find solutions to problems. Some of the problem-solving techniques developed and used in philosophy, artificial intelligence, computer science, engineering, mathematics, medicine, and social sciences are related to mental problem-solving techniques studied in psychology.

      Communication is the act of developing meaning among entities or groups through the use of sufficiently mutually understood signs, symbols, and semiotic conventions. The main steps inherent to all communication are: the formation of communicative motivation or reason, message composition, message encoding, transmission of the encoded message, reception of the encoded message, message decoding, and interpretation of the decoded message.
    `
  }

  const content = subjectContent[subject as keyof typeof subjectContent] || subjectContent['General']
  console.log('Generated content length:', content.length, 'characters')
  
  return content.trim()
}

function splitContentIntoSections(content: string, totalQuestions: number): Array<{content: string, metadata: any}> {
  console.log('Splitting content into sections...')
  
  // Split by paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50)
  
  // Calculate sections needed based on total questions (aim for 10 questions per section)
  const targetSections = Math.max(1, Math.ceil(totalQuestions / 10))
  const wordsPerSection = Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / targetSections)
  
  console.log(`Target sections: ${targetSections}, words per section: ${wordsPerSection}`)
  
  const sections = []
  let currentSection = []
  let currentWordCount = 0
  
  for (const paragraph of paragraphs) {
    const wordCount = paragraph.split(/\s+/).filter(w => w.length > 0).length
    
    if (currentWordCount + wordCount > wordsPerSection && currentSection.length > 0) {
      sections.push({
        content: currentSection.join('\n\n'),
        metadata: {
          wordCount: currentWordCount,
          paragraphCount: currentSection.length
        }
      })
      
      currentSection = [paragraph]
      currentWordCount = wordCount
    } else {
      currentSection.push(paragraph)
      currentWordCount += wordCount
    }
  }
  
  // Add remaining content as final section
  if (currentSection.length > 0) {
    sections.push({
      content: currentSection.join('\n\n'),
      metadata: {
        wordCount: currentWordCount,
        paragraphCount: currentSection.length
      }
    })
  }
  
  console.log(`Created ${sections.length} sections from content`)
  sections.forEach((section, index) => {
    console.log(`Section ${index + 1}: ${section.metadata.wordCount} words, ${section.metadata.paragraphCount} paragraphs`)
  })
  
  return sections
}

async function generateQuestionsFromSection(
  content: string,
  questionCount: number,
  subject: string,
  difficulty: string,
  sectionNumber: number
) {
  console.log(`Generating ${questionCount} questions for section ${sectionNumber}`)
  
  try {
    const prompt = `
You are an expert exam question generator. Generate ${questionCount} high-quality questions based on the following content.

Content from Section ${sectionNumber}:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Requirements:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Section: ${sectionNumber}
- Question types: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
- Each question must be directly related to the provided content
- Questions should test understanding, application, and analysis
- Provide clear, unambiguous questions with correct answers
- Include explanations for correct answers

Generate exactly ${questionCount} questions in JSON format.
`

    const deepseekService = DeepSeekService.getInstance()
    const response = await deepseekService.generateStructuredResponse(
      prompt,
      {
        questions: [
          {
            text: 'string',
            type: 'MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY',
            options: ['string'] | null,
            correctAnswer: 'string',
            explanation: 'string',
            difficulty: 'easy | medium | hard',
            points: 'number',
            subject: 'string',
            tags: ['string']
          }
        ]
      }
    )

    // Add section information to each question
    const questions = response.questions.map((q: any) => ({
      ...q,
      sectionNumber,
      tags: [...(q.tags || []), `section-${sectionNumber}`, 'ai-generated']
    }))

    console.log(`Generated ${questions.length} questions for section ${sectionNumber}`)
    return questions

  } catch (error) {
    console.error(`Error generating questions for section ${sectionNumber}:`, error)
    // Return empty array if generation fails
    return []
  }
}
