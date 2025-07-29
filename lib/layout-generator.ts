import type { LayoutConfig, LayoutElement, GeneratedLayout } from "@/types/layout"
import { LoremGenerator } from "./lorem-generator"

export interface GridPosition {
  gridX: number
  gridY: number
}

// Layout templates for different page types with spread awareness
const LAYOUT_TEMPLATES = [
  {
    name: "hero-focus",
    description: "Large hero image with supporting text",
    spreadAware: true,
    elements: [
      { type: "text", role: "headline", gridWidth: 4, gridHeight: 1, priority: 10, spreadPosition: "left" },
      { type: "image", role: "hero", gridWidth: 5, gridHeight: 4, priority: 9, spreadPosition: "right" },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 3, priority: 7, spreadPosition: "left" },
      { type: "text", role: "caption", gridWidth: 3, gridHeight: 1, priority: 5, spreadPosition: "right" },
    ],
  },
  {
    name: "text-heavy",
    description: "Multiple text blocks with small supporting image",
    spreadAware: false,
    elements: [
      { type: "text", role: "headline", gridWidth: 5, gridHeight: 1, priority: 10 },
      { type: "text", role: "subhead", gridWidth: 4, gridHeight: 1, priority: 8 },
      { type: "text", role: "body", gridWidth: 4, gridHeight: 4, priority: 7 },
      { type: "image", role: "supporting", gridWidth: 2, gridHeight: 2, priority: 6 },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 2, priority: 6 },
    ],
  },
  {
    name: "balanced",
    description: "Balanced mix of text and images",
    spreadAware: true,
    elements: [
      { type: "text", role: "headline", gridWidth: 6, gridHeight: 1, priority: 10, spreadPosition: "span" },
      { type: "image", role: "hero", gridWidth: 4, gridHeight: 3, priority: 9, spreadPosition: "left" },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 3, priority: 7, spreadPosition: "right" },
      { type: "image", role: "supporting", gridWidth: 2, gridHeight: 2, priority: 6, spreadPosition: "right" },
      { type: "text", role: "caption", gridWidth: 4, gridHeight: 1, priority: 5, spreadPosition: "left" },
    ],
  },
  {
    name: "magazine-spread",
    description: "Magazine-style layout with multiple elements",
    spreadAware: true,
    elements: [
      { type: "text", role: "headline", gridWidth: 8, gridHeight: 1, priority: 10, spreadPosition: "span" },
      { type: "text", role: "subhead", gridWidth: 4, gridHeight: 1, priority: 8, spreadPosition: "left" },
      { type: "image", role: "hero", gridWidth: 4, gridHeight: 4, priority: 9, spreadPosition: "right" },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 4, priority: 7, spreadPosition: "left" },
      { type: "image", role: "thumbnail", gridWidth: 2, gridHeight: 2, priority: 5, spreadPosition: "right" },
      { type: "text", role: "caption", gridWidth: 4, gridHeight: 1, priority: 4, spreadPosition: "right" },
    ],
  },
  {
    name: "minimal",
    description: "Clean, minimal layout with lots of white space",
    spreadAware: false,
    elements: [
      { type: "text", role: "headline", gridWidth: 4, gridHeight: 1, priority: 10 },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 3, priority: 7 },
      { type: "image", role: "supporting", gridWidth: 3, gridHeight: 3, priority: 6 },
    ],
  },
  {
    name: "grid-system",
    description: "Systematic grid-based layout",
    spreadAware: true,
    elements: [
      { type: "text", role: "headline", gridWidth: 3, gridHeight: 1, priority: 10, spreadPosition: "left" },
      { type: "image", role: "hero", gridWidth: 3, gridHeight: 3, priority: 9, spreadPosition: "left" },
      { type: "text", role: "body", gridWidth: 3, gridHeight: 3, priority: 7, spreadPosition: "right" },
      { type: "image", role: "supporting", gridWidth: 3, gridHeight: 2, priority: 6, spreadPosition: "right" },
      { type: "text", role: "caption", gridWidth: 6, gridHeight: 1, priority: 5, spreadPosition: "span" },
    ],
  },
]

interface ElementPlan {
  id: string
  type: "image" | "text"
  role: string
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
  priority: number
  textStyle?: "headline" | "subhead" | "body" | "caption"
  spreadPosition?: "left" | "right" | "span"
  pageOffset?: number // For spread layouts
}

// Advanced Grid occupancy tracker with spread support
class GridOccupancy {
  private grid: boolean[][]
  private columns: number
  private rows: number
  private isSpread: boolean
  private bindingGutter: number

  constructor(columns: number, rows: number, isSpread = false, bindingGutter = 0) {
    this.columns = columns
    this.rows = rows
    this.isSpread = isSpread
    this.bindingGutter = bindingGutter
    this.grid = Array(rows)
      .fill(null)
      .map(() => Array(columns * (isSpread ? 2 : 1)).fill(false))
  }

  findAvailableSpace(
    width: number,
    height: number,
    preferredX?: number,
    preferredY?: number,
    spreadPosition?: "left" | "right" | "span",
  ): { x: number; y: number } | null {
    const totalColumns = this.columns * (this.isSpread ? 2 : 1)

    // Handle spread positioning
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
        case "span":
          // Allow spanning across both pages
          break
      }

      // Try preferred position first within constraints
      if (preferredX !== undefined && preferredY !== undefined) {
        const adjustedX = Math.max(searchStartX, Math.min(preferredX, searchEndX))
        if (this.canPlace(adjustedX, preferredY, width, height)) {
          return { x: adjustedX, y: preferredY }
        }
      }

      // Search within the specified area
      for (let y = 0; y <= this.rows - height; y++) {
        for (let x = searchStartX; x <= searchEndX; x++) {
          if (this.canPlace(x, y, width, height)) {
            return { x, y }
          }
        }
      }
    } else {
      // Standard single page search
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

  canPlace(x: number, y: number, width: number, height: number): boolean {
    const totalColumns = this.columns * (this.isSpread ? 2 : 1)

    if (x < 0 || y < 0 || x + width > totalColumns || y + height > this.rows) {
      return false
    }

    // Add spacing buffer around elements (minimum 1 grid cell spacing)
    const bufferX = 1
    const bufferY = 1

    for (let row = Math.max(0, y - bufferY); row < Math.min(this.rows, y + height + bufferY); row++) {
      for (let col = Math.max(0, x - bufferX); col < Math.min(totalColumns, x + width + bufferX); col++) {
        if (this.grid[row] && this.grid[row][col]) {
          return false
        }
      }
    }
    return true
  }

  occupy(x: number, y: number, width: number, height: number): void {
    const totalColumns = this.columns * (this.isSpread ? 2 : 1)

    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        if (row < this.rows && col < totalColumns && row >= 0 && col >= 0) {
          this.grid[row][col] = true
        }
      }
    }
  }

  reset(): void {
    const totalColumns = this.columns * (this.isSpread ? 2 : 1)
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(totalColumns).fill(false))
  }
}

// Calculate content area within margins with spread support
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
    }
  }

  return {
    top: config.marginTop,
    left: config.marginLeft,
    width: pageWidth - config.marginLeft - config.marginRight,
    height: pageHeight - config.marginTop - config.marginBottom,
    pageWidth,
    pageHeight,
  }
}

// Calculate grid system with proper 1:1 scale
function calculateGridSystem(contentArea: any, config: LayoutConfig) {
  const gridColumns = config.columns
  const gridRows = config.rows
  const gutterX = config.gridSpacingX
  const gutterY = config.gridSpacingY

  if (config.spreadView) {
    const totalContentWidth = contentArea.leftPageWidth + contentArea.rightPageWidth
    const columnWidth = (totalContentWidth - (gridColumns * 2 - 1) * gutterX) / (gridColumns * 2)
    const rowHeight = (contentArea.height - (gridRows - 1) * gutterY) / gridRows

    return {
      columnWidth,
      rowHeight,
      gridColumns: gridColumns * 2,
      gridRows,
      gutterX,
      gutterY,
      leftPageStart: 0,
      rightPageStart: gridColumns,
      bindingGutterWidth: contentArea.bindingGutter,
    }
  }

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

// Apply aesthetic positioning rules with spread awareness
function applyAestheticPositioning(
  elements: ElementPlan[],
  rule: string,
  gridColumns: number,
  gridRows: number,
  isSpread: boolean,
): void {
  const totalColumns = isSpread ? gridColumns * 2 : gridColumns

  switch (rule) {
    case "golden-ratio":
      const goldenX = Math.floor(totalColumns * 0.618)
      const goldenY = Math.floor(gridRows * 0.618)

      elements.forEach((element, index) => {
        if (element.priority >= 8) {
          if (index === 0) {
            element.gridX = Math.min(goldenX, totalColumns - element.gridWidth)
            element.gridY = Math.min(goldenY, gridRows - element.gridHeight)
          }
        }
      })
      break

    case "rule-of-thirds":
      const thirdX = Math.floor(totalColumns / 3)
      const thirdY = Math.floor(gridRows / 3)
      const positions = [
        { x: thirdX, y: thirdY },
        { x: thirdX * 2, y: thirdY },
        { x: thirdX, y: thirdY * 2 },
        { x: thirdX * 2, y: thirdY * 2 },
      ]

      elements.forEach((element, index) => {
        if (element.priority >= 8 && index < positions.length) {
          const pos = positions[index]
          element.gridX = Math.min(pos.x, totalColumns - element.gridWidth)
          element.gridY = Math.min(pos.y, gridRows - element.gridHeight)
        }
      })
      break

    case "fibonacci":
      elements.forEach((element, index) => {
        const fibIndex = Math.min(index, 7) // Limit to reasonable fibonacci numbers
        const fibValue = [1, 1, 2, 3, 5, 8, 13, 21][fibIndex]

        element.gridWidth = Math.min(Math.max(fibValue, 1), Math.floor(totalColumns / 2))
        element.gridHeight = Math.min(Math.max(Math.ceil(fibValue * 0.618), 1), Math.floor(gridRows / 2))
      })
      break
  }
}

// Generate layout for a single page with spread support
function generatePageLayout(pageNumber: number, config: LayoutConfig): ElementPlan[] {
  const elements: ElementPlan[] = []
  const isSpread = config.spreadView
  const gridOccupancy = new GridOccupancy(config.columns, config.rows, isSpread, config.bindingGutter || 0)

  // Select template based on page number and content type
  let templateIndex: number

  switch (config.contentType) {
    case "image-heavy":
      templateIndex = pageNumber % 2 === 1 ? 0 : 3 // hero-focus or magazine-spread
      break
    case "text-heavy":
      templateIndex = pageNumber % 2 === 1 ? 1 : 4 // text-heavy or minimal
      break
    case "balanced":
    default:
      templateIndex = pageNumber % LAYOUT_TEMPLATES.length
      break
  }

  const template = LAYOUT_TEMPLATES[templateIndex]

  // Skip spread-aware templates if not in spread view
  if (template.spreadAware && !isSpread) {
    templateIndex = 1 // Fallback to text-heavy
  }

  const selectedTemplate = LAYOUT_TEMPLATES[templateIndex]

  // Create elements from template
  selectedTemplate.elements.forEach((templateElement, index) => {
    const element: ElementPlan = {
      id: `${templateElement.type}-${pageNumber}-${index}`,
      type: templateElement.type as "image" | "text",
      role: templateElement.role,
      gridX: 0,
      gridY: 0,
      gridWidth: templateElement.gridWidth,
      gridHeight: templateElement.gridHeight,
      priority: templateElement.priority,
      textStyle: templateElement.role as "headline" | "subhead" | "body" | "caption",
      spreadPosition: templateElement.spreadPosition,
    }

    elements.push(element)
  })

  // Sort by priority (highest first)
  elements.sort((a, b) => b.priority - a.priority)

  // Apply aesthetic positioning
  applyAestheticPositioning(elements, config.aestheticRule, config.columns, config.rows, isSpread)

  // Place elements with strict spacing and collision detection
  const placedElements: ElementPlan[] = []

  for (const element of elements) {
    const position = gridOccupancy.findAvailableSpace(
      element.gridWidth,
      element.gridHeight,
      element.gridX > 0 ? element.gridX : undefined,
      element.gridY > 0 ? element.gridY : undefined,
      element.spreadPosition,
    )

    if (position) {
      element.gridX = position.x
      element.gridY = position.y
      gridOccupancy.occupy(position.x, position.y, element.gridWidth, element.gridHeight)
      placedElements.push(element)
    } else {
      // Try with progressively smaller sizes
      let placed = false
      for (let reduction = 1; reduction <= 3 && !placed; reduction++) {
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
          placed = true
        }
      }
    }
  }

  return placedElements
}

// Calculate text metrics for proper 1:1 scale formatting
function calculateTextMetrics(width: number, height: number, fontSize: number, leading: number) {
  // Use actual mm to pixel conversion for 1:1 scale
  const mmToPixel = 3.78 // 96 DPI conversion
  const actualWidth = width * mmToPixel
  const actualHeight = height * mmToPixel

  const charactersPerLine = Math.floor(actualWidth / (fontSize * 0.6))
  const linesAvailable = Math.floor(actualHeight / (fontSize * leading))
  const wordsApprox = Math.floor((charactersPerLine * linesAvailable) / 5.5)

  return {
    charactersPerLine: Math.max(10, charactersPerLine),
    linesAvailable: Math.max(1, linesAvailable),
    wordsApprox: Math.max(1, wordsApprox),
  }
}

// Create text element with proper 1:1 scale and spread support
export function createTextElement(
  config: LayoutConfig,
  page: number,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
  textType: "heading" | "body" | "caption" = "body",
): LayoutElement {
  const id = `text-${page}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const contentArea = calculateContentArea(config)
  const gridSystem = calculateGridSystem(contentArea, config)

  let x: number, y: number

  if (config.spreadView) {
    // Handle spread positioning
    if (gridX >= config.columns) {
      // Right page
      const rightPageGridX = gridX - config.columns
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
    x = gridX * (gridSystem.columnWidth + gridSystem.gutterX) + contentArea.left
    y = gridY * (gridSystem.rowHeight + gridSystem.gutterY) + contentArea.top
  }

  const width = gridWidth * gridSystem.columnWidth + (gridWidth - 1) * gridSystem.gutterX
  const height = gridHeight * gridSystem.rowHeight + (gridHeight - 1) * gridSystem.gutterY

  let fontSize = config.baseFontSize || 12
  let leading = config.baseLeading || 1.4
  let content = ""
  let textAlign: "left" | "center" | "right" | "justify" = "left"

  switch (textType) {
    case "heading":
      fontSize = (config.baseFontSize || 12) * 2.2
      leading = 1.1
      content = LoremGenerator.generateHeadline()
      textAlign = "left"
      break
    case "body":
      fontSize = config.baseFontSize || 12
      leading = config.baseLeading || 1.4
      const metrics = calculateTextMetrics(width, height, fontSize, leading)
      content = LoremGenerator.generateFormattedText(
        metrics.wordsApprox,
        metrics.charactersPerLine,
        metrics.linesAvailable,
      )
      textAlign = config.enableJustification ? "justify" : "left"
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
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(30, height),
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

// Create image element with proper 1:1 scale and spread support
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
    if (gridX >= config.columns) {
      // Right page
      const rightPageGridX = gridX - config.columns
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
    x = gridX * (gridSystem.columnWidth + gridSystem.gutterX) + contentArea.left
    y = gridY * (gridSystem.rowHeight + gridSystem.gutterY) + contentArea.top
  }

  const width = gridWidth * gridSystem.columnWidth + (gridWidth - 1) * gridSystem.gutterX
  const height = gridHeight * gridSystem.rowHeight + (gridHeight - 1) * gridSystem.gutterY

  return {
    id,
    type: "image",
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(50, height),
    page,
    content: `/placeholder.svg?height=${Math.round(height)}&width=${Math.round(width)}&text=Image+${page}`,
    rotation: 0,
    locked: false,
    hidden: false,
  }
}

// Find next available position with spread support
export function findNextAvailablePosition(
  existingElements: LayoutElement[],
  page: number,
  totalColumns: number,
  totalRows: number,
  elementWidth: number,
  elementHeight: number,
): GridPosition {
  const gridOccupancy = new GridOccupancy(totalColumns, totalRows, false, 0)
  const pageElements = existingElements.filter((el) => el.page === page)

  const contentArea = calculateContentArea({
    pageSize: "A4",
    customWidth: 210,
    customHeight: 297,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15,
    columns: totalColumns,
    rows: totalRows,
    gridSpacingX: 5,
    gridSpacingY: 5,
    spreadView: false,
  } as LayoutConfig)

  const gridSystem = calculateGridSystem(contentArea, {
    columns: totalColumns,
    rows: totalRows,
    gridSpacingX: 5,
    gridSpacingY: 5,
    spreadView: false,
  } as LayoutConfig)

  pageElements.forEach((element) => {
    const gridX = Math.floor((element.x - contentArea.left) / (gridSystem.columnWidth + gridSystem.gutterX))
    const gridY = Math.floor((element.y - contentArea.top) / (gridSystem.rowHeight + gridSystem.gutterY))
    const gridW = Math.ceil(element.width / (gridSystem.columnWidth + gridSystem.gutterX))
    const gridH = Math.ceil(element.height / (gridSystem.rowHeight + gridSystem.gutterY))

    gridOccupancy.occupy(
      Math.max(0, gridX),
      Math.max(0, gridY),
      Math.min(gridW, totalColumns - gridX),
      Math.min(gridH, totalRows - gridY),
    )
  })

  const position = gridOccupancy.findAvailableSpace(elementWidth, elementHeight)
  return position || { gridX: 0, gridY: 0 }
}

// Main layout generation function with spread support and 1:1 scale
export function generateLayout(config: LayoutConfig): GeneratedLayout {
  const elements: LayoutElement[] = []
  const totalPages = config.pageCount || 6
  const contentArea = calculateContentArea(config)

  console.log(`🎨 Generating ${config.spreadView ? "spread" : "single page"} layout for ${totalPages} pages`)
  console.log(`📐 Content area: ${contentArea.width}×${contentArea.height}mm`)

  // Generate unique layout for each page
  for (let page = 1; page <= totalPages; page++) {
    console.log(`📄 Generating page ${page} layout...`)

    const pagePlan = generatePageLayout(page, config)

    // Convert plans to actual elements with proper spacing
    pagePlan.forEach((plan) => {
      if (plan.type === "text") {
        const textType = plan.role === "headline" ? "heading" : plan.role === "caption" ? "caption" : "body"

        const element = createTextElement(
          config,
          page,
          plan.gridX,
          plan.gridY,
          plan.gridWidth,
          plan.gridHeight,
          textType as "heading" | "body" | "caption",
        )
        elements.push(element)
      } else if (plan.type === "image") {
        const element = createImageElement(config, page, plan.gridX, plan.gridY, plan.gridWidth, plan.gridHeight)
        elements.push(element)
      }
    })

    console.log(`✅ Page ${page} generated with ${pagePlan.length} elements (no overlaps)`)
  }

  console.log(`🎯 Layout generation complete: ${elements.length} total elements across ${totalPages} pages`)
  console.log(`📏 All elements positioned with proper spacing within margins`)

  return {
    id: `layout-${Date.now()}`,
    elements,
    dimensions: {
      width: contentArea.pageWidth,
      height: contentArea.pageHeight,
      aspectRatio: contentArea.pageWidth / contentArea.pageHeight,
    },
    metadata: {
      aestheticRule: config.aestheticRule,
      gridSystem: config.gridSystem,
      generatedAt: new Date(),
      elementCount: elements.length,
      isSpread: config.spreadView,
      contentType: config.contentType,
    },
  }
}
