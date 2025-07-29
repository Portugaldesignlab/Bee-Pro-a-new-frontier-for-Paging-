"use client"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Move, Hand } from "lucide-react"
import { InteractiveElement } from "./interactive-element"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import { getPageSize } from "@/lib/page-sizes"

interface InDesignStyleWorkspaceProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: Partial<LayoutElement>) => void
}

interface PageLayout {
  pageNumber: number
  isSpread: boolean
  elements: LayoutElement[]
}

export function InDesignStyleWorkspace({
  config,
  layout,
  onConfigChange,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
}: InDesignStyleWorkspaceProps) {
  const [zoom, setZoom] = useState(0.6)
  const [tool, setTool] = useState<"select" | "pan">("select")
  const [selectedElementId, setSelectedElementId] = useState<string>("")
  const workspaceRef = useRef<HTMLDivElement>(null)

  const pageSize = getPageSize(config.pageSize)
  const elementCount = layout?.elements?.length || 0

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.2))
  const handleResetView = () => setZoom(0.6)

  // Generate page layouts based on config
  const generatePageLayouts = (): PageLayout[] => {
    const pages: PageLayout[] = []
    const totalPages = config.pageCount || 4

    // Distribute elements across pages
    const elementsPerPage = layout?.elements ? Math.ceil(layout.elements.length / totalPages) : 0

    for (let i = 0; i < totalPages; i++) {
      const pageNumber = i + 1
      const isSpread = pageNumber > 1 && pageNumber % 2 === 0 // Even pages after page 1 are spreads

      const startIndex = i * elementsPerPage
      const endIndex = Math.min(startIndex + elementsPerPage, layout?.elements?.length || 0)
      const pageElements = layout?.elements?.slice(startIndex, endIndex) || []

      pages.push({
        pageNumber,
        isSpread,
        elements: pageElements,
      })
    }

    return pages
  }

  const pageLayouts = generatePageLayouts()

  const renderPage = (pageLayout: PageLayout, index: number) => {
    const { pageNumber, isSpread, elements } = pageLayout

    // Calculate page dimensions
    const baseWidth = pageSize.width * 2.5 // Base scale for display
    const baseHeight = pageSize.height * 2.5
    const spreadWidth = isSpread ? baseWidth * 2 + config.bindingGutter * 2.5 : baseWidth

    const finalWidth = spreadWidth * zoom
    const finalHeight = baseHeight * zoom

    return (
      <div key={`page-${pageNumber}`} className="mb-8 flex flex-col items-center">
        {/* Page Number Label */}
        <div className="mb-4 text-sm text-gray-600 font-medium">
          {isSpread ? `Pages ${pageNumber - 1}-${pageNumber}` : `Page ${pageNumber}`}
        </div>

        {/* Page Container */}
        <div
          className="relative bg-white shadow-lg"
          style={{
            width: finalWidth,
            height: finalHeight,
          }}
        >
          {/* Bleed Area (extends beyond page) */}
          <div
            className="absolute bg-gray-50 border border-gray-200"
            style={{
              left: -3 * zoom,
              top: -3 * zoom,
              width: finalWidth + 6 * zoom,
              height: finalHeight + 6 * zoom,
              zIndex: -1,
            }}
          />

          {/* Margin Guides */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            {/* Margin lines */}
            <rect
              x={config.marginLeft * 2.5 * zoom}
              y={config.marginTop * 2.5 * zoom}
              width={finalWidth - (config.marginLeft + config.marginRight) * 2.5 * zoom}
              height={finalHeight - (config.marginTop + config.marginBottom) * 2.5 * zoom}
              fill="none"
              stroke="#ff00ff"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.6"
            />

            {/* Bleed guides */}
            <rect
              x={-3 * zoom}
              y={-3 * zoom}
              width={finalWidth + 6 * zoom}
              height={finalHeight + 6 * zoom}
              fill="none"
              stroke="#00ffff"
              strokeWidth="0.5"
              strokeDasharray="1,1"
              opacity="0.4"
            />

            {/* Binding gutter for spreads */}
            {isSpread && (
              <line
                x1={finalWidth / 2}
                y1="0"
                x2={finalWidth / 2}
                y2={finalHeight}
                stroke="#ff00ff"
                strokeWidth="1"
                opacity="0.6"
              />
            )}
          </svg>

          {/* Page Content Area */}
          <div className="relative w-full h-full">
            {/* Background texture/color if needed */}
            {pageNumber > 2 && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d4a574' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundColor: "#f5e6d3",
                }}
              />
            )}

            {/* Generated Elements */}
            {elements.map((element) => (
              <InteractiveElement
                key={element.id}
                element={element}
                config={config}
                pageWidth={pageSize.width}
                pageHeight={pageSize.height}
                isSelected={selectedElementId === element.id}
                onSelect={setSelectedElementId}
                onUpdate={onUpdateElement}
                onDelete={onDeleteElement}
                scale={zoom * 2.5}
                containerRef={workspaceRef}
              />
            ))}

            {/* Page Labels for spreads */}
            {isSpread && (
              <>
                <div className="absolute top-2 left-4 text-xs text-gray-400 font-medium pointer-events-none">
                  Left Page
                </div>
                <div className="absolute top-2 right-4 text-xs text-gray-400 font-medium pointer-events-none">
                  Right Page
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page Info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {elements.length} elements • {Math.round(finalWidth)}×{Math.round(finalHeight)}px
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-600 relative overflow-hidden">
      {/* Scrollable Workspace */}
      <div
        ref={workspaceRef}
        className="absolute inset-0 overflow-auto p-8"
        style={{
          cursor: tool === "pan" ? "grab" : "default",
        }}
      >
        <div className="min-w-full">
          {/* Pages Container */}
          <div className="flex flex-col items-center space-y-8 py-8">
            {pageLayouts.length > 0 ? (
              pageLayouts.map((pageLayout, index) => renderPage(pageLayout, index))
            ) : (
              <div className="text-center text-white py-16">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No Layout Generated</h3>
                <p className="text-gray-300">Generate a layout to see pages here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tool Controls */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-40">
        <div className="bg-black/90 text-white p-3 rounded-xl flex gap-3 shadow-lg">
          <Button
            variant={tool === "select" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTool("select")}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Select Tool"
          >
            <Move className="h-5 w-5" />
          </Button>
          <Button
            variant={tool === "pan" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTool("pan")}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Pan Tool"
          >
            <Hand className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-40">
        <div className="bg-black/90 text-white p-3 rounded-xl flex gap-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <div className="text-sm px-3 py-2 min-w-20 text-center bg-white/10 rounded font-medium">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Reset View"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Page Navigation Info */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm">
        {pageLayouts.length} {pageLayouts.length === 1 ? "Page" : "Pages"} • {elementCount} Elements Total
      </div>

      {/* Status Info */}
      <div className="absolute bottom-6 right-6">
        <Badge variant="secondary" className="bg-black/90 text-white border-white/20">
          {pageSize.width}×{pageSize.height}mm
        </Badge>
      </div>
    </div>
  )
}
