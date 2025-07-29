"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers, BookOpen, ZoomIn, ZoomOut, RotateCcw, Move, Ruler } from "lucide-react"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import { InteractiveElement } from "@/components/interactive-element"
import { RulersAndGuidelines } from "@/components/rulers-and-guidelines"
import { useState, useCallback, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface LayoutPreviewProps {
  layout: GeneratedLayout | null
  config: LayoutConfig
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
}

export function LayoutPreview({ layout, config, isGenerating, onUpdateElement, onDeleteElement }: LayoutPreviewProps) {
  const [showMargins, setShowMargins] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [selectedElementId, setSelectedElementId] = useState<string>("")
  const [zoom, setZoom] = useState(0.8)
  const [guidelines, setGuidelines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] })

  const previewRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.2))
  }

  const handleResetZoom = () => {
    setZoom(0.8)
  }

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId("")
    }
  }, [])

  const handleGuidelineAdd = (type: "x" | "y", position: number) => {
    setGuidelines((prev) => ({
      ...prev,
      [type]: [...prev[type], position].sort((a, b) => a - b),
    }))
  }

  const handleGuidelineRemove = (type: "x" | "y", index: number) => {
    setGuidelines((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  if (isGenerating) {
    return (
      <Card className="flex-1 min-h-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Professional Layout Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Generating professional layout...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!layout) {
    return (
      <Card className="flex-1 min-h-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Professional Layout Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Ready to Create</h3>
              <p className="text-muted-foreground">Generate a professional layout with proper spacing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderWorkspace = () => {
    const pageWidth = layout.dimensions.width
    const pageHeight = layout.dimensions.height
    const bindingGutter = config.bindingGutter
    const totalWidth = config.spreadView ? pageWidth * 2 + bindingGutter : pageWidth

    // Calculate container dimensions
    const containerWidth = 800 * zoom
    const containerHeight = (containerWidth / totalWidth) * pageHeight
    const rulerSize = showRulers ? 24 : 0

    return (
      <div ref={workspaceRef} className="relative bg-gray-600 overflow-auto flex-1 p-8" style={{ minHeight: "600px" }}>
        {/* Workspace container */}
        <div
          className="relative mx-auto"
          style={{
            width: containerWidth + rulerSize,
            height: containerHeight + rulerSize,
          }}
        >
          {/* Rulers and Guidelines */}
          {showRulers && (
            <RulersAndGuidelines
              width={containerWidth}
              height={containerHeight}
              zoom={zoom}
              showRulers={showRulers}
              guidelines={guidelines}
              onGuidelineAdd={handleGuidelineAdd}
              onGuidelineRemove={handleGuidelineRemove}
            />
          )}

          {/* Document Container */}
          <div
            ref={previewRef}
            className="absolute bg-white shadow-lg"
            style={{
              left: rulerSize,
              top: rulerSize,
              width: containerWidth,
              height: containerHeight,
            }}
            onClick={handleCanvasClick}
          >
            {config.spreadView
              ? renderSpreadView(containerWidth, containerHeight)
              : renderSinglePageView(containerWidth, containerHeight)}
          </div>
        </div>
      </div>
    )
  }

  const renderSpreadView = (containerWidth: number, containerHeight: number) => {
    const pageWidth = layout.dimensions.width
    const pageHeight = layout.dimensions.height
    const bindingGutter = config.bindingGutter
    const totalWidth = pageWidth * 2 + bindingGutter
    const leftPageWidth = (pageWidth / totalWidth) * containerWidth
    const gutterWidth = (bindingGutter / totalWidth) * containerWidth
    const rightPageWidth = leftPageWidth

    return (
      <div className="relative w-full h-full flex">
        {/* Left Page */}
        <div className="relative bg-white border-r border-gray-300" style={{ width: leftPageWidth }}>
          <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none z-10">
            Left Page
          </div>
          {showMargins && renderMargins(leftPageWidth, containerHeight, "left")}
        </div>

        {/* Binding Gutter */}
        <div className="relative bg-gray-100 border-x border-gray-300" style={{ width: gutterWidth }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-500 font-medium transform -rotate-90 whitespace-nowrap">
              Binding {bindingGutter}mm
            </div>
          </div>
        </div>

        {/* Right Page */}
        <div className="relative bg-white border-l border-gray-300" style={{ width: rightPageWidth }}>
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none z-10">
            Right Page
          </div>
          {showMargins && renderMargins(rightPageWidth, containerHeight, "right")}
        </div>

        {/* Interactive Elements */}
        {layout.elements.map((element) => (
          <InteractiveElement
            key={element.id}
            element={element}
            config={config}
            pageWidth={layout.dimensions.width}
            pageHeight={layout.dimensions.height}
            isSelected={selectedElementId === element.id}
            onSelect={setSelectedElementId}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            scale={zoom}
            containerRef={previewRef}
          />
        ))}
      </div>
    )
  }

  const renderSinglePageView = (containerWidth: number, containerHeight: number) => {
    return (
      <div className="relative w-full h-full bg-white">
        {showMargins && renderMargins(containerWidth, containerHeight, "single")}

        {/* Interactive Elements */}
        {layout.elements.map((element) => (
          <InteractiveElement
            key={element.id}
            element={element}
            config={config}
            pageWidth={layout.dimensions.width}
            pageHeight={layout.dimensions.height}
            isSelected={selectedElementId === element.id}
            onSelect={setSelectedElementId}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            scale={zoom}
            containerRef={previewRef}
          />
        ))}
      </div>
    )
  }

  const renderMargins = (width: number, height: number, pageType: "left" | "right" | "single") => {
    let leftMargin: number, rightMargin: number

    if (pageType === "left") {
      leftMargin = (config.marginOuter / layout.dimensions.width) * width
      rightMargin = (config.marginInner / layout.dimensions.width) * width
    } else if (pageType === "right") {
      leftMargin = (config.marginInner / layout.dimensions.width) * width
      rightMargin = (config.marginOuter / layout.dimensions.width) * width
    } else {
      leftMargin = (config.marginLeft / layout.dimensions.width) * width
      rightMargin = (config.marginRight / layout.dimensions.width) * width
    }

    const topMargin = (config.marginTop / layout.dimensions.height) * height
    const bottomMargin = (config.marginBottom / layout.dimensions.height) * height

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Margin areas */}
        <rect
          x="0"
          y="0"
          width={width}
          height={topMargin}
          fill="#3b82f6"
          fillOpacity="0.1"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <rect
          x="0"
          y={height - bottomMargin}
          width={width}
          height={bottomMargin}
          fill="#3b82f6"
          fillOpacity="0.1"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <rect
          x="0"
          y="0"
          width={leftMargin}
          height={height}
          fill="#3b82f6"
          fillOpacity="0.1"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <rect
          x={width - rightMargin}
          y="0"
          width={rightMargin}
          height={height}
          fill="#3b82f6"
          fillOpacity="0.1"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    )
  }

  const selectedElement = layout?.elements.find((el) => el.id === selectedElementId)

  return (
    <Card className="flex-1 min-h-0 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Professional Layout Editor
            <Badge variant="secondary" className="ml-2">
              {layout.elements.length} Elements
            </Badge>
            {selectedElement && (
              <Badge variant="outline" className="ml-2 bg-blue-50 border-blue-200">
                <Move className="h-3 w-3 mr-1" />
                {selectedElement.id}
              </Badge>
            )}
          </CardTitle>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Workspace */}
      {renderWorkspace()}

      {/* Status Bar */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {layout.elements.length} Elements
            </div>
            <div>
              {config.spreadView
                ? `${layout.dimensions.width * 2 + config.bindingGutter} × ${layout.dimensions.height}mm (spread)`
                : `${layout.dimensions.width} × ${layout.dimensions.height}mm`}
            </div>
            {selectedElement && (
              <div className="text-blue-600 font-medium">
                {selectedElement.id}: {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)} -
                {Math.round(selectedElement.width)}% × {Math.round(selectedElement.height)}%
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-rulers" checked={showRulers} onCheckedChange={setShowRulers} className="scale-75" />
              <Label htmlFor="show-rulers" className="text-xs flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                Rulers
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="show-margins" checked={showMargins} onCheckedChange={setShowMargins} className="scale-75" />
              <Label htmlFor="show-margins" className="text-xs">
                Margins
              </Label>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="font-medium text-blue-800 mb-1">📐 Professional Design Interface:</div>
          <div className="text-blue-700 space-y-1">
            <div>
              <strong>Rulers:</strong> Click rulers to add cyan guidelines • Double-click guidelines to remove
            </div>
            <div>
              <strong>Elements:</strong> Real lorem ipsum text • Actual mm dimensions • Non-overlapping placement
            </div>
            <div>
              <strong>Controls:</strong> Drag to move • Blue handles to resize • Arrow keys for precision
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
