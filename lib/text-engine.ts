// Professional text engine with hyphenation and justification
export class TextEngine {
  private hyphenationPatterns: Map<string, string[]> = new Map()

  constructor() {
    this.initializeHyphenationPatterns()
  }

  private initializeHyphenationPatterns() {
    // Basic English hyphenation patterns
    const patterns = [
      ["computer", ["com-pu-ter"]],
      ["professional", ["pro-fes-sion-al"]],
      ["typography", ["ty-pog-ra-phy"]],
      ["hyphenation", ["hy-phen-a-tion"]],
      ["justification", ["jus-ti-fi-ca-tion"]],
      ["algorithm", ["al-go-rithm"]],
      ["publishing", ["pub-lish-ing"]],
      ["document", ["doc-u-ment"]],
      ["paragraph", ["par-a-graph"]],
      ["character", ["char-ac-ter"]],
      ["beautiful", ["beau-ti-ful"]],
      ["important", ["im-por-tant"]],
      ["different", ["dif-fer-ent"]],
      ["information", ["in-for-ma-tion"]],
      ["development", ["de-vel-op-ment"]],
      ["experience", ["ex-pe-ri-ence"]],
      ["understand", ["un-der-stand"]],
      ["knowledge", ["knowl-edge"]],
      ["technology", ["tech-nol-o-gy"]],
      ["application", ["ap-pli-ca-tion"]],
    ]

    patterns.forEach(([word, breaks]) => {
      this.hyphenationPatterns.set(word as string, breaks as string[])
    })
  }

  public hyphenateWord(word: string): string {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "")

    if (cleanWord.length < 4) return word

    // Check if we have a pattern for this word
    if (this.hyphenationPatterns.has(cleanWord)) {
      const pattern = this.hyphenationPatterns.get(cleanWord)!
      return pattern[0] // Return the hyphenated version
    }

    // Basic algorithmic hyphenation for unknown words
    return this.algorithmicHyphenation(word)
  }

  private algorithmicHyphenation(word: string): string {
    if (word.length < 6) return word

    // Simple rules for common patterns
    const vowels = "aeiouAEIOU"
    const consonants = "bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ"

    let result = word

    // Look for vowel-consonant-consonant-vowel patterns
    for (let i = 1; i < word.length - 2; i++) {
      if (
        vowels.includes(word[i]) &&
        consonants.includes(word[i + 1]) &&
        consonants.includes(word[i + 2]) &&
        vowels.includes(word[i + 3])
      ) {
        result = word.slice(0, i + 2) + "-" + word.slice(i + 2)
        break
      }
    }

    return result
  }

  public justifyText(
    text: string,
    lineWidth: number,
    fontSize: number,
    settings: {
      wordSpacing: number
      letterSpacing: number
      glyphScaling: number
      maxWordSpacing: number
      maxLetterSpacing: number
    },
  ): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine: string[] = []
    let currentWidth = 0

    const spaceWidth = fontSize * 0.25 // Approximate space width
    const avgCharWidth = fontSize * 0.6 // Approximate character width

    for (const word of words) {
      const wordWidth = word.length * avgCharWidth
      const spaceNeeded = currentLine.length > 0 ? spaceWidth : 0

      if (currentWidth + spaceNeeded + wordWidth <= lineWidth) {
        currentLine.push(word)
        currentWidth += spaceNeeded + wordWidth
      } else {
        if (currentLine.length > 0) {
          lines.push(this.justifyLine(currentLine, lineWidth, settings))
          currentLine = [word]
          currentWidth = wordWidth
        } else {
          // Word is too long, try to hyphenate
          const hyphenated = this.hyphenateWord(word)
          if (hyphenated.includes("-")) {
            const parts = hyphenated.split("-")
            currentLine.push(parts[0] + "-")
            lines.push(this.justifyLine(currentLine, lineWidth, settings))
            currentLine = [parts.slice(1).join("")]
            currentWidth = currentLine[0].length * avgCharWidth
          } else {
            currentLine.push(word)
            currentWidth = wordWidth
          }
        }
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join(" ")) // Don't justify the last line
    }

    return lines
  }

  private justifyLine(
    words: string[],
    lineWidth: number,
    settings: {
      wordSpacing: number
      letterSpacing: number
      glyphScaling: number
      maxWordSpacing: number
      maxLetterSpacing: number
    },
  ): string {
    if (words.length === 1) return words[0]

    const totalChars = words.reduce((sum, word) => sum + word.length, 0)
    const avgCharWidth = 0.6 // Relative to font size
    const naturalWidth = totalChars * avgCharWidth + (words.length - 1) * 0.25

    const expansionNeeded = lineWidth - naturalWidth
    const gaps = words.length - 1

    if (expansionNeeded <= 0) return words.join(" ")

    // Distribute expansion across word spaces first
    const extraSpacePerGap = expansionNeeded / gaps
    const maxExtraSpace = settings.maxWordSpacing - 100 // Convert percentage to ratio

    if (extraSpacePerGap <= maxExtraSpace) {
      // Can justify with word spacing alone
      return words.join(" ") // Simplified - in real implementation, would adjust spacing
    } else {
      // Need to use letter spacing as well
      return words.join(" ") // Simplified - in real implementation, would adjust both
    }
  }

  public checkOrphansAndWidows(lines: string[]): {
    hasOrphans: boolean
    hasWidows: boolean
    suggestions: string[]
  } {
    const suggestions: string[] = []
    const hasOrphans = false
    let hasWidows = false

    // Check for widows (single word on last line)
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1]
      const words = lastLine.trim().split(" ")
      if (words.length === 1 && words[0].length < 8) {
        hasWidows = true
        suggestions.push("Consider adjusting tracking or word spacing to pull more text to the last line")
      }
    }

    // Check for orphans (single line at top of column/page)
    // This would need page context to implement properly

    return { hasOrphans, hasWidows, suggestions }
  }
}

export const textEngine = new TextEngine()
