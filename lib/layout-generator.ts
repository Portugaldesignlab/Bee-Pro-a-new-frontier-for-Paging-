import type { LayoutConfig, LayoutElement, GeneratedLayout } from "@/types/layout"
import { LoremGenerator } from "./lorem-generator"

export interface GridPosition {
  gridX: number
  gridY: number
}

// Fixed grid system parameters with spread support
const GRID_CONFIG = {
  columns: 3,
  rows: 4,
  horizontalGutter: 12, // mm
  verticalGutter: 14, // mm
}

// Content type definitions with grid sizing
const CONTENT_TYPES = {
  title: {
    priority: 10,
    minWidth: 2,
    maxWidth: 6, // Can span across spread
    minHeight: 1,
    maxHeight: 1,
    weight: 0.9,
  },
  subtitle: {
    priority: 8,
    minWidth: 1,
    maxWidth: 3,
    minHeight: 1,
    maxHeight: 1,
    weight: 0.7,
  },
  body: {
    priority: 6,
    minWidth: 1,
    maxWidth: 3,
    minHeight: 2,
    maxHeight: 3,
    weight: 0.5,
  },
  image: {
    priority: 7,
    minWidth: 1,
    maxWidth: 4, // Can be larger in spreads
    minHeight: 1,
    maxHeight: 3,
    weight: 0.6,
  },
  caption: {
    priority: 4,
    minWidth: 1,
    maxWidth: 2,
    minHeight: 1,
    maxHeight: 1,
    weight: 0.3,
  },
}

// Layout templates for single pages
const SINGLE_PAGE_PATTERNS = [
  {
    name: "title-focus",
    elements: [
      { type: "title", gridWidth: 3, gridHeight: 1, preferredX: 0, preferredY: 0 },
      { type: "image", gridWidth: 2, gridHeight: 2, preferredX: 0, preferredY: 1 },
      { type: "body", gridWidth: 1, gridHeight: 2, preferredX: 2, preferredY: 1 },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 3 },
    ],
  },
  {
    name: "balanced",
    elements: [
      { type: "title", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 0 },
      { type: "subtitle", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 0 },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 0, preferredY: 1 },
      { type: "image", gridWidth: 1, gridHeight: 2, preferredX: 2, preferredY: 1 },
      { type: "caption", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 3 },
    ],
  },
  {
    name: "image-dominant",
    elements: [
      { type: "title", gridWidth: 2, gridHeight: 1, preferredX: 1, preferredY: 0 },
      { type: "image", gridWidth: 2, gridHeight: 3, preferredX: 0, preferredY: 1 },
      { type: "body", gridWidth: 1, gridHeight: 2, preferredX: 2, preferredY: 1 },
      { type: "caption", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 3 },
    ],
  },
  {
    name: "text-heavy",
    elements: [
      { type: "title", gridWidth: 3, gridHeight: 1, preferredX: 0, preferredY: 0 },
      { type: "subtitle", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 1 },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 0, preferredY: 2 },
      { type: "image", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 1 },
      { type: "caption", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 2 },
    ],
  },
  {
    name: "asymmetric",
    elements: [
      { type: "title", gridWidth: 2, gridHeight: 1, preferredX: 1, preferredY: 0 },
      { type: "image", gridWidth: 1, gridHeight: 2, preferredX: 0, preferredY: 1 },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 1, preferredY: 1 },
      { type: "subtitle", gridWidth: 1, gridHeight: 1, preferredX: 0, preferredY: 3 },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 1, preferredY: 3 },
    ],
  },
  {
    name: "minimal",
    elements: [
      { type: "title", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 0 },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 0, preferredY: 1 },
      { type: "image", gridWidth: 1, gridHeight: 2, preferredX: 2, preferredY: 0 },
      { type: "caption", gridWidth: 1, gridHeight: 1, preferredX: 2, preferredY: 2 },
    ],
  },
]

// Layout templates for spreads (6 columns total)
const SPREAD_PATTERNS = [
  {
    name: "spread-hero",
    elements: [
      { type: "title", gridWidth: 6, gridHeight: 1, preferredX: 0, preferredY: 0, spreadPosition: "span" },
      { type: "image", gridWidth: 4, gridHeight: 3, preferredX: 0, preferredY: 1, spreadPosition: "left" },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 4, preferredY: 1, spreadPosition: "right" },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 3, spreadPosition: "right" },
    ],
  },
  {
    name: "spread-balanced",
    elements: [
      { type: "title", gridWidth: 3, gridHeight: 1, preferredX: 0, preferredY: 0, spreadPosition: "left" },
      { type: "subtitle", gridWidth: 3, gridHeight: 1, preferredX: 3, preferredY: 0, spreadPosition: "right" },
      { type: "body", gridWidth: 2, gridHeight: 3, preferredX: 0, preferredY: 1, spreadPosition: "left" },
      { type: "image", gridWidth: 2, gridHeight: 2, preferredX: 2, preferredY: 1, spreadPosition: "center" },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 4, preferredY: 1, spreadPosition: "right" },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 3, spreadPosition: "right" },
    ],
  },
  {
    name: "spread-magazine",
    elements: [
      { type: "title", gridWidth: 4, gridHeight: 1, preferredX: 1, preferredY: 0, spreadPosition: "center" },
      { type: "image", gridWidth: 3, gridHeight: 2, preferredX: 0, preferredY: 1, spreadPosition: "left" },
      { type: "body", gridWidth: 3, gridHeight: 2, preferredX: 3, preferredY: 1, spreadPosition: "right" },
      { type: "subtitle", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 3, spreadPosition: "left" },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 3, spreadPosition: "right" },
    ],
  },
  {
    name: "spread-asymmetric",
    elements: [
      { type: "title", gridWidth: 3, gridHeight: 1, preferredX: 2, preferredY: 0, spreadPosition: "right" },
      { type: "image", gridWidth: 2, gridHeight: 3, preferredX: 0, preferredY: 1, spreadPosition: "left" },
      { type: "body", gridWidth: 2, gridHeight: 2, preferredX: 2, preferredY: 1, spreadPosition: "center" },
      { type: "image", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 1, spreadPosition: "right" },
      { type: "caption", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 2, spreadPosition: "right" },
    ],
  },
  {
    name: "spread-text-focus",
    elements: [
      { type: "title", gridWidth: 4, gridHeight: 1, preferredX: 1, preferredY: 0, spreadPosition: "center" },
      { type: "subtitle", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 1, spreadPosition: "left" },
      { type: "body", gridWidth: 3, gridHeight: 2, preferredX: 0, preferredY: 2, spreadPosition: "left" },
      { type: "body", gridWidth: 2, gridHeight: 3, preferredX: 4, preferredY: 1, spreadPosition: "right" },
      { type: "image", gridWidth: 1, gridHeight: 2, preferredX: 3, preferredY: 2, spreadPosition: "center" },
    ],
  },
  {
    name: "spread-visual",
    elements: [
      { type: "image", gridWidth: 4, gridHeight: 2, preferredX: 1, preferredY: 0, spreadPosition: "center" },
      { type: "title", gridWidth: 2, gridHeight: 1, preferredX: 0, preferredY: 2, spreadPosition: "left" },
      { type: "subtitle", gridWidth: 2, gridHeight: 1, preferredX: 4, preferredY: 2, spreadPosition: "right" },
      { type: "body", gridWidth: 3, gridHeight: 1, preferredX: 0, preferredY: 3, spreadPosition: "left" },
      { type: "caption", gridWidth: 3, gridHeight: 1, preferredX: 3, preferredY: 3, spreadPosition: "right" },
    ],
  },
]

interface ElementPlan {
  id: string
  type: "title" | "subtitle" | "body" | "image" | "caption"
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
  priority: number
  spreadPosition?: "left" | "right" | "center" | "span"
  page: number
}

// Grid occupancy tracker with spread support
class GridOccupancy {
  private grid: boolean[][]
  private columns: number
  private rows: number
  private isSpread: boolean

  constructor(columns: number, rows: number, isSpread = false) {
    this.columns = columns
    this.rows = rows
    this.isSpread = isSpread
    const totalColumns = isSpread ? columns * 2 : columns
    this.grid = Array(rows)
      .fill(null)
      .map(() => Array(totalColumns).fill(false))
  }

  canPlace(x: number, y: number, width: number, height: number): boolean {
    const totalColumns = this.isSpread ? this.columns * 2 : this.columns

    // Check boundaries
    if (x < 0 || y < 0 || x + width > totalColumns || y + height > this.rows) {
      return false
    }

    // Check for collisions
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        if (this.grid[row][col]) {
          return false
        }
      }
    }
    return true
  }

  occupy(x: number, y: number, width: number, height: number): void {
    const totalColumns = this.isSpread ? this.columns * 2 : this.columns

    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        if (row < this.rows && col < totalColumns && row >= 0 && col >= 0) {
          this.grid[row][col] = true
        }
      }
    }
  }

  findAvailableSpace(
    width: number,
    height: number,
    preferredX?: number,
    preferredY?: number,
    spreadPosition?: "left" | "right" | "center" | "span",
  ): { x: number; y: number } | null {
    const totalColumns = this.isSpread ? this.columns * 2 : this.columns

    // Handle spread positioning constraints
    if (this.isSpread && spreadPosition) {
      let searchStartX = 0
      let searchEndX = totalColumns - width

      switch (spreadPosition) {
        case "left":
          searchEndX = this.columns - width
          break
        case "right":
          searchStartX = this.columns
          break
        case "center":
          searchStartX = Math.max(0, this.columns - Math.floor(width / 2))
          searchEndX = Math.min(totalColumns - width, this.columns + Math.floor(width / 2))
          break
        case "span":
          // Allow spanning across both pages
          break
      }

      // Try preferred position first within constraints
      if (preferredX !== undefined && preferredY !== undefined) {
        const constrainedX = Math.max(searchStartX, Math.min(preferredX, searchEndX))
        if (this.canPlace(constrainedX, preferredY, width, height)) {
          return { x: constrainedX, y: preferredY }
        }
      }

      // Search within constraints
      for (let y = 0; y <= this.rows - height; y++) {
        for (let x = searchStartX; x <= searchEndX; x++) {
          if (this.canPlace(x, y, width, height)) {
            return { x, y }
          }
        }
      }
    } else {
      // Standard search for single page or unconstrained spread
      if (preferredX !== undefined && preferredY !== undefined) {
        if (this.canPlace(preferredX, preferredY, width, height)) {
          return { x: preferredX, y: preferredY }
        }
      }

      for (let y = 0; y <= this.rows - height; y++) {
        for (let x = 0; x <= totalColumns - width; x++) {
          if (this.canPlace(x, y, width, height)) {
            return { x, y }
          }
        }
      }
    }

    return null
  }

  reset(): void {
    const totalColumns = this.isSpread ? this.columns * 2 : this.columns
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(totalColumns).fill(false))
  }
}

// Calculate content area within margins and bleed with spread support
function calculateContentArea(config: LayoutConfig) {
  const pageWidth = config.pageSize === "custom" ? config.customWidth : getPageDimensions(config.pageSize).width
  const pageHeight = config.pageSize === "custom" ? config.customHeight : getPageDimensions(config.pageSize).height

  if (config.spreadView) {
    return {
      top: config.marginTop,
      left: config.marginOuter,
      width: pageWidth * 2 + (config.bindingGutter || 0) - config.marginOuter - config.marginInner,
      height: pageHeight - config.marginTop - config.marginBottom,
      pageWidth: pageWidth * 2 + (config.bindingGutter || 0),
      pageHeight,
      leftPageWidth: pageWidth - config.marginOuter - config.marginInner,
      rightPageWidth: pageWidth - config.marginInner - config.marginOuter,
      bindingGutter: config.bindingGutter || 0,
      isSpread: true,
    }
  }

  // Respect existing margins and bleed for single pages
  const effectiveMarginTop = config.marginTop
  const effectiveMarginBottom = config.marginBottom
  const effectiveMarginLeft = config.marginLeft
  const effectiveMarginRight = config.marginRight

  return {
    top: effectiveMarginTop,
    left: effectiveMarginLeft,
    width: pageWidth - effectiveMarginLeft - effectiveMarginRight,
    height: pageHeight - effectiveMarginTop - effectiveMarginBottom,
    pageWidth,
    pageHeight,
    isSpread: false,
  }
}

// Calculate grid system with fixed gutters and spread support
function calculateGridSystem(contentArea: any, config: LayoutConfig) {
  const { columns, rows, horizontalGutter, verticalGutter } = GRID_CONFIG

  if (config.spreadView) {
    const totalContentWidth = contentArea.leftPageWidth + contentArea.rightPageWidth
    const totalColumns = columns * 2
    const columnWidth = (totalContentWidth - (totalColumns - 1) * horizontalGutter) / totalColumns
    const rowHeight = (contentArea.height - (rows - 1) * verticalGutter) / rows

    return {
      columnWidth,
      rowHeight,
      gridColumns: totalColumns,
      gridRows: rows,
      gutterX: horizontalGutter,
      gutterY: verticalGutter,
      leftPageStart: 0,
      rightPageStart: columns,
      bindingGutterWidth: contentArea.bindingGutter,
      isSpread: true,
    }
  }

  // Single page grid calculation
  const columnWidth = (contentArea.width - (columns - 1) * horizontalGutter) / columns
  const rowHeight = (contentArea.height - (rows - 1) * verticalGutter) / rows

  return {
    columnWidth,
    rowHeight,
    gridColumns: columns,
    gridRows: rows,
    gutterX: horizontalGutter,
    gutterY: verticalGutter,
    isSpread: false,
  }
}

// Get page dimensions
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

// Generate layout for a single page or spread
function generatePageLayout(pageNumber: number, config: LayoutConfig): ElementPlan[] {
  const elements: ElementPlan[] = []
  const isSpread = config.spreadView
  const gridOccupancy = new GridOccupancy(GRID_CONFIG.columns, GRID_CONFIG.rows, isSpread)

  // Select appropriate pattern set
  const patterns = isSpread ? SPREAD_PATTERNS : SINGLE_PAGE_PATTERNS
  const patternIndex = (pageNumber - 1) % patterns.length
  const pattern = patterns[patternIndex]

  console.log(`📄 Page ${pageNumber}: Using "${pattern.name}" ${isSpread ? "spread" : "single"} layout pattern`)

  // Create elements from pattern
  pattern.elements.forEach((templateElement, index) => {
    const element: ElementPlan = {
      id: `${templateElement.type}-${pageNumber}-${index}`,
      type: templateElement.type as "title" | "subtitle" | "body" | "image" | "caption",
      gridX: 0,
      gridY: 0,
      gridWidth: templateElement.gridWidth,
      gridHeight: templateElement.gridHeight,
      priority: CONTENT_TYPES[templateElement.type as keyof typeof CONTENT_TYPES].priority,
      spreadPosition: templateElement.spreadPosition,
      page: pageNumber,
    }

    elements.push(element)
  })

  // Sort by priority (highest first)
  elements.sort((a, b) => b.priority - a.priority)

  // Place elements with strict grid adherence
  const placedElements: ElementPlan[] = []

  pattern.elements.forEach((templateElement, index) => {
    const element = elements[index]
    if (!element) return

    // Try preferred position first
    const position = gridOccupancy.findAvailableSpace(
      element.gridWidth,
      element.gridHeight,
      templateElement.preferredX,
      templateElement.preferredY,
      element.spreadPosition,
    )

    if (position) {
      element.gridX = position.x
      element.gridY = position.y
      gridOccupancy.occupy(position.x, position.y, element.gridWidth, element.gridHeight)
      placedElements.push(element)
      console.log(
        `  ✅ Placed ${element.type} at grid (${position.x}, ${position.y}) size ${element.gridWidth}×${element.gridHeight}${element.spreadPosition ? ` [${element.spreadPosition}]` : ""}`,
      )
    } else {
      // Try with reduced size if preferred position doesn't work
      for (let reduction = 1; reduction <= 2; reduction++) {
        const reducedWidth = Math.max(1, element.gridWidth - reduction)
        const reducedHeight = Math.max(1, element.gridHeight - reduction)

        const fallbackPosition = gridOccupancy.findAvailableSpace(
          reducedWidth,
          reducedHeight,
          undefined,
          undefined,
          element.spreadPosition,
        )
        if (fallbackPosition) {
          element.gridX = fallbackPosition.x
          element.gridY = fallbackPosition.y
          element.gridWidth = reducedWidth
          element.gridHeight = reducedHeight
          gridOccupancy.occupy(fallbackPosition.x, fallbackPosition.y, reducedWidth, reducedHeight)
          placedElements.push(element)
          console.log(
            `  ⚠️ Placed ${element.type} at grid (${fallbackPosition.x}, ${fallbackPosition.y}) with reduced size ${reducedWidth}×${reducedHeight}`,
          )
          break
        }
      }
    }
  })

  return placedElements
}

// Calculate text metrics for proper formatting
function calculateTextMetrics(width: number, height: number, fontSize: number, leading: number) {
  const charactersPerLine = Math.floor(width / (fontSize * 0.6))
  const linesAvailable = Math.floor(height / (fontSize * leading))
  const wordsApprox = Math.floor((charactersPerLine * linesAvailable) / 5.5)

  return {
    charactersPerLine: Math.max(10, charactersPerLine),
    linesAvailable: Math.max(1, linesAvailable),
    wordsApprox: Math.max(1, wordsApprox),
  }
}

// Create text element with proper grid positioning and spread support
export function createTextElement(
  config: LayoutConfig,
  page: number,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
  textType: "title" | "subtitle" | "body" | "caption" = "body",
): LayoutElement {
  const id = `text-${page}-${textType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const contentArea = calculateContentArea(config)
  const gridSystem = calculateGridSystem(contentArea, config)

  let x: number, y: number

  if (config.spreadView) {
    // Handle spread positioning
    if (gridX >= GRID_CONFIG.columns) {
      // Right page
      const rightPageGridX = gridX - GRID_CONFIG.columns
      x =
        contentArea.left +
        contentArea.leftPageWidth +
        contentArea.bindingGutter +
        rightPageGridX * (gridSystem.columnWidth + gridSystem.gutterX)
    } else {
      // Left page
      x = contentArea.left + gridX * (gridSystem.columnWidth + gridSystem.gutterX)
    }
    y = contentArea.top + gridY * (gridSystem.rowHeight + gridSystem.gutterY)
  } else {
    // Single page positioning
    x = contentArea.left + gridX * (gridSystem.columnWidth + gridSystem.gutterX)
    y = contentArea.top + gridY * (gridSystem.rowHeight + gridSystem.gutterY)
  }

  const width = gridWidth * gridSystem.columnWidth + (gridWidth - 1) * gridSystem.gutterX
  const height = gridHeight * gridSystem.rowHeight + (gridHeight - 1) * gridSystem.gutterY

  // Set typography based on text type
  let fontSize = config.baseFontSize || 12
  let leading = config.baseLeading || 1.4
  let content = ""
  let textAlign: "left" | "center" | "right" | "justify" = "left"

  switch (textType) {
    case "title":
      fontSize = (config.baseFontSize || 12) * 2.5
      leading = 1.1
      content = LoremGenerator.generateHeadline()
      textAlign = "left"
      break
    case "subtitle":
      fontSize = (config.baseFontSize || 12) * 1.5
      leading = 1.2
      content = LoremGenerator.generateSubheading()
      textAlign = "left"
      break
    case "body":
      fontSize = config.baseFontSize || 12
      leading = config.baseLeading || 1.4
      const metrics = calculateTextMetrics(width, height, fontSize, leading)
      content = LoremGenerator.generateProfessionalText(
        metrics.wordsApprox,
        metrics.charactersPerLine,
        metrics.linesAvailable,
      )
      textAlign = "justify"
      break
    case "caption":
      fontSize = (config.baseFontSize || 12) * 0.85
      leading = 1.3
      content = LoremGenerator.generateCaption()
      textAlign = "left"
      break
  }

  return {
    id,
    type: "text",
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    page,
    content,
    fontSize,
    fontFamily: config.primaryFont || "Inter",
    color: config.textColor || "#000000",
    textAlign,
    leading,
    rotation: 0,
    locked: false,
    hidden: false,
  }
}

// Create image element with proper grid positioning and spread support
export function createImageElement(
  config: LayoutConfig,
  page: number,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
): LayoutElement {
  const id = `image-${page}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const contentArea = calculateContentArea(config)
  const gridSystem = calculateGridSystem(contentArea, config)

  let x: number, y: number

  if (config.spreadView) {
    // Handle spread positioning
    if (gridX >= GRID_CONFIG.columns) {
      // Right page
      const rightPageGridX = gridX - GRID_CONFIG.columns
      x =
        contentArea.left +
        contentArea.leftPageWidth +
        contentArea.bindingGutter +
        rightPageGridX * (gridSystem.columnWidth + gridSystem.gutterX)
    } else {
      // Left page
      x = contentArea.left + gridX * (gridSystem.columnWidth + gridSystem.gutterX)
    }
    y = contentArea.top + gridY * (gridSystem.rowHeight + gridSystem.gutterY)
  } else {
    // Single page positioning
    x = contentArea.left + gridX * (gridSystem.columnWidth + gridSystem.gutterX)
    y = contentArea.top + gridY * (gridSystem.rowHeight + gridSystem.gutterY)
  }

  const width = gridWidth * gridSystem.columnWidth + (gridWidth - 1) * gridSystem.gutterX
  const height = gridHeight * gridSystem.rowHeight + (gridHeight - 1) * gridSystem.gutterY

  return {
    id,
    type: "image",
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    page,
    content: `/placeholder.svg?height=${Math.round(height)}&width=${Math.round(width)}&text=Image+${page}`,
    rotation: 0,
    locked: false,
    hidden: false,
  }
}

// Find next available position for manual element addition
export function findNextAvailablePosition(
  existingElements: LayoutElement[],
  page: number,
  totalColumns: number,
  totalRows: number,
  elementWidth: number,
  elementHeight: number,
): GridPosition {
  const gridOccupancy = new GridOccupancy(GRID_CONFIG.columns, GRID_CONFIG.rows, false)
  const pageElements = existingElements.filter((el) => el.page === page)

  const contentArea = calculateContentArea({
    pageSize: "A4",
    customWidth: 210,
    customHeight: 297,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15,
    bleed: 3,
    spreadView: false,
  } as LayoutConfig)

  const gridSystem = calculateGridSystem(contentArea, { spreadView: false } as LayoutConfig)

  // Mark occupied positions
  pageElements.forEach((element) => {
    const gridX = Math.floor((element.x - contentArea.left) / (gridSystem.columnWidth + gridSystem.gutterX))
    const gridY = Math.floor((element.y - contentArea.top) / (gridSystem.rowHeight + gridSystem.gutterY))
    const gridW = Math.ceil(element.width / (gridSystem.columnWidth + gridSystem.gutterX))
    const gridH = Math.ceil(element.height / (gridSystem.rowHeight + gridSystem.gutterY))

    gridOccupancy.occupy(
      Math.max(0, gridX),
      Math.max(0, gridY),
      Math.min(gridW, GRID_CONFIG.columns - gridX),
      Math.min(gridH, GRID_CONFIG.rows - gridY),
    )
  })

  const position = gridOccupancy.findAvailableSpace(elementWidth, elementHeight)
  return position || { gridX: 0, gridY: 0 }
}

// Main layout generation function with proper page and spread handling
export function generateLayout(config: LayoutConfig): GeneratedLayout {
  const elements: LayoutElement[] = []
  const totalPages = config.pageCount || 6
  const contentArea = calculateContentArea(config)
  const gridSystem = calculateGridSystem(contentArea, config)

  console.log(`🎨 Generating ${config.spreadView ? "spread" : "single page"} layouts for ${totalPages} pages`)
  console.log(`📐 Content area: ${contentArea.width?.toFixed(1) || "N/A"}×${contentArea.height.toFixed(1)}mm`)

  if (config.spreadView) {
    console.log(
      `📖 Spread mode: ${GRID_CONFIG.columns * 2}×${GRID_CONFIG.rows} grid with ${GRID_CONFIG.horizontalGutter}mm×${GRID_CONFIG.verticalGutter}mm gutters`,
    )
    console.log(`📏 Cell size: ${gridSystem.columnWidth.toFixed(1)}×${gridSystem.rowHeight.toFixed(1)}mm`)
    console.log(`🔗 Binding gutter: ${contentArea.bindingGutter}mm`)

    // Generate layouts for spreads (process pages in pairs)
    for (let page = 1; page <= totalPages; page += 2) {
      const rightPage = page + 1
      if (rightPage <= totalPages) {
        // Generate spread layout for both pages
        const spreadPlan = generatePageLayout(page, config)

        // Convert plans to actual elements for both pages
        spreadPlan.forEach((plan) => {
          // Determine which physical page this element belongs to
          let actualPage = page
          if (plan.gridX >= GRID_CONFIG.columns) {
            actualPage = rightPage
          }

          if (plan.type === "image") {
            const element = createImageElement(
              config,
              actualPage,
              plan.gridX,
              plan.gridY,
              plan.gridWidth,
              plan.gridHeight,
            )
            elements.push(element)
          } else {
            // Text elements (title, subtitle, body, caption)
            const element = createTextElement(
              config,
              actualPage,
              plan.gridX,
              plan.gridY,
              plan.gridWidth,
              plan.gridHeight,
              plan.type,
            )
            elements.push(element)
          }
        })

        console.log(`✅ Spread ${page}-${rightPage} complete: ${spreadPlan.length} elements placed`)
      } else {
        // Handle single page at the end if odd number of pages
        const singlePagePlan = generatePageLayout(page, { ...config, spreadView: false })

        singlePagePlan.forEach((plan) => {
          if (plan.type === "image") {
            const element = createImageElement(
              { ...config, spreadView: false },
              page,
              plan.gridX,
              plan.gridY,
              plan.gridWidth,
              plan.gridHeight,
            )
            elements.push(element)
          } else {
            const element = createTextElement(
              { ...config, spreadView: false },
              page,
              plan.gridX,
              plan.gridY,
              plan.gridWidth,
              plan.gridHeight,
              plan.type,
            )
            elements.push(element)
          }
        })

        console.log(`✅ Single page ${page} complete: ${singlePagePlan.length} elements placed`)
      }
    }
  } else {
    // Generate layouts for individual pages
    for (let page = 1; page <= totalPages; page++) {
      const pagePlan = generatePageLayout(page, config)

      // Convert plans to actual elements
      pagePlan.forEach((plan) => {
        if (plan.type === "image") {
          const element = createImageElement(config, page, plan.gridX, plan.gridY, plan.gridWidth, plan.gridHeight)
          elements.push(element)
        } else {
          // Text elements (title, subtitle, body, caption)
          const element = createTextElement(
            config,
            page,
            plan.gridX,
            plan.gridY,
            plan.gridWidth,
            plan.gridHeight,
            plan.type,
          )
          elements.push(element)
        }
      })

      console.log(`✅ Page ${page} complete: ${pagePlan.length} elements placed`)
    }
  }

  console.log(`🎯 Layout generation complete: ${elements.length} total elements across ${totalPages} pages`)
  console.log(`📋 All elements respect margins, snap to grid, and maintain proper gutters`)
  console.log(
    `${config.spreadView ? "📖 Spread layouts with proper page distribution" : "📄 Individual page layouts generated"}`,
  )

  return {
    id: `layout-${Date.now()}`,
    elements,
    dimensions: {
      width: contentArea.pageWidth,
      height: contentArea.pageHeight,
      aspectRatio: contentArea.pageWidth / contentArea.pageHeight,
    },
    metadata: {
      aestheticRule: "grid-based",
      gridSystem: config.spreadView
        ? `${GRID_CONFIG.columns * 2}×${GRID_CONFIG.rows}`
        : `${GRID_CONFIG.columns}×${GRID_CONFIG.rows}`,
      generatedAt: new Date(),
      elementCount: elements.length,
      isSpread: config.spreadView,
      contentType: "balanced",
    },
  }
}
