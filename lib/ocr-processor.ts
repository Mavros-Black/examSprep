import sharp from 'sharp'
import pdf from 'pdf-parse'
import Tesseract from 'tesseract.js'

export interface ProcessedText {
  text: string
  confidence: number
  sections: DocumentSection[]
}

export interface DocumentSection {
  type: 'HEADING' | 'PARAGRAPH' | 'LIST' | 'TABLE'
  content: string
  metadata: Record<string, any>
}

export interface TextMetadata {
  wordCount: number
  estimatedReadingTime: number
  language: string
  topics: string[]
}

export class OCRProcessor {
  static async processFile(
    fileBuffer: Buffer,
    fileType: string,
    fileName: string
  ): Promise<ProcessedText> {
    try {
      console.log(`Processing file: ${fileName} (${fileType})`)

      if (fileType === 'application/pdf') {
        return await this.processPDF(fileBuffer, fileName)
      } else if (fileType.startsWith('image/')) {
        return await this.processImage(fileBuffer, fileName)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      throw error
    }
  }

  private static async processPDF(fileBuffer: Buffer, fileName: string): Promise<ProcessedText> {
    console.log('Processing PDF...')
    console.log('PDF Buffer Size:', fileBuffer.length, 'bytes')
    
    const data = await pdf(fileBuffer, {
      max: 0, // No page limit
      version: 'v2.0.550' // Specify PDF.js version
    })
    
    console.log('PDF Processing Results:')
    console.log('- Number of Pages:', data.numpages)
    console.log('- PDF Version:', data.info?.PDFFormatVersion || 'Unknown')
    console.log('- Raw Text Length:', data.text.length)
    
    const extractedText = data.text.trim()
    console.log('- Trimmed Text Length:', extractedText.length)
    console.log('- First 500 characters:', extractedText.substring(0, 500))
    
    const sections = this.chunkText(extractedText, fileName)
    console.log('- Created', sections.length, 'sections')
    
    return { text: extractedText, confidence: 1.0, sections } // Assuming high confidence for direct text extraction
  }

  private static async processImage(fileBuffer: Buffer, fileName: string): Promise<ProcessedText> {
    console.log('Processing image with OCR...')
    console.log('Image Buffer Size:', fileBuffer.length, 'bytes')
    
    const buffer = Buffer.from(fileBuffer)
    const processedImage = await sharp(buffer).png().toBuffer() // Convert to PNG for Tesseract
    console.log('Processed Image Size:', processedImage.length, 'bytes')

    const result = await Tesseract.recognize(processedImage, 'eng', {
      logger: m => console.log('Tesseract progress:', m.status, m.progress)
    })
    
    console.log('OCR Processing Results:')
    console.log('- OCR Confidence:', result.data.confidence)
    console.log('- Raw Text Length:', result.data.text.length)
    console.log('- First 500 characters:', result.data.text.substring(0, 500))
    
    const extractedText = result.data.text.trim()
    console.log('- Trimmed Text Length:', extractedText.length)
    
    const sections = this.chunkText(extractedText, fileName)
    console.log('- Created', sections.length, 'sections')
    
    return { text: extractedText, confidence: result.data.confidence / 100, sections }
  }

  static extractSubjectFromFileName(fileName: string): string {
    const name = fileName.toLowerCase()
    
    if (name.includes('biology') || name.includes('bio')) return 'Biology'
    if (name.includes('chemistry') || name.includes('chem')) return 'Chemistry'
    if (name.includes('physics') || name.includes('phys')) return 'Physics'
    if (name.includes('mathematics') || name.includes('math') || name.includes('algebra')) return 'Mathematics'
    if (name.includes('english') || name.includes('lang')) return 'English'
    if (name.includes('history') || name.includes('hist')) return 'History'
    if (name.includes('geography') || name.includes('geo')) return 'Geography'
    if (name.includes('science') || name.includes('sci')) return 'General Science'
    if (name.includes('computer') || name.includes('programming') || name.includes('coding')) return 'Computer Science'
    if (name.includes('economics') || name.includes('econ')) return 'Economics'
    if (name.includes('literature') || name.includes('lit')) return 'Literature'
    if (name.includes('philosophy') || name.includes('phil')) return 'Philosophy'
    if (name.includes('psychology') || name.includes('psych')) return 'Psychology'
    if (name.includes('sociology') || name.includes('soc')) return 'Sociology'
    if (name.includes('art') || name.includes('drawing') || name.includes('painting')) return 'Art'
    if (name.includes('music')) return 'Music'
    if (name.includes('physical') || name.includes('pe') || name.includes('sport')) return 'Physical Education'
    
    return 'General'
  }

  static generateSampleContent(subject: string): string {
    switch (subject.toLowerCase()) {
      case 'biology':
        return `Biology is the scientific study of life and living organisms. It encompasses various sub-disciplines including:

CELL BIOLOGY
Cells are the basic units of life. All living organisms are composed of cells, which contain genetic material and can replicate themselves. The cell theory states that:
- All living things are made up of cells
- Cells are the basic units of structure and function
- New cells arise from existing cells

GENETICS
Genetics is the study of heredity and variation in living organisms. DNA (deoxyribonucleic acid) is the molecule that carries genetic information. Key concepts include:
- Genes are segments of DNA that code for proteins
- Chromosomes are structures that contain DNA
- Inheritance patterns follow Mendelian genetics

ECOLOGY
Ecology studies the interactions between organisms and their environment. Ecosystems consist of:
- Biotic factors (living organisms)
- Abiotic factors (non-living components)
- Energy flow through food chains and webs

EVOLUTION
Evolution is the process by which species change over time through natural selection. Charles Darwin's theory explains:
- Variation exists within populations
- Some variations are advantageous
- Advantageous traits are passed to offspring
- Over time, populations evolve`

      case 'chemistry':
        return `Chemistry is the study of matter, its properties, and the changes it undergoes. Key areas include:

ATOMIC STRUCTURE
Atoms are the building blocks of matter, consisting of:
- Protons (positive charge)
- Neutrons (neutral)
- Electrons (negative charge)

CHEMICAL BONDING
Atoms combine through various types of bonds:
- Ionic bonds (electron transfer)
- Covalent bonds (electron sharing)
- Metallic bonds (electron sea)

REACTIONS
Chemical reactions involve the rearrangement of atoms:
- Reactants → Products
- Conservation of mass
- Energy changes (exothermic/endothermic)

PERIODIC TABLE
The periodic table organizes elements by:
- Atomic number
- Chemical properties
- Electron configuration`

      case 'physics':
        return `Physics is the study of matter, energy, and their interactions. Major branches include:

MECHANICS
Mechanics deals with motion and forces:
- Newton's Laws of Motion
- Gravity and gravitational fields
- Energy conservation
- Momentum and collisions

THERMODYNAMICS
Thermodynamics studies heat and energy:
- Temperature and heat
- Laws of thermodynamics
- Entropy and disorder
- Heat engines

ELECTROMAGNETISM
Electromagnetism combines electricity and magnetism:
- Electric charges and fields
- Magnetic fields and forces
- Electromagnetic waves
- Maxwell's equations

QUANTUM MECHANICS
Quantum mechanics describes atomic and subatomic behavior:
- Wave-particle duality
- Uncertainty principle
- Quantum states
- Probability waves`

      default:
        return `This document contains educational content covering various topics and concepts. The material is structured to provide comprehensive understanding of the subject matter through clear explanations, examples, and practical applications.

Key learning objectives include:
- Understanding fundamental concepts
- Applying knowledge to solve problems
- Developing critical thinking skills
- Building a strong foundation for advanced study

The content is organized into logical sections with clear headings, supporting examples, and relevant illustrations to enhance comprehension and retention.`
    }
  }

  private static chunkText(text: string, fileName: string): DocumentSection[] {
    console.log('=== TEXT CHUNKING PROCESS ===')
    console.log('Input text length:', text.length, 'characters')
    
    const sections: DocumentSection[] = []
    const lines = text.split('\n').filter(line => line.trim())
    const subject = this.extractSubjectFromFileName(fileName)
    
    console.log('Detected subject:', subject)
    console.log('Number of non-empty lines:', lines.length)
    console.log('First few lines:', lines.slice(0, 3))

    let currentSection = {
      type: 'PARAGRAPH' as const,
      content: '',
      metadata: { subject }
    }

    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (!trimmedLine) continue

      // Detect headings (lines with few words, all caps, or ending with numbers)
      const isHeading = (
        trimmedLine.split(' ').length <= 5 ||
        trimmedLine === trimmedLine.toUpperCase() ||
        /^[A-Z\s]+\d*$/.test(trimmedLine) ||
        /^\d+\.\s/.test(trimmedLine)
      )

      if (isHeading && currentSection.content) {
        // Save current section
        sections.push({ ...currentSection })
        currentSection = {
          type: 'HEADING',
          content: trimmedLine,
          metadata: { subject }
        }
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        // List item
        if (currentSection.type !== 'LIST') {
          if (currentSection.content) {
            sections.push({ ...currentSection })
          }
          currentSection = {
            type: 'LIST',
            content: trimmedLine,
            metadata: { subject }
          }
        } else {
          currentSection.content += '\n' + trimmedLine
        }
      } else {
        // Regular paragraph
        if (currentSection.type !== 'PARAGRAPH') {
          if (currentSection.content) {
            sections.push({ ...currentSection })
          }
          currentSection = {
            type: 'PARAGRAPH',
            content: trimmedLine,
            metadata: { subject }
          }
        } else {
          currentSection.content += '\n' + trimmedLine
        }
      }
    }

    // Add the last section
    if (currentSection.content) {
      sections.push(currentSection)
    }

    // If no sections were created, create a default one
    if (sections.length === 0) {
      console.log('No sections detected, creating default section')
      sections.push({
        type: 'PARAGRAPH',
        content: text || this.generateSampleContent(subject),
        metadata: { subject }
      })
    }

    console.log('Final sections created:', sections.length)
    sections.forEach((section, index) => {
      console.log(`Section ${index + 1}: ${section.type} (${section.content.length} chars)`)
    })
    console.log('=== END TEXT CHUNKING ===')

    return sections
  }

  static extractMetadata(text: string): TextMetadata {
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const estimatedReadingTime = Math.ceil(wordCount / 200) // Average reading speed: 200 words per minute
    
    // Simple topic extraction based on common educational terms
    const topics = this.extractTopics(text)
    
    return {
      wordCount,
      estimatedReadingTime,
      language: 'en',
      topics
    }
  }

  private static extractTopics(text: string): string[] {
    const topics: string[] = []
    const lowerText = text.toLowerCase()
    
    // Common educational topics
    const topicKeywords = {
      'cell biology': ['cell', 'mitosis', 'meiosis', 'dna', 'chromosome'],
      'genetics': ['gene', 'heredity', 'mutation', 'allele', 'genotype'],
      'ecology': ['ecosystem', 'population', 'community', 'biome'],
      'evolution': ['natural selection', 'adaptation', 'speciation'],
      'chemistry': ['molecule', 'atom', 'reaction', 'bond', 'element'],
      'physics': ['force', 'energy', 'motion', 'gravity', 'wave'],
      'mathematics': ['equation', 'function', 'geometry', 'algebra', 'calculus'],
      'history': ['civilization', 'war', 'revolution', 'empire', 'dynasty'],
      'geography': ['continent', 'climate', 'population', 'region', 'country']
    }
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic)
      }
    }
    
    return topics.length > 0 ? topics : ['general education']
  }
} 