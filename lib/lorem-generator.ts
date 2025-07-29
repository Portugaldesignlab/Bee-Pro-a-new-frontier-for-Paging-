export class LoremGenerator {
  private static headlines = [
    "Revolutionary Design Principles",
    "The Future of Digital Innovation",
    "Sustainable Architecture Today",
    "Modern Typography Excellence",
    "Creative Solutions Unveiled",
    "Breaking Design Boundaries",
    "Innovative User Experience",
    "Contemporary Visual Language",
    "Strategic Brand Development",
    "Digital Transformation Era",
    "Minimalist Design Philosophy",
    "Advanced Layout Systems",
    "Professional Design Standards",
    "Creative Industry Insights",
    "Modern Design Methodology",
    "Visual Communication Excellence",
    "Design Thinking Process",
    "Contemporary Art Direction",
    "Brand Identity Evolution",
    "Digital Design Mastery",
  ]

  private static subheadings = [
    "Exploring new possibilities in design",
    "A comprehensive approach to creativity",
    "Understanding modern design principles",
    "The intersection of form and function",
    "Building better user experiences",
    "Innovative solutions for complex problems",
    "The evolution of visual communication",
    "Strategic thinking in design process",
    "Contemporary approaches to branding",
    "Digital innovation in creative industries",
    "Sustainable design for the future",
    "Professional standards and best practices",
    "Creative problem-solving methodologies",
    "The art and science of design",
    "Modern typography and layout systems",
  ]

  private static captions = [
    "Figure 1: Contemporary design showcase",
    "Image courtesy of Design Studio",
    "Professional photography by John Smith",
    "Architectural detail from recent project",
    "Brand identity elements and applications",
    "User interface design exploration",
    "Typography specimen and variations",
    "Color palette and visual hierarchy",
    "Layout grid system demonstration",
    "Creative process documentation",
    "Design iteration and refinement",
    "Final presentation materials",
    "Client collaboration workspace",
    "Design system components",
    "Visual identity guidelines",
  ]

  private static bodyParagraphs = [
    "In the rapidly evolving landscape of contemporary design, professionals must navigate an increasingly complex array of tools, methodologies, and client expectations. The integration of digital technologies with traditional design principles has created unprecedented opportunities for creative expression while simultaneously demanding higher levels of technical proficiency and strategic thinking.",

    "Modern design practice requires a deep understanding of user psychology, cultural context, and technological constraints. Successful designers must balance aesthetic considerations with functional requirements, ensuring that their work not only looks compelling but also serves its intended purpose effectively. This holistic approach to design thinking has become essential in today's competitive marketplace.",

    "The democratization of design tools has fundamentally altered the creative landscape, enabling more people to participate in the design process while raising questions about professional standards and quality control. As artificial intelligence and machine learning technologies continue to advance, designers must adapt their skills and redefine their value proposition in an increasingly automated world.",

    "Sustainability has emerged as a critical consideration in all aspects of design practice, from material selection and production methods to the long-term environmental impact of creative decisions. Designers today must consider the full lifecycle of their work, seeking solutions that minimize waste and maximize positive social and environmental outcomes.",

    "The globalization of design culture has created both opportunities and challenges for creative professionals. While digital platforms enable unprecedented collaboration and knowledge sharing across geographical boundaries, they also intensify competition and require designers to develop cultural sensitivity and adaptability in their approach to different markets and audiences.",

    "Typography continues to play a fundamental role in visual communication, with new technologies enabling more sophisticated and expressive typographic treatments. The careful selection and application of typefaces can significantly impact the effectiveness of design solutions, making typographic literacy an essential skill for contemporary designers.",

    "Color theory and application remain central to effective design practice, with advances in display technology and printing methods expanding the possibilities for color expression. Understanding the psychological and cultural associations of color choices is crucial for creating designs that resonate with intended audiences and achieve desired emotional responses.",

    "The rise of user experience design has shifted focus from purely aesthetic considerations to comprehensive understanding of user behavior, needs, and motivations. This human-centered approach to design requires extensive research, testing, and iteration to create solutions that truly serve user needs while achieving business objectives.",

    "Brand identity design has evolved beyond simple logo creation to encompass comprehensive systems that guide all aspects of organizational communication. Modern brand designers must understand business strategy, market positioning, and stakeholder relationships to create identities that effectively represent and differentiate their clients in competitive markets.",

    "Digital design tools continue to evolve at a rapid pace, offering new capabilities while requiring continuous learning and adaptation from design professionals. The most successful designers maintain a balance between leveraging new technologies and maintaining focus on fundamental design principles that transcend specific tools or platforms.",
  ]

  private static loremWords = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "in",
    "reprehenderit",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
    "at",
    "vero",
    "eos",
    "accusamus",
    "accusantium",
    "doloremque",
    "laudantium",
    "totam",
    "rem",
    "aperiam",
    "eaque",
    "ipsa",
    "quae",
    "ab",
    "illo",
    "inventore",
    "veritatis",
    "et",
    "quasi",
    "architecto",
    "beatae",
    "vitae",
    "dicta",
    "sunt",
    "explicabo",
    "nemo",
    "ipsam",
    "voluptatem",
    "quia",
    "voluptas",
    "aspernatur",
    "aut",
    "odit",
    "fugit",
    "sed",
    "quia",
    "consequuntur",
    "magni",
    "dolores",
    "ratione",
    "sequi",
    "nesciunt",
    "neque",
    "porro",
    "quisquam",
    "dolorem",
    "adipisci",
    "numquam",
    "eius",
    "modi",
    "tempora",
    "incidunt",
    "magnam",
    "quaerat",
  ]

  static generateHeadline(): string {
    return this.headlines[Math.floor(Math.random() * this.headlines.length)]
  }

  static generateSubheading(): string {
    return this.subheadings[Math.floor(Math.random() * this.subheadings.length)]
  }

  static generateCaption(): string {
    return this.captions[Math.floor(Math.random() * this.captions.length)]
  }

  static generateProfessionalText(targetWords: number, charactersPerLine: number, linesAvailable: number): string {
    // Select appropriate paragraphs based on target length
    const selectedParagraphs: string[] = []
    let currentWordCount = 0
    const targetWordCount = Math.max(50, targetWords)

    // Shuffle paragraphs for variety
    const shuffledParagraphs = [...this.bodyParagraphs].sort(() => Math.random() - 0.5)

    for (const paragraph of shuffledParagraphs) {
      if (currentWordCount >= targetWordCount) break

      selectedParagraphs.push(paragraph)
      currentWordCount += paragraph.split(" ").length
    }

    let text = selectedParagraphs.join("\n\n")

    // Trim to approximate target length if too long
    if (currentWordCount > targetWordCount * 1.2) {
      const words = text.split(" ")
      text = words.slice(0, targetWordCount).join(" ")

      // Ensure we end with a complete sentence
      const lastPeriod = text.lastIndexOf(".")
      if (lastPeriod > text.length * 0.8) {
        text = text.substring(0, lastPeriod + 1)
      }
    }

    // Add professional formatting for justified text
    return this.formatForJustification(text, charactersPerLine, linesAvailable)
  }

  private static formatForJustification(text: string, charactersPerLine: number, linesAvailable: number): string {
    // Split into paragraphs
    const paragraphs = text.split("\n\n")
    const formattedParagraphs: string[] = []

    for (const paragraph of paragraphs) {
      // Break paragraph into lines that fit the character limit
      const words = paragraph.split(" ")
      const lines: string[] = []
      let currentLine = ""

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word

        if (testLine.length <= charactersPerLine) {
          currentLine = testLine
        } else {
          if (currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            // Word is longer than line, break it
            lines.push(word.substring(0, charactersPerLine))
            currentLine = word.substring(charactersPerLine)
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine)
      }

      // Limit to available lines
      const paragraphLines = lines.slice(0, Math.max(1, Math.floor(linesAvailable / paragraphs.length)))
      formattedParagraphs.push(paragraphLines.join("\n"))
    }

    return formattedParagraphs.join("\n\n")
  }

  static generateSentence(minWords = 8, maxWords = 20): string {
    const words = [
      "design",
      "creative",
      "innovative",
      "professional",
      "modern",
      "contemporary",
      "strategic",
      "effective",
      "comprehensive",
      "sophisticated",
      "elegant",
      "functional",
      "aesthetic",
      "visual",
      "digital",
      "sustainable",
      "dynamic",
      "solution",
      "approach",
      "methodology",
      "principle",
      "concept",
      "framework",
      "system",
      "process",
      "technique",
      "standard",
      "practice",
      "application",
      "development",
      "implementation",
      "optimization",
      "enhancement",
      "integration",
      "collaboration",
      "communication",
      "presentation",
      "documentation",
      "analysis",
    ]

    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
    const selectedWords: string[] = []

    for (let i = 0; i < wordCount; i++) {
      selectedWords.push(words[Math.floor(Math.random() * words.length)])
    }

    // Capitalize first word and add period
    selectedWords[0] = selectedWords[0].charAt(0).toUpperCase() + selectedWords[0].slice(1)
    return selectedWords.join(" ") + "."
  }

  static generateParagraph(sentenceCount = 4): string {
    const sentences: string[] = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(this.generateSentence())
    }
    return sentences.join(" ")
  }
}
