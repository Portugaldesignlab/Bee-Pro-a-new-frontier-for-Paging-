export class LoremGenerator {
  private static readonly LOREM_WORDS = [
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
    "voluptatem",
  ]

  private static readonly HEADLINES = [
    "The Future of Design Excellence",
    "Innovation in Modern Publishing",
    "Breaking New Creative Ground",
    "Revolutionary Design Approaches",
    "Creative Solutions for Tomorrow",
    "Transforming Visual Communication",
    "Next Generation Design Thinking",
    "Pioneering Excellence in Layout",
    "Visionary Leadership in Design",
    "Sustainable Design Progress",
    "Mastering Visual Hierarchy",
    "The Art of Professional Layout",
    "Design Systems That Work",
    "Creating Impactful Experiences",
    "Modern Typography Principles",
    "Crafting Digital Experiences",
    "The Science of Visual Design",
    "Building Better User Interfaces",
    "Design Thinking Methodologies",
    "Creative Problem Solving",
  ]

  private static readonly CAPTIONS = [
    "Figure 1: Detailed analysis of current design trends and their impact on user experience across multiple platforms.",
    "Photo courtesy of the design studio showcasing innovative layout techniques used in modern publication design.",
    "Illustration demonstrates key concepts in modern visual communication design and information architecture.",
    "Data visualization from recent study on effective layout principles and their application in digital media.",
    "Example of innovative approach to grid-based design systems and their implementation in responsive layouts.",
    "Case study results overview showing improved readability metrics and user engagement across different formats.",
    "Technical specifications included for professional implementation of scalable design system architecture.",
    "Performance metrics displayed across different device formats showing optimization results and improvements.",
    "Research findings support the effectiveness of this design approach in various publication contexts.",
    "Implementation guide for scalable design system architecture with detailed specifications and guidelines.",
  ]

  static generateWords(count: number): string[] {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(this.LOREM_WORDS[Math.floor(Math.random() * this.LOREM_WORDS.length)])
    }
    return words
  }

  static generateSentence(minWords = 8, maxWords = 15): string {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
    const words = this.generateWords(wordCount)
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return words.join(" ") + "."
  }

  static generateParagraph(minSentences = 3, maxSentences = 6): string {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
    const sentences: string[] = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(this.generateSentence())
    }
    return sentences.join(" ")
  }

  static generateText(wordCount: number): string {
    if (wordCount <= 0) return ""

    const words = this.generateWords(wordCount)
    let text = ""
    let currentSentenceLength = 0
    const avgSentenceLength = 12

    for (let i = 0; i < words.length; i++) {
      if (i === 0 || currentSentenceLength === 0) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
      }

      text += words[i]
      currentSentenceLength++

      if (i < words.length - 1) {
        if (currentSentenceLength >= avgSentenceLength && Math.random() > 0.3) {
          text += ". "
          currentSentenceLength = 0
        } else {
          text += " "
        }
      } else {
        text += "."
      }
    }

    return text
  }

  static generateFormattedText(wordCount: number, charactersPerLine: number, maxLines: number): string {
    if (wordCount <= 0 || maxLines <= 0) return ""

    // Generate text with proper paragraph structure
    const paragraphs: string[] = []
    let remainingWords = wordCount
    let remainingLines = maxLines

    while (remainingWords > 0 && remainingLines > 2) {
      // Calculate words per paragraph based on available space
      const linesForParagraph = Math.min(4, remainingLines - 1)
      const wordsForParagraph = Math.min(remainingWords, Math.floor((charactersPerLine * linesForParagraph) / 6))

      if (wordsForParagraph > 0) {
        const paragraph = this.generateText(wordsForParagraph)

        // Apply hyphenation for better text flow
        const hyphenatedParagraph = this.applyHyphenation(paragraph)
        paragraphs.push(hyphenatedParagraph)

        remainingWords -= wordsForParagraph
        remainingLines -= Math.ceil(hyphenatedParagraph.length / charactersPerLine) + 1
      } else {
        break
      }
    }

    let result = paragraphs.join("\n\n")

    // Ensure text fits within character limits
    const maxCharacters = charactersPerLine * maxLines
    if (result.length > maxCharacters) {
      result = result.substring(0, maxCharacters - 3) + "..."
    }

    return result
  }

  static generateHeadline(): string {
    return this.HEADLINES[Math.floor(Math.random() * this.HEADLINES.length)]
  }

  static generateCaption(): string {
    return this.CAPTIONS[Math.floor(Math.random() * this.CAPTIONS.length)]
  }

  static generateSubheading(): string {
    const words = Math.floor(Math.random() * 4) + 4
    return this.generateSentence(words, words).replace(".", "")
  }

  // Apply proper hyphenation for professional text layout
  private static applyHyphenation(text: string): string {
    const hyphenationRules = {
      consectetur: "con-sec-te-tur",
      exercitation: "ex-er-ci-ta-tion",
      reprehenderit: "rep-re-hen-de-rit",
      incididunt: "in-ci-di-dunt",
      cupidatat: "cu-pi-da-tat",
      proident: "pro-i-dent",
      deserunt: "de-se-runt",
      laborum: "la-bo-rum",
      voluptate: "vo-lup-ta-te",
      excepteur: "ex-cep-teur",
      accusamus: "ac-cu-sa-mus",
      accusantium: "ac-cu-san-ti-um",
      doloremque: "do-lo-rem-que",
      laudantium: "lau-dan-ti-um",
      architecto: "ar-chi-tec-to",
      inventore: "in-ven-to-re",
      veritatis: "ve-ri-ta-tis",
      explicabo: "ex-pli-ca-bo",
      consequuntur: "con-se-quen-tur",
      aspernatur: "as-per-na-tur",
      quisquam: "quis-quam",
      voluptatem: "vo-lup-ta-tem",
      communication: "com-mu-ni-ca-tion",
      implementation: "im-ple-men-ta-tion",
      architecture: "ar-chi-tec-ture",
      specification: "spec-i-fi-ca-tion",
      optimization: "op-ti-mi-za-tion",
    }

    let hyphenatedText = text
    Object.entries(hyphenationRules).forEach(([word, hyphenated]) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      hyphenatedText = hyphenatedText.replace(regex, hyphenated)
    })

    return hyphenatedText
  }

  // Generate justified text with proper word spacing
  static generateJustifiedText(wordCount: number, charactersPerLine: number, maxLines: number): string {
    const text = this.generateFormattedText(wordCount, charactersPerLine, maxLines)
    return this.applyJustification(text, charactersPerLine)
  }

  private static applyJustification(text: string, charactersPerLine: number): string {
    const lines = text.split("\n")
    const justifiedLines = lines.map((line) => {
      if (line.trim().length === 0) return line

      const words = line.trim().split(" ")
      if (words.length === 1) return line

      const totalChars = words.join("").length
      const spacesNeeded = charactersPerLine - totalChars
      const gaps = words.length - 1

      if (gaps > 0 && spacesNeeded > gaps) {
        const baseSpaces = Math.floor(spacesNeeded / gaps)
        const extraSpaces = spacesNeeded % gaps

        let justifiedLine = ""
        for (let i = 0; i < words.length; i++) {
          justifiedLine += words[i]
          if (i < words.length - 1) {
            justifiedLine += " ".repeat(baseSpaces + (i < extraSpaces ? 1 : 0))
          }
        }
        return justifiedLine
      }

      return line
    })

    return justifiedLines.join("\n")
  }
}

// Export default function for backward compatibility
export function generateLoremText(wordCount: number): string {
  return LoremGenerator.generateText(wordCount)
}
