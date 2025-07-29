import type { LayoutConfig, GeneratedLayout } from "@/types/layout"
import { generateEditablePDF } from "./pdf-generator"

export async function exportToSVG(layout: GeneratedLayout, config: LayoutConfig) {
  const svg = generateSVG(layout, config)
  downloadFile(svg, `layout_${layout.id}.svg`, "image/svg+xml")
}

export async function exportToPDF(layout: GeneratedLayout, config: LayoutConfig) {
  try {
    const pdfBlob = await generateEditablePDF(layout, config)
    downloadBlob(pdfBlob, `complete_document_${layout.id}.pdf`)
  } catch (error) {
    console.error("PDF generation failed:", error)
    // Fallback to simple PDF content
    const pdfContent = generatePDFContent(layout, config)
    downloadFile(pdfContent, `layout_${layout.id}.pdf`, "application/pdf")
  }
}

export async function exportToFigma(layout: GeneratedLayout, config: LayoutConfig) {
  // This would integrate with Figma's API
  // For now, we'll create a JSON structure that could be imported
  const figmaData = generateFigmaData(layout, config)
  downloadFile(JSON.stringify(figmaData, null, 2), `layout_${layout.id}_figma.json`, "application/json")
}

function generateSVG(layout: GeneratedLayout, config: LayoutConfig): string {
  const { width, height } = layout.dimensions

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .margin-guide { fill: #3b82f6; fill-opacity: 0.1; stroke: #3b82f6; stroke-width: 2; stroke-dasharray: 5,5; }
      .bleed-guide { fill: none; stroke: #cc0000; stroke-width: 0.5; stroke-dasharray: 1,1; }
      .grid-line { fill: none; stroke: #cccccc; stroke-width: 0.25; }
      .gutter-guide { fill: none; stroke: #ff9900; stroke-width: 0.25; stroke-dasharray: 1,1; }
      .image-block { fill: #e6f3ff; stroke: #0066cc; stroke-width: 1; }
      .text-block { fill: #f0fff0; stroke: #00cc00; stroke-width: 1; }
      .element-label { font-family: Arial, sans-serif; font-size: 8px; text-anchor: middle; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Bleed guides -->
  <rect x="${-config.bleed}" y="${-config.bleed}" 
        width="${width + config.bleed * 2}" height="${height + config.bleed * 2}" 
        class="bleed-guide"/>
  
  <!-- Margin zones -->
  <rect x="0" y="0" width="${width}" height="${config.marginTop}" class="margin-guide"/>
  <rect x="0" y="${height - config.marginBottom}" width="${width}" height="${config.marginBottom}" class="margin-guide"/>
  <rect x="0" y="0" width="${config.marginLeft}" height="${height}" class="margin-guide"/>
  <rect x="${width - config.marginRight}" y="0" width="${config.marginRight}" height="${height}" class="margin-guide"/>
  
  <!-- Grid lines -->
  ${generateGridLines(config, width, height)}
  
  <!-- Gutter guides -->
  ${generateGutterGuides(config, width, height)}
  
  <!-- Layout elements -->
  ${layout.elements
    .map((element) => {
      const x = (element.x / 100) * width
      const y = (element.y / 100) * height
      const w = (element.width / 100) * width
      const h = (element.height / 100) * height

      return `
  <g id="${element.id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" class="${element.type}-block"/>
    <text x="${x + w / 2}" y="${y + h / 2}" class="element-label">${element.id}</text>
    <text x="${x + w / 2}" y="${y + h / 2 + 10}" class="element-label" style="font-size: 6px;">Gutter: ${config.gutterX}×${config.gutterY}mm</text>
  </g>`
    })
    .join("")}
  
</svg>`

  return svg
}

function generateGridLines(config: LayoutConfig, width: number, height: number): string {
  let lines = ""

  // Vertical lines
  for (let i = 0; i <= config.columns; i++) {
    const x = (i / config.columns) * width
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" class="grid-line"/>\n`
  }

  // Horizontal lines
  for (let i = 0; i <= config.rows; i++) {
    const y = (i / config.rows) * height
    lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" class="grid-line"/>\n`
  }

  return lines
}

function generateGutterGuides(config: LayoutConfig, width: number, height: number): string {
  let guides = ""

  // Vertical gutter guides
  for (let i = 1; i < config.columns; i++) {
    const x = (i / config.columns) * width
    const gutterStart = x - config.gutterX / 2
    const gutterEnd = x + config.gutterX / 2

    guides += `<rect x="${gutterStart}" y="0" width="${config.gutterX}" height="${height}" class="gutter-guide" fill="#ff9900" fill-opacity="0.1"/>\n`
  }

  // Horizontal gutter guides
  for (let i = 1; i < config.rows; i++) {
    const y = (i / config.rows) * height
    const gutterStart = y - config.gutterY / 2
    const gutterEnd = y + config.gutterY / 2

    guides += `<rect x="0" y="${gutterStart}" width="${width}" height="${config.gutterY}" class="gutter-guide" fill="#ff9900" fill-opacity="0.1"/>\n`
  }

  return guides
}

function generatePDFContent(layout: GeneratedLayout, config: LayoutConfig): string {
  // This is a simplified PDF structure - in reality you'd use PDFKit or similar
  return `%PDF-1.4
% GridGenie Generated Layout
% Layout ID: ${layout.id}
% Generated: ${layout.metadata.generatedAt.toISOString()}
% Elements: ${layout.elements.length} (${config.imageCount} images + ${config.textCount} text blocks)
% Dimensions: ${layout.dimensions.width}x${layout.dimensions.height}mm
% Grid: ${config.columns}x${config.rows}
% Aesthetic Rule: ${layout.metadata.aestheticRule}
% Grid System: ${layout.metadata.gridSystem}
% Gutters: ${config.gutterX}x${config.gutterY}mm
% Margins: T:${config.marginTop} B:${config.marginBottom} L:${config.marginLeft} R:${config.marginRight}mm

${layout.elements
  .map(
    (element) =>
      `% Element: ${element.id} (${element.type})
% Position: ${element.x.toFixed(1)}%, ${element.y.toFixed(1)}%
% Size: ${element.width.toFixed(1)}% x ${element.height.toFixed(1)}%
% Grid: ${element.gridX},${element.gridY} (${element.gridWidth}x${element.gridHeight})`,
  )
  .join("\n")}

%%EOF`
}

function generateFigmaData(layout: GeneratedLayout, config: LayoutConfig) {
  return {
    name: `GridGenie Layout ${layout.id}`,
    type: "FRAME",
    width: layout.dimensions.width,
    height: layout.dimensions.height,
    children: layout.elements.map((element) => ({
      name: element.id,
      type: element.type === "image" ? "RECTANGLE" : "TEXT",
      x: (element.x / 100) * layout.dimensions.width,
      y: (element.y / 100) * layout.dimensions.height,
      width: (element.width / 100) * layout.dimensions.width,
      height: (element.height / 100) * layout.dimensions.height,
      fills: [
        {
          type: "SOLID",
          color: element.type === "image" ? { r: 0.9, g: 0.95, b: 1 } : { r: 0.94, g: 1, b: 0.94 },
        },
      ],
      strokes: [
        {
          type: "SOLID",
          color: element.type === "image" ? { r: 0, g: 0.4, b: 0.8 } : { r: 0, g: 0.8, b: 0 },
        },
      ],
      strokeWeight: 1,
    })),
    metadata: {
      gridGenie: {
        config,
        generatedAt: layout.metadata.generatedAt,
        aestheticRule: layout.metadata.aestheticRule,
        gridSystem: layout.metadata.gridSystem,
      },
    },
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
