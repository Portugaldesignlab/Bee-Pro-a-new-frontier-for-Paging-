// Enhanced Lorem Ipsum generator with hyphenation support
export class LoremGenerator {
  private static words = [
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
  ]

  private static hyphenationRules = {
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
  }

  static generateText(wordCount: number): string {
    let text = ""
    for (let i = 0; i < wordCount; i++) {
      const word = this.words[Math.floor(Math.random() * this.words.length)]
      text += (i === 0 ? this.capitalize(word) : word) + " "
    }
    return this.applyHyphenation(text.trim())
  }

  static generateParagraph(sentenceCount = 5): string {
    let paragraph = ""
    for (let i = 0; i < sentenceCount; i++) {
      const sentenceLength = Math.floor(Math.random() * 10) + 8
      let sentence = this.generateText(sentenceLength)
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ". "
      paragraph += sentence
    }
    return this.applyHyphenation(paragraph.trim())
  }

  static generateHeadline(): string {
    const headlineWords = Math.floor(Math.random() * 4) + 3
    return this.capitalize(this.generateText(headlineWords))
  }

  static generateCaption(): string {
    const captionWords = Math.floor(Math.random() * 8) + 5
    return this.generateText(captionWords) + "."
  }

  private static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  private static applyHyphenation(text: string): string {
    let hyphenatedText = text
    Object.entries(this.hyphenationRules).forEach(([word, hyphenated]) => {
      const regex = new RegExp(word, "gi")
      hyphenatedText = hyphenatedText.replace(regex, hyphenated)
    })
    return hyphenatedText
  }

  static generateByRole(role: string, elementWidth: number, elementHeight: number): string {
    const wordsPerLine = Math.max(1, Math.floor(elementWidth / 8))
    const linesAvailable = Math.max(1, Math.floor(elementHeight / 1.4))
    const totalWords = wordsPerLine * linesAvailable

    switch (role) {
      case "headline":
        return this.generateHeadline()
      case "body":
        const paragraphs = Math.ceil(totalWords / 50)
        return Array.from({ length: paragraphs }, () => this.generateParagraph()).join("\n\n")
      case "caption":
        return this.generateCaption()
      default:
        return this.generateText(Math.min(totalWords, 50))
    }
  }
}

export function generateLoremText(wordCount: number): string {
  return LoremGenerator.generateText(wordCount)
}
