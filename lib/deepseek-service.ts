import { generateText } from 'ai'
import { deepseek } from '@ai-sdk/deepseek'

export class DeepSeekService {
  private static instance: DeepSeekService

  private constructor() {}

  public static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService()
    }
    return DeepSeekService.instance
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: deepseek('deepseek-chat'),
        prompt,
        maxTokens: 2000,
        temperature: 0.7,
      })
      return text
    } catch (error) {
      console.error('DeepSeek text generation error:', error)
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // For now, return a simple hash-based embedding
      // In production, you would use DeepSeek's embedding API
      const hash = this.simpleHash(text)
      const embedding = new Array(1536).fill(0)
      for (let i = 0; i < Math.min(hash.length, 1536); i++) {
        embedding[i] = (hash.charCodeAt(i) % 100) / 100
      }
      return embedding
    } catch (error) {
      console.error('DeepSeek embedding generation error:', error)
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async searchSimilarContent(query: string, documents: string[]): Promise<string[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query)
      const similarities = documents.map((doc, index) => ({
        document: doc,
        similarity: this.cosineSimilarity(queryEmbedding, this.simpleHash(doc))
      }))
      
      similarities.sort((a, b) => b.similarity - a.similarity)
      return similarities.slice(0, 3).map(s => s.document)
    } catch (error) {
      console.error('DeepSeek similarity search error:', error)
      return documents.slice(0, 3) // Fallback to first 3 documents
    }
  }

  async generateStructuredResponse(prompt: string, schema: any): Promise<any> {
    try {
      const { text } = await generateText({
        model: deepseek('deepseek-chat'),
        prompt: `${prompt}\n\nPlease respond with valid JSON only, no markdown formatting.`,
        maxTokens: 3000,
        temperature: 0.3,
      })

      // Clean the response by removing markdown code blocks
      let cleanedText = text
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.split('```json')[1] || cleanedText
      }
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.split('```')[0] || cleanedText
      }
      
      cleanedText = cleanedText.trim()
      
      // Try to parse as JSON
      try {
        return JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        console.error('Cleaned text:', cleanedText)
        
        // Return a fallback structure based on the schema
        return this.generateFallbackResponse(schema)
      }
    } catch (error) {
      console.error('DeepSeek structured response error:', error)
      return this.generateFallbackResponse(schema)
    }
  }

  private generateFallbackResponse(schema: any): any {
    // Generate a basic fallback response based on the schema
    if (schema.questions) {
      return {
        questions: [
          {
            text: "What is the main topic discussed in the provided content?",
            type: "MULTIPLE_CHOICE",
            options: ["Topic A", "Topic B", "Topic C", "Topic D"],
            correctAnswer: "Topic A",
            explanation: "This is a fallback question generated when AI processing fails.",
            difficulty: "medium",
            points: 1,
            subject: "General",
            tags: ["fallback", "ai-error"]
          }
        ]
      }
    }
    return {}
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  private cosineSimilarity(vecA: number[], vecB: string): number {
    // Simple similarity calculation
    const hashB = this.simpleHash(vecB)
    const sum = vecA.reduce((acc, val, i) => acc + val * (hashB.charCodeAt(i % hashB.length) % 100) / 100, 0)
    return Math.abs(sum) / vecA.length
  }
}

// Export a singleton instance
export const deepseekService = DeepSeekService.getInstance() 