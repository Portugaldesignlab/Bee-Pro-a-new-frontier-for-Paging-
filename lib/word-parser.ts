export interface ExtractedContent {
  title?: string
  subtitle?: string
  headings: string[]
  paragraphs: string[]
  images: ExtractedImage[]
  captions: string[]
  metadata: {
    wordCount: number
    paragraphCount: number
    imageCount: number
    extractedAt: Date
  }
}

export interface ExtractedImage {
  id: string
  alt?: string
  caption?: string
  width?: number
  height?: number
  data?: string // base64 data
}

export class WordDocumentParser {
  static async parseDocument(file: File): Promise<ExtractedContent> {
    try {
      // For now, we'll simulate Word document parsing
      // In a real implementation, you'd use mammoth.js or similar
      const text = await this.extractTextFromFile(file)
      return this.analyzeContent(text, file.name)
    } catch (error) {
      console.error("Error parsing Word document:", error)
      throw new Error("Failed to parse Word document")
    }
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    // This is a simplified implementation
    // In reality, you'd use mammoth.js to parse .docx files
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        resolve(result)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  private static analyzeContent(text: string, filename: string): ExtractedContent {
    const lines = text.split("\n").filter((line) => line.trim().length > 0)

    // Simple content analysis
    const headings: string[] = []
    const paragraphs: string[] = []
    const captions: string[] = []
    let title = ""
    let subtitle = ""

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Detect title (first significant line or lines in ALL CAPS)
      if (index === 0 && trimmed.length > 0) {
        title = trimmed
      }
      // Detect subtitle (second line if it's shorter than title)
      else if (index === 1 && trimmed.length > 0 && trimmed.length < title.length) {
        subtitle = trimmed
      }
      // Detect headings (lines that are shorter and might be headings)
      else if (
        trimmed.length < 100 &&
        trimmed.length > 10 &&
        (trimmed.toUpperCase() === trimmed || trimmed.endsWith(":") || /^[A-Z][a-z\s]+$/.test(trimmed))
      ) {
        headings.push(trimmed)
      }
      // Detect captions (lines starting with "Figure", "Image", "Photo", etc.)
      else if (/^(Figure|Image|Photo|Caption|Fig\.)\s*\d*:?\s*/i.test(trimmed)) {
        captions.push(trimmed.replace(/^(Figure|Image|Photo|Caption|Fig\.)\s*\d*:?\s*/i, ""))
      }
      // Regular paragraphs
      else if (trimmed.length > 50) {
        paragraphs.push(trimmed)
      }
    })

    // If no title was detected, use filename
    if (!title) {
      title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    }

    const wordCount = text.split(/\s+/).length

    return {
      title: title || undefined,
      subtitle: subtitle || undefined,
      headings,
      paragraphs,
      images: [], // Would be extracted from actual Word document
      captions,
      metadata: {
        wordCount,
        paragraphCount: paragraphs.length,
        imageCount: 0,
        extractedAt: new Date(),
      },
    }
  }

  static segmentContentForLayout(
    content: ExtractedContent,
    targetElements: number,
  ): {
    titles: string[]
    subtitles: string[]
    bodies: string[]
    captions: string[]
  } {
    const titles: string[] = []
    const subtitles: string[] = []
    const bodies: string[] = []
    const captions: string[] = []

    // Add main title
    if (content.title) {
      titles.push(content.title)
    }

    // Add subtitle
    if (content.subtitle) {
      subtitles.push(content.subtitle)
    }

    // Add headings as titles/subtitles
    content.headings.forEach((heading, index) => {
      if (index % 2 === 0) {
        titles.push(heading)
      } else {
        subtitles.push(heading)
      }
    })

    // Segment paragraphs into appropriate body text blocks
    const wordsPerBlock = Math.max(
      50,
      Math.floor(content.metadata.wordCount / Math.max(1, targetElements - titles.length - subtitles.length)),
    )

    let currentBlock = ""
    let currentWordCount = 0

    content.paragraphs.forEach((paragraph) => {
      const paragraphWords = paragraph.split(/\s+/).length

      if (currentWordCount + paragraphWords > wordsPerBlock && currentBlock.length > 0) {
        bodies.push(currentBlock.trim())
        currentBlock = paragraph
        currentWordCount = paragraphWords
      } else {
        currentBlock += (currentBlock ? " " : "") + paragraph
        currentWordCount += paragraphWords
      }
    })

    // Add remaining content
    if (currentBlock.trim()) {
      bodies.push(currentBlock.trim())
    }

    // Add captions
    captions.push(...content.captions)

    return { titles, subtitles, bodies, captions }
  }
}
