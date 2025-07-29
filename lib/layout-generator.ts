import type { LayoutConfig, LayoutElement, GeneratedLayout } from "@/types/layout"
import { generateLoremText } from "./lorem-generator"

export interface GridPosition {
  gridX: number
  gridY: number
}

// Fibonacci sequence for grid calculations
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

// Golden ratio
const GOLDEN_RATIO = 1.618

interface PagePlan {
  pageNumber: number
  pageType: "left" | "right" | "spread"
  elements: ElementPlan[]
  visualWeight: number
  dominantType: "image" | "text" | "balanced"
}

interface ElementPlan {
  id: string
  type: "image" | "text"
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
  priority: number
  textStyle?: "headline" | "subhead" | "body" | "caption"
  visualWeight: number
  flowConnection?: string // ID of element this connects to
}

interface GridCell {
  x: number
  y: number
  occupied: boolean
  elementId?: string
  weight: number
}

interface LayoutFlow {
  pages: PagePlan[]
  totalElements: number
  imageCount: number
  textCount: number
  visualBalance: number
}

// Content area calculation helper
function calculateContentArea(config: LayoutConfig) {
  const pageWidth = config.pageSize === "custom" ? config.customWidth : getPageDimensions(config.pageSize).width
  const pageHeight = config.pageSize === "custom" ? config.customHeight : getPageDimensions(config.pageSize).height

  return {
    top: config.marginTop,
    left: config.marginLeft,
    width: pageWidth - config.marginLeft - config.marginRight,
    height: pageHeight - config.marginTop - config.marginBottom,
    pageWidth,
    pageHeight,
  }
}

// Grid system helper
function calculateGridSystem(contentArea: { width: number; height: number }, config: LayoutConfig) {
  const gridColumns = config.columns
  const gridRows = config.rows
  const gutterX = config.gridSpacingX
  const gutterY = config.gridSpacingY

  const columnWidth = (contentArea.width - (gridColumns - 1) * gutterX) / gridColumns
  const rowHeight = (contentArea.height - (gridRows - 1) * gutterY) / gridRows

  return {
    columnWidth,
    rowHeight,
    gridColumns,
    gridRows,
    gutterX,
    gutterY,
  }
}

// Grid occupancy tracker
class GridOccupancy {
  private grid: boolean[][]
  private columns: number
  private rows: number

  constructor(columns: number, rows: number) {
    this.columns = columns
    this.rows = rows
    this.grid = Array(rows)
      .fill(null)
      .map(() => Array(columns).fill(false))
  }

  findAvailableSpace(width: number, height: number): { x: number; y: number } | null {
    for (let y = 0; y <= this.rows - height; y++) {
      for (let x = 0; x <= this.columns - width; x++) {
        if (this.canPlace(x, y, width, height)) {
          return { x, y }
        }
      }
    }
    return null
  }

  canPlace(x: number, y: number, width: number, height: number): boolean {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        if (row >= this.rows || col >= this.columns || this.grid[row][col]) {
          return false
        }
      }
    }
    return true
  }

  occupy(x: number, y: number, width: number, height: number): void {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        if (row < this.rows && col < this.columns) {
          this.grid[row][col] = true
        }
      }
    }
  }

  reset(): void {
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(this.columns).fill(false))
  }
}

// Content templates with priority-based sizing
const contentTemplates = [
  {
    type: "text",
    priority: 9,
    role: "headline",
    minWidth: 3,
    maxWidth: 6,
    minHeight: 1,
    maxHeight: 2,
    textStyle: "headline",
  },
  {
    type: "text",
    priority: 7,
    role: "subheader",
    minWidth: 2,
    maxWidth: 5,
    minHeight: 1,
    maxHeight: 2,
    textStyle: "subhead",
  },
  { type: "text", priority: 6, role: "body", minWidth: 2, maxWidth: 4, minHeight: 2, maxHeight: 5, textStyle: "body" },
  {
    type: "text",
    priority: 4,
    role: "caption",
    minWidth: 1,
    maxWidth: 3,
    minHeight: 1,
    maxHeight: 2,
    textStyle: "caption",
  },
  { type: "image", priority: 8, role: "hero", minWidth: 3, maxWidth: 5, minHeight: 3, maxHeight: 5 },
  { type: "image", priority: 6, role: "supporting", minWidth: 2, maxWidth: 4, minHeight: 2, maxHeight: 4 },
  { type: "image", priority: 3, role: "thumbnail", minWidth: 1, maxWidth: 2, minHeight: 1, maxHeight: 2 },
]

// Page dimensions helper
function getPageDimensions(pageSize: string) {
  const dimensions = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
    Tabloid: { width: 279, height: 432 },
  }
  return dimensions[pageSize as keyof typeof dimensions] || dimensions.A4
}

// Smart layout generation with aesthetic rules
function applyAestheticRule(
  elements: ElementPlan[],
  rule: string,
  gridColumns: number,
  gridRows: number,
): ElementPlan[] {
  switch (rule) {
    case "golden-ratio":
      // Apply golden ratio positioning
      const goldenX = Math.floor(gridColumns * 0.618)
      const goldenY = Math.floor(gridRows * 0.618)

      elements.forEach((element, index) => {
        if (element.priority >= 7) {
          element.gridX = Math.min(goldenX, gridColumns - element.gridWidth)
          element.gridY = Math.min(goldenY, gridRows - element.gridHeight)
        }
      })
      break

    case "rule-of-thirds":
      // Apply rule of thirds positioning
      const thirdX = Math.floor(gridColumns / 3)
      const thirdY = Math.floor(gridRows / 3)

      elements.forEach((element, index) => {
        if (element.priority >= 7) {
          element.gridX = Math.min(thirdX * ((index % 2) + 1), gridColumns - element.gridWidth)
          element.gridY = Math.min(thirdY * ((Math.floor(index / 2) % 2) + 1), gridRows - element.gridHeight)
        }
      })
      break

    case "fibonacci":
      // Apply fibonacci sequence to sizing
      elements.forEach((element, index) => {
        const fibIndex = Math.min(index, FIBONACCI.length - 1)
        const fibValue = FIBONACCI[fibIndex]
        element.gridWidth = Math.min(fibValue, gridColumns, element.gridWidth)
        element.gridHeight = Math.min(Math.ceil(fibValue * 0.618), gridRows, element.gridHeight)
      })
      break
  }

  return elements
}

// Create a text element with proper defaults
export function createTextElement(
  config: LayoutConfig,
  page: number,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
  textType: "heading" | "body" | "caption" = "body",
): LayoutElement {
  const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Calculate position and size based on grid
  const cellWidth = (config.pageSize === "custom" ? config.customWidth : 210) / config.columns
  const cellHeight = (config.pageSize === "custom" ? config.customHeight : 297) / config.rows

  const x = gridX * (cellWidth + config.gridSpacingX) + (config.marginLeft || 20)
  const y = gridY * (cellHeight + config.gridSpacingY) + (config.marginTop || 20)
  const width = gridWidth * cellWidth + (gridWidth - 1) * config.gridSpacingX
  const height = gridHeight * cellHeight + (gridHeight - 1) * config.gridSpacingY

  let fontSize = config.baseFontSize || 12
  let content = ""

  switch (textType) {
    case "heading":
      fontSize = (config.baseFontSize || 12) * 1.5
      content = "Heading Text"
      break
    case "body":
      fontSize = config.baseFontSize || 12
      content = generateLoremText(50)
      break
    case "caption":
      fontSize = (config.baseFontSize || 12) * 0.8
      content = "Caption text"
      break
  }

  return {
    id,
    type: "text",
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(30, height),
    page,
    content,
    fontSize,
    fontFamily: config.primaryFont || "Arial",
    color: config.textColor || "#000000",
    textAlign: "left",
    leading: config.baseLeading || 1.4,
    rotation: 0,
    locked: false,
    hidden: false,
  }
}

// Create an image element with proper defaults
export function createImageElement(
  config: LayoutConfig,
  page: number,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
): LayoutElement {
  const id = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Calculate position and size based on grid
  const cellWidth = (config.pageSize === "custom" ? config.customWidth : 210) / config.columns
  const cellHeight = (config.pageSize === "custom" ? config.customHeight : 297) / config.rows

  const x = gridX * (cellWidth + config.gridSpacingX) + (config.marginLeft || 20)
  const y = gridY * (cellHeight + config.gridSpacingY) + (config.marginTop || 20)
  const width = gridWidth * cellWidth + (gridWidth - 1) * config.gridSpacingX
  const height = gridHeight * cellHeight + (gridHeight - 1) * config.gridSpacingY

  return {
    id,
    type: "image",
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(50, height),
    page,
    content: `/placeholder.svg?height=${Math.round(height)}&width=${Math.round(width)}&text=Image`,
    rotation: 0,
    locked: false,
    hidden: false,
  }
}

// Find the next available position in the grid
export function findNextAvailablePosition(
  existingElements: LayoutElement[],
  page: number,
  totalColumns: number,
  totalRows: number,
  elementWidth: number,
  elementHeight: number,
): GridPosition {
  // Filter elements for the current page
  const pageElements = existingElements.filter((el) => el.page === page)

  // Create a grid to track occupied positions
  const grid: boolean[][] = Array(totalRows)
    .fill(null)
    .map(() => Array(totalColumns).fill(false))

  // Mark occupied positions
  pageElements.forEach((element) => {
    // Convert element position back to grid coordinates (approximate)
    const gridX = Math.floor(element.x / (210 / totalColumns))
    const gridY = Math.floor(element.y / (297 / totalRows))
    const gridW = Math.ceil(element.width / (210 / totalColumns))
    const gridH = Math.ceil(element.height / (297 / totalRows))

    // Mark all cells this element occupies
    for (let y = gridY; y < Math.min(gridY + gridH, totalRows); y++) {
      for (let x = gridX; x < Math.min(gridX + gridW, totalColumns); x++) {
        if (y >= 0 && x >= 0) {
          grid[y][x] = true
        }
      }
    }
  })

  // Find the first available position
  for (let y = 0; y <= totalRows - elementHeight; y++) {
    for (let x = 0; x <= totalColumns - elementWidth; x++) {
      let canPlace = true

      // Check if the element can fit at this position
      for (let dy = 0; dy < elementHeight && canPlace; dy++) {
        for (let dx = 0; dx < elementWidth && canPlace; dx++) {
          if (grid[y + dy] && grid[y + dy][x + dx]) {
            canPlace = false
          }
        }
      }

      if (canPlace) {
        return { gridX: x, gridY: y }
      }
    }
  }

  // If no position found, return a default position
  return { gridX: 0, gridY: 0 }
}

// Generate a complete layout
export function generateLayout(config: LayoutConfig): GeneratedLayout {
  const elements: LayoutElement[] = []
  const totalPages = config.pageCount || 6

  // Generate elements for each page
  for (let page = 1; page <= totalPages; page++) {
    // Add a heading
    elements.push(createTextElement(config, page, 0, 0, 4, 1, "heading"))

    // Add body text
    elements.push(createTextElement(config, page, 0, 2, 3, 3, "body"))

    // Add an image
    elements.push(createImageElement(config, page, 4, 1, 2, 2))

    // Add a caption
    elements.push(createTextElement(config, page, 4, 3, 2, 1, "caption"))
  }

  return {
    id: `layout-${Date.now()}`,
    elements,
    config,
    createdAt: new Date(),
  }
}
