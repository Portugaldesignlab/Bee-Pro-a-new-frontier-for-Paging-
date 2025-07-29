import type { PageSizeOption } from "@/types/layout"

export const PAGE_SIZES: PageSizeOption[] = [
  // Standard Sizes
  { id: "A4", name: "A4 Portrait", width: 210, height: 297, category: "standard" },
  { id: "A4-landscape", name: "A4 Landscape", width: 297, height: 210, category: "standard" },
  { id: "A3", name: "A3 Portrait", width: 297, height: 420, category: "standard" },
  { id: "A3-landscape", name: "A3 Landscape", width: 420, height: 297, category: "standard" },
  { id: "A5", name: "A5 Portrait", width: 148, height: 210, category: "standard" },
  { id: "A5-landscape", name: "A5 Landscape", width: 210, height: 148, category: "standard" },
  { id: "US-Letter", name: "US Letter Portrait", width: 216, height: 279, category: "standard" },
  { id: "US-Letter-landscape", name: "US Letter Landscape", width: 279, height: 216, category: "standard" },
  { id: "US-Legal", name: "US Legal Portrait", width: 216, height: 356, category: "standard" },
  { id: "US-Legal-landscape", name: "US Legal Landscape", width: 356, height: 216, category: "standard" },
  { id: "Tabloid", name: "Tabloid Portrait", width: 279, height: 432, category: "standard" },
  { id: "Tabloid-landscape", name: "Tabloid Landscape", width: 432, height: 279, category: "standard" },

  // Portrait Book Sizes
  { id: "mass-market", name: "Mass Market Paperback", width: 108, height: 175, category: "book" },
  { id: "trade-paperback", name: "Trade Paperback", width: 152, height: 229, category: "book" },
  { id: "digest", name: "Digest", width: 140, height: 216, category: "book" },
  { id: "royal-octavo", name: "Royal Octavo", width: 156, height: 234, category: "book" },
  { id: "crown-quarto", name: "Crown Quarto", width: 189, height: 246, category: "book" },
  { id: "demy-octavo", name: "Demy Octavo", width: 138, height: 216, category: "book" },
  { id: "royal-quarto", name: "Royal Quarto", width: 234, height: 312, category: "book" },
  { id: "comic-book", name: "Comic Book", width: 170, height: 260, category: "book" },
  { id: "manga", name: "Manga", width: 128, height: 182, category: "book" },
  { id: "novel-standard", name: "Novel Standard", width: 140, height: 210, category: "book" },
  { id: "textbook", name: "Textbook", width: 203, height: 254, category: "book" },

  // Landscape Book Sizes
  { id: "landscape-large", name: "Landscape Large", width: 279, height: 216, category: "book" },
  { id: "landscape-standard", name: "Landscape Standard", width: 254, height: 203, category: "book" },
  { id: "landscape-small", name: "Landscape Small", width: 229, height: 152, category: "book" },
  { id: "coffee-table", name: "Coffee Table Book", width: 305, height: 254, category: "book" },
  { id: "art-book-landscape", name: "Art Book Landscape", width: 305, height: 229, category: "book" },
  { id: "photo-book", name: "Photo Book", width: 280, height: 210, category: "book" },
  { id: "calendar", name: "Calendar", width: 297, height: 210, category: "book" },
  { id: "cookbook", name: "Cookbook", width: 254, height: 203, category: "book" },
  { id: "children-landscape", name: "Children's Book Landscape", width: 254, height: 203, category: "book" },

  // Square Book Sizes
  { id: "square-large", name: "Square Large", width: 254, height: 254, category: "book" },
  { id: "square-medium", name: "Square Medium", width: 203, height: 203, category: "book" },
  { id: "square-small", name: "Square Small", width: 178, height: 178, category: "book" },
  { id: "instagram-book", name: "Instagram Book", width: 210, height: 210, category: "book" },

  // Portrait Art & Specialty Books
  { id: "art-book", name: "Art Book Portrait", width: 229, height: 305, category: "book" },
  { id: "exhibition-catalog", name: "Exhibition Catalog", width: 210, height: 280, category: "book" },
  { id: "poetry-book", name: "Poetry Book", width: 127, height: 203, category: "book" },
  { id: "journal", name: "Journal/Notebook", width: 148, height: 210, category: "book" },

  // Custom option
  { id: "custom", name: "Custom Size", width: 210, height: 297, category: "custom" },
]

export function getPageSize(id: string): PageSizeOption {
  return PAGE_SIZES.find((size) => size.id === id) || PAGE_SIZES[0]
}

export function mmToInches(mm: number): number {
  return mm / 25.4
}

export function inchesToMm(inches: number): number {
  return inches * 25.4
}

export function formatDimensions(width: number, height: number): string {
  const widthInches = mmToInches(width)
  const heightInches = mmToInches(height)
  return `${width}×${height}mm (${widthInches.toFixed(1)}×${heightInches.toFixed(1)}")`
}

export function getOrientation(width: number, height: number): "portrait" | "landscape" | "square" {
  if (width === height) return "square"
  return width > height ? "landscape" : "portrait"
}

export function getOrientationIcon(width: number, height: number): string {
  const orientation = getOrientation(width, height)
  switch (orientation) {
    case "landscape":
      return "📖"
    case "square":
      return "⬜"
    default:
      return "📄"
  }
}
