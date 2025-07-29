import jsPDF from "jspdf"
import type { LayoutConfig, GeneratedLayout } from "@/types/layout"

export async function generateEditablePDF(layout: GeneratedLayout, config: LayoutConfig): Promise<Blob> {
  // Convert mm to points (1mm = 2.834645669 points)
  const mmToPoints = (mm: number) => mm * 2.834645669

  const pageWidth = mmToPoints(layout.dimensions.width)
  const pageHeight = mmToPoints(layout.dimensions.height)

  // Create new PDF document
  const pdf = new jsPDF({
    orientation: pageWidth > pageHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pageWidth, pageHeight],
  })

  // Set document properties
  pdf.setProperties({
    title: `GridGenie Complete Document ${layout.id}`,
    subject: "Complete Layout Document with All Spreads",
    author: "GridGenie",
    creator: "GridGenie Layout Generator",
    keywords: `layout, design, ${config.aestheticRule}, ${config.gridSystem}, complete document`,
    creationDate: layout.metadata.generatedAt,
  })

  // Generate spread layouts
  const spreads = generateSpreadLayouts(layout, config)

  // Track total pages for navigation
  let totalPDFPages = 0

  // Process each spread
  spreads.forEach((spread, spreadIndex) => {
    if (spread.type === "cover") {
      // Add cover spread as single page
      if (spreadIndex > 0) pdf.addPage()
      renderCoverSpreadToPDF(pdf, spread, config, layout.dimensions)
      totalPDFPages++
    } else if (spread.type === "facing") {
      // Add facing pages as separate PDF pages
      if (spreadIndex > 0) pdf.addPage()
      renderLeftPageToPDF(pdf, spread, config, layout.dimensions, spread.pages[0])
      totalPDFPages++

      pdf.addPage()
      renderRightPageToPDF(pdf, spread, config, layout.dimensions, spread.pages[1])
      totalPDFPages++
    } else {
      // Single pages (right-only, left-only, single)
      if (spreadIndex > 0) pdf.addPage()
      renderSinglePageToPDF(pdf, spread, config, layout.dimensions)
      totalPDFPages++
    }
  })

  // Add document information page
  pdf.addPage()
  renderDocumentInfoPage(pdf, layout, config, spreads, totalPDFPages)

  return pdf.output("blob")
}

function generateSpreadLayouts(layout: GeneratedLayout, config: LayoutConfig) {
  const spreads = []
  const totalPages = config.pageCount || 6
  const totalElements = layout.elements.length

  // Calculate spine width
  const spineWidth = calculateSpineWidth(totalPages, config.gsm)

  let elementIndex = 0

  // 1. Cover spread
  const coverElements = layout.elements.slice(0, 3)
  spreads.push({
    spreadNumber: 1,
    pages: [0],
    type: "cover",
    elements: coverElements,
    spineWidth,
  })
  elementIndex += 3

  // 2. Right page only (page 1)
  const elementsPerPage = Math.floor((totalElements - 3) / Math.max(totalPages - 1, 1))
  const rightPageElements = layout.elements.slice(elementIndex, elementIndex + elementsPerPage)
  spreads.push({
    spreadNumber: 2,
    pages: [1],
    type: "right-only",
    elements: rightPageElements,
  })
  elementIndex += elementsPerPage

  // 3. Facing pages
  const remainingPages = Math.max(totalPages - 2, 0)
  const middleSpreads = Math.floor(remainingPages / 2)

  for (let i = 0; i < middleSpreads; i++) {
    const leftPage = 2 + i * 2
    const rightPage = leftPage + 1
    const spreadElements = layout.elements.slice(elementIndex, elementIndex + elementsPerPage)

    spreads.push({
      spreadNumber: 3 + i,
      pages: [leftPage, rightPage],
      type: "facing",
      elements: spreadElements,
    })
    elementIndex += elementsPerPage
  }

  // 4. Last left page if odd
  if (remainingPages % 2 === 1) {
    const lastPageNumber = totalPages - 1
    const lastPageElements = layout.elements.slice(elementIndex)
    spreads.push({
      spreadNumber: spreads.length + 1,
      pages: [lastPageNumber],
      type: "left-only",
      elements: lastPageElements,
    })
  }

  return spreads
}

function renderCoverSpreadToPDF(pdf: any, spread: any, config: LayoutConfig, dimensions: any) {
  const mmToPoints = (mm: number) => mm * 2.834645669
  const pageWidth = mmToPoints(dimensions.width)
  const pageHeight = mmToPoints(dimensions.height)
  const spineWidth = mmToPoints(spread.spineWidth || 3)

  // Cover is wider (back + spine + front)
  const coverWidth = pageWidth * 2 + spineWidth

  // Set page size for cover
  pdf.internal.pageSize.setWidth(coverWidth)
  pdf.internal.pageSize.setHeight(pageHeight)

  // Draw cover structure
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)

  // Back cover boundary
  pdf.rect(0, 0, pageWidth, pageHeight)

  // Spine boundary
  pdf.rect(pageWidth, 0, spineWidth, pageHeight)

  // Front cover boundary
  pdf.rect(pageWidth + spineWidth, 0, pageWidth, pageHeight)

  // Add cover margins
  const coverMarginTop = mmToPoints(config.coverMarginTop || config.marginTop)
  const coverMarginBottom = mmToPoints(config.coverMarginBottom || config.marginBottom)
  const coverMarginOuter = mmToPoints(config.coverMarginOuter || config.marginOuter)
  const coverMarginInner = mmToPoints(config.coverMarginInner || config.marginInner)

  pdf.setDrawColor(255, 0, 255)
  pdf.setLineWidth(0.5)
  pdf.setLineDashPattern([3, 3], 0)

  // Back cover margins
  pdf.rect(
    coverMarginOuter,
    coverMarginTop,
    pageWidth - (coverMarginOuter + coverMarginInner),
    pageHeight - (coverMarginTop + coverMarginBottom),
  )

  // Front cover margins
  pdf.rect(
    pageWidth + spineWidth + coverMarginInner,
    coverMarginTop,
    pageWidth - (coverMarginInner + coverMarginOuter),
    pageHeight - (coverMarginTop + coverMarginBottom),
  )

  // Render cover elements
  spread.elements.forEach((element: any, index: number) => {
    let elementX, elementY, elementWidth, elementHeight

    if (index === 0) {
      // Back cover
      elementX = coverMarginOuter + 20
      elementY = coverMarginTop + 20
      elementWidth = mmToPoints(60)
      elementHeight = mmToPoints(60)
    } else if (index === 1) {
      // Spine
      elementX = pageWidth + mmToPoints(2)
      elementY = coverMarginTop + 40
      elementWidth = spineWidth - mmToPoints(4)
      elementHeight = mmToPoints(40)
    } else {
      // Front cover
      elementX = pageWidth + spineWidth + coverMarginInner + 20
      elementY = coverMarginTop + 20
      elementWidth = mmToPoints(60)
      elementHeight = mmToPoints(60)
    }

    renderElementToPDF(pdf, element, elementX, elementY, elementWidth, elementHeight)
  })

  // Add cover labels
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text("Back Cover", pageWidth / 2, 20, { align: "center" })
  pdf.text("Spine", pageWidth + spineWidth / 2, 20, { align: "center" })
  pdf.text("Front Cover", pageWidth + spineWidth + pageWidth / 2, 20, { align: "center" })

  // Reset page size for subsequent pages
  pdf.internal.pageSize.setWidth(pageWidth)
  pdf.internal.pageSize.setHeight(pageHeight)
}

function renderLeftPageToPDF(pdf: any, spread: any, config: LayoutConfig, dimensions: any, pageNumber: number) {
  const mmToPoints = (mm: number) => mm * 2.834645669
  const pageWidth = mmToPoints(dimensions.width)
  const pageHeight = mmToPoints(dimensions.height)

  // Draw page boundary
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)
  pdf.setLineDashPattern([], 0)
  pdf.rect(0, 0, pageWidth, pageHeight)

  // Draw margins (left page uses outer/inner margins)
  const marginTop = mmToPoints(config.marginTop)
  const marginBottom = mmToPoints(config.marginBottom)
  const marginOuter = mmToPoints(config.marginOuter)
  const marginInner = mmToPoints(config.marginInner)

  pdf.setDrawColor(0, 102, 204)
  pdf.setLineWidth(0.5)
  pdf.setLineDashPattern([3, 3], 0)
  pdf.rect(marginOuter, marginTop, pageWidth - (marginOuter + marginInner), pageHeight - (marginTop + marginBottom))

  // Draw grid within margins
  drawGridToPDF(
    pdf,
    config,
    marginOuter,
    marginTop,
    pageWidth - (marginOuter + marginInner),
    pageHeight - (marginTop + marginBottom),
  )

  // Render elements for left page
  const leftPageElements = spread.elements.filter((el: any) => el.page === pageNumber || !el.page)
  leftPageElements.forEach((element: any) => {
    const elementX = marginOuter + (element.x / 100) * (pageWidth - (marginOuter + marginInner))
    const elementY = marginTop + (element.y / 100) * (pageHeight - (marginTop + marginBottom))
    const elementWidth = (element.width / 100) * (pageWidth - (marginOuter + marginInner))
    const elementHeight = (element.height / 100) * (pageHeight - (marginTop + marginBottom))

    renderElementToPDF(pdf, element, elementX, elementY, elementWidth, elementHeight)
  })

  // Add page number
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Page ${pageNumber}`, marginOuter, pageHeight - 10)
}

function renderRightPageToPDF(pdf: any, spread: any, config: LayoutConfig, dimensions: any, pageNumber: number) {
  const mmToPoints = (mm: number) => mm * 2.834645669
  const pageWidth = mmToPoints(dimensions.width)
  const pageHeight = mmToPoints(dimensions.height)

  // Draw page boundary
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)
  pdf.setLineDashPattern([], 0)
  pdf.rect(0, 0, pageWidth, pageHeight)

  // Draw margins (right page uses inner/outer margins)
  const marginTop = mmToPoints(config.marginTop)
  const marginBottom = mmToPoints(config.marginBottom)
  const marginInner = mmToPoints(config.marginInner)
  const marginOuter = mmToPoints(config.marginOuter)

  pdf.setDrawColor(0, 102, 204)
  pdf.setLineWidth(0.5)
  pdf.setLineDashPattern([3, 3], 0)
  pdf.rect(marginInner, marginTop, pageWidth - (marginInner + marginOuter), pageHeight - (marginTop + marginBottom))

  // Draw grid within margins
  drawGridToPDF(
    pdf,
    config,
    marginInner,
    marginTop,
    pageWidth - (marginInner + marginOuter),
    pageHeight - (marginTop + marginBottom),
  )

  // Render elements for right page
  const rightPageElements = spread.elements.filter((el: any) => el.page === pageNumber || !el.page)
  rightPageElements.forEach((element: any) => {
    const elementX = marginInner + (element.x / 100) * (pageWidth - (marginInner + marginOuter))
    const elementY = marginTop + (element.y / 100) * (pageHeight - (marginTop + marginBottom))
    const elementWidth = (element.width / 100) * (pageWidth - (marginInner + marginOuter))
    const elementHeight = (element.height / 100) * (pageHeight - (marginTop + marginBottom))

    renderElementToPDF(pdf, element, elementX, elementY, elementWidth, elementHeight)
  })

  // Add page number
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Page ${pageNumber}`, pageWidth - marginOuter - 20, pageHeight - 10)
}

function renderSinglePageToPDF(pdf: any, spread: any, config: LayoutConfig, dimensions: any) {
  const mmToPoints = (mm: number) => mm * 2.834645669
  const pageWidth = mmToPoints(dimensions.width)
  const pageHeight = mmToPoints(dimensions.height)

  // Draw page boundary
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)
  pdf.setLineDashPattern([], 0)
  pdf.rect(0, 0, pageWidth, pageHeight)

  // Determine margins based on page type
  const marginTop = mmToPoints(config.marginTop)
  const marginBottom = mmToPoints(config.marginBottom)
  let marginLeft, marginRight

  if (spread.type === "right-only") {
    marginLeft = mmToPoints(config.marginInner)
    marginRight = mmToPoints(config.marginOuter)
  } else if (spread.type === "left-only") {
    marginLeft = mmToPoints(config.marginOuter)
    marginRight = mmToPoints(config.marginInner)
  } else {
    marginLeft = mmToPoints(config.marginLeft)
    marginRight = mmToPoints(config.marginRight)
  }

  // Draw margins
  pdf.setDrawColor(0, 102, 204)
  pdf.setLineWidth(0.5)
  pdf.setLineDashPattern([3, 3], 0)
  pdf.rect(marginLeft, marginTop, pageWidth - (marginLeft + marginRight), pageHeight - (marginTop + marginBottom))

  // Draw grid within margins
  drawGridToPDF(
    pdf,
    config,
    marginLeft,
    marginTop,
    pageWidth - (marginLeft + marginRight),
    pageHeight - (marginTop + marginBottom),
  )

  // Render elements
  spread.elements.forEach((element: any) => {
    const elementX = marginLeft + (element.x / 100) * (pageWidth - (marginLeft + marginRight))
    const elementY = marginTop + (element.y / 100) * (pageHeight - (marginTop + marginBottom))
    const elementWidth = (element.width / 100) * (pageWidth - (marginLeft + marginRight))
    const elementHeight = (element.height / 100) * (pageHeight - (marginTop + marginBottom))

    renderElementToPDF(pdf, element, elementX, elementY, elementWidth, elementHeight)
  })

  // Add page number
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  const pageNum = spread.pages[0]
  if (spread.type === "right-only" || spread.type === "single") {
    pdf.text(`Page ${pageNum}`, pageWidth - marginRight - 20, pageHeight - 10)
  } else {
    pdf.text(`Page ${pageNum}`, marginLeft, pageHeight - 10)
  }
}

function drawGridToPDF(pdf: any, config: LayoutConfig, x: number, y: number, width: number, height: number) {
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.25)
  pdf.setLineDashPattern([1, 1], 0)

  // Vertical grid lines
  for (let i = 0; i <= config.columns; i++) {
    const lineX = x + (i / config.columns) * width
    pdf.line(lineX, y, lineX, y + height)
  }

  // Horizontal grid lines
  for (let i = 0; i <= config.rows; i++) {
    const lineY = y + (i / config.rows) * height
    pdf.line(x, lineY, x + width, lineY)
  }
}

function renderElementToPDF(pdf: any, element: any, x: number, y: number, width: number, height: number) {
  if (element.type === "image") {
    pdf.setFillColor(230, 243, 255)
    pdf.setDrawColor(0, 102, 204)
  } else {
    pdf.setFillColor(240, 255, 240)
    pdf.setDrawColor(0, 204, 0)
  }

  pdf.setLineWidth(1)
  pdf.setLineDashPattern([], 0)
  pdf.rect(x, y, width, height, "FD")

  // Add element label
  pdf.setFontSize(8)
  pdf.setTextColor(
    element.type === "image" ? 0 : 0,
    element.type === "image" ? 102 : 204,
    element.type === "image" ? 204 : 0,
  )

  const labelText = `${element.type.toUpperCase()}\n${element.id}`
  const lines = labelText.split("\n")

  lines.forEach((line, lineIndex) => {
    pdf.text(line, x + width / 2, y + height / 2 + (lineIndex - 0.5) * 10, { align: "center" })
  })

  // Add element annotation for editability
  pdf.createAnnotation({
    type: "text",
    title: element.id,
    contents: `Type: ${element.type}\nGrid Position: ${element.gridX || 0}, ${element.gridY || 0}\nSize: ${element.width?.toFixed(1) || 0}% x ${element.height?.toFixed(1) || 0}%`,
    bounds: { x, y, w: width, h: height },
  })
}

function renderDocumentInfoPage(
  pdf: any,
  layout: GeneratedLayout,
  config: LayoutConfig,
  spreads: any[],
  totalPages: number,
) {
  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  pdf.text("Complete Document Information", 50, 50)

  pdf.setFontSize(12)
  const infoText = [
    `Document ID: ${layout.id}`,
    `Generated: ${layout.metadata.generatedAt.toLocaleString()}`,
    `Total PDF Pages: ${totalPages}`,
    `Document Pages: ${config.pageCount}`,
    `Page Size: ${config.pageSize} (${layout.dimensions.width} x ${layout.dimensions.height}mm)`,
    `Grid: ${config.columns} columns x ${config.rows} rows`,
    `Aesthetic Rule: ${config.aestheticRule}`,
    `Grid System: ${config.gridSystem}`,
    `Margins: T:${config.marginTop}mm B:${config.marginBottom}mm I:${config.marginInner}mm O:${config.marginOuter}mm`,
    `Binding: ${config.bindingType}`,
    `Paper: ${config.gsm}gsm`,
    `Total Elements: ${layout.elements.length}`,
    "",
    "Document Structure:",
  ]

  infoText.forEach((line, index) => {
    pdf.text(line, 50, 80 + index * 15)
  })

  // Add spread information
  spreads.forEach((spread, index) => {
    const yPos = 80 + (infoText.length + index + 1) * 15
    const spreadInfo = `${spread.spreadNumber}. ${spread.type.toUpperCase()} - Pages: ${spread.pages.join(", ")} - Elements: ${spread.elements.length}`
    pdf.text(spreadInfo, 60, yPos)
  })
}

function calculateSpineWidth(pages: number, gsm: number): number {
  return Math.max((pages * gsm * 0.8) / 1000, 3)
}
