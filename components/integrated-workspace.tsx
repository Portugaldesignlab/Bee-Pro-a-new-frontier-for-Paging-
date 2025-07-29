"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, RotateCw, Move, Hand } from "lucide-react"
import type { LayoutConfig, GeneratedLayout, LayoutElement, GuidelineSettings } from "@/types/layout"
import { InteractiveElement } from "@/components/interactive-element"

interface IntegratedWorkspaceProps {
  layout: GeneratedLayout | null
  config: LayoutConfig
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  currentPage: number
  onPageChange: (page: number) => void
}

export function IntegratedWorkspace({
  layout,
  config,
  isGenerating,
  onUpdateElement,
  onDeleteElement,
  currentPage,
  onPageChange,
}: IntegratedWorkspaceProps) {
  const [selectedElementId, setSelectedElementId] = useState<string>("")
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [guidelines, setGuidelines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] })
  const [guidelineSettings, setGuidelineSettings] = useState<GuidelineSettings>({
    color: "#06b6d4",
    opacity: 0.8,
    locked: false,
    visible: true,
    snapDistance: 8,
  })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState<"select" | "pan">("select")
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  const workspaceRef = useRef<HTMLDivElement>(null)
  const documentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const rulerSize = 24

  // Handle scroll in the workspace
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop,
    })
  }, [])

  // Pan functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (tool === "pan" || e.button === 1) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        e.preventDefault()
      }
    },
    [tool, pan],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    },
    [isPanning, panStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom functionality
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)))
    }
  }, [])

  useEffect(() => {
    const workspace = workspaceRef.current
    if (workspace) {
      workspace.addEventListener("wheel", handleWheel, { passive: false })
      return () => workspace.removeEventListener("wheel", handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    if (isPanning) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isPanning, handleMouseMove, handleMouseUp])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && tool === "select") {
        setSelectedElementId("")
      }
    },
    [tool],
  )

  const handleGuidelineAdd = (type: "x" | "y", position: number) => {
    if (guidelineSettings.locked) return
    setGuidelines((prev) => ({
      ...prev,
      [type]: [...prev[type], position].sort((a, b) => a - b),
    }))
  }

  const handleGuidelineRemove = (type: "x" | "y", index: number) => {
    if (guidelineSettings.locked) return
    setGuidelines((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1))
  const handleResetView = () => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setRotation(0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0)
    }
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  // Generate ruler marks
  const generateRulerMarks = (length: number, isVertical: boolean) => {
    const marks = []
    const pixelsPerMM = zoom * 3.78 // Approximate pixels per mm at current zoom
    const mmLength = length / pixelsPerMM

    for (let mm = 0; mm <= mmLength; mm += 1) {
      const position = mm * pixelsPerMM
      const isMajor = mm % 10 === 0
      const isMinor = mm % 5 === 0

      if (position > length) break

      marks.push(
        <g key={mm}>
          <line
            x1={isVertical ? rulerSize - (isMajor ? 8 : isMinor ? 6 : 4) : position}
            y1={isVertical ? position : rulerSize - (isMajor ? 8 : isMinor ? 6 : 4)}
            x2={isVertical ? rulerSize : position}
            y2={isVertical ? position : rulerSize}
            stroke="#666"
            strokeWidth="0.5"
          />
          {isMajor && position < length - 20 && (
            <text
              x={isVertical ? rulerSize - 12 : position}
              y={isVertical ? position - 2 : rulerSize - 12}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
              transform={isVertical ? `rotate(-90, ${rulerSize - 12}, ${position - 2})` : ""}
            >
              {mm}
            </text>
          )}
        </g>,
      )
    }

    return marks
  }

  const renderWorkspace = () => {
    if (isGenerating) {
      return (
        <div className="flex-1 bg-gray-600 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white">Generating professional layout...</p>
          </div>
        </div>
      )
    }

    if (!layout) {
      return (
        <div className="flex-1 bg-gray-600 flex items-center justify-center">
          <div className="text-center space-y-4 text-white">
            <div className="text-6xl">📄</div>
            <div>
              <h3 className="font-semibold text-lg">Ready to Create</h3>
              <p className="text-gray-300">Generate a professional layout</p>
            </div>
          </div>
        </div>
      )
    }

    const pageWidth = layout.dimensions.width
    const pageHeight = layout.dimensions.height
    const bindingGutter = config.bindingGutter

    // Calculate document size
    const documentWidth = config.spreadView ? pageWidth * 2 + bindingGutter : pageWidth
    const documentHeight = pageHeight

    // Base scale to fit in workspace
    const baseScale = 2.5 // Fixed scale for consistent sizing
    const finalScale = baseScale * zoom
    const containerWidth = documentWidth * finalScale
    const containerHeight = documentHeight * finalScale

    // Total canvas size including rulers and padding
    const canvasWidth = containerWidth + rulerSize + 200 // Extra padding for scrolling
    const canvasHeight = containerHeight + rulerSize + 200

    return (
      <div className="flex-1 bg-gray-600 relative overflow-hidden">
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-auto"
          onScroll={handleScroll}
          style={{
            cursor: tool === "pan" || isPanning ? "grab" : "default",
          }}
        >
          {/* Canvas with rulers integrated */}
          <div
            ref={workspaceRef}
            className="relative bg-gray-600"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              minWidth: "100%",
              minHeight: "100%",
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Horizontal Ruler - Fixed at top */}
            <div
              className="absolute bg-gray-100 border-b border-gray-300 z-20"
              style={{
                left: rulerSize + 100,
                top: 100,
                width: containerWidth,
                height: rulerSize,
              }}
            >
              <svg width="100%" height="100%">
                <rect width="100%" height="100%" fill="#f3f4f6" />
                {generateRulerMarks(containerWidth, false)}
              </svg>
              {/* Ruler click area for guidelines */}
              <div
                className="absolute inset-0 cursor-crosshair"
                onMouseDown={(e) => {
                  if (guidelineSettings.locked) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const position = ((e.clientX - rect.left) / rect.width) * 100
                  if (position >= 0 && position <= 100) {
                    handleGuidelineAdd("x", position)
                  }
                }}
                title="Click to add vertical guideline"
              />
            </div>

            {/* Vertical Ruler - Fixed at left */}
            <div
              className="absolute bg-gray-100 border-r border-gray-300 z-20"
              style={{
                left: 100,
                top: rulerSize + 100,
                width: rulerSize,
                height: containerHeight,
              }}
            >
              <svg width="100%" height="100%">
                <rect width="100%" height="100%" fill="#f3f4f6" />
                <g>{generateRulerMarks(containerHeight, true)}</g>
              </svg>
              {/* Ruler click area for guidelines */}
              <div
                className="absolute inset-0 cursor-crosshair"
                onMouseDown={(e) => {
                  if (guidelineSettings.locked) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const position = ((e.clientY - rect.top) / rect.height) * 100
                  if (position >= 0 && position <= 100) {
                    handleGuidelineAdd("y", position)
                  }
                }}
                title="Click to add horizontal guideline"
              />
            </div>

            {/* Ruler Corner */}
            <div
              className="absolute bg-gray-200 border border-gray-300 z-30"
              style={{
                left: 100,
                top: 100,
                width: rulerSize,
                height: rulerSize,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">mm</div>
            </div>

            {/* Document Container */}
            <div
              className="absolute bg-white shadow-2xl"
              style={{
                left: rulerSize + 100,
                top: rulerSize + 100,
                width: containerWidth,
                height: containerHeight,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
              onClick={handleCanvasClick}
            >
              {/* Guidelines */}
              {guidelineSettings.visible && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical Guidelines */}
                  {guidelines.x.map((x, index) => (
                    <div
                      key={`x-${index}`}
                      className="absolute top-0 w-px pointer-events-auto cursor-ew-resize hover:w-0.5"
                      style={{
                        left: `${x}%`,
                        height: "100%",
                        backgroundColor: guidelineSettings.color,
                        opacity: guidelineSettings.opacity,
                        boxShadow: `0 0 0 0.5px ${guidelineSettings.color}30`,
                      }}
                      onDoubleClick={() => !guidelineSettings.locked && handleGuidelineRemove("x", index)}
                      title="Double-click to remove guideline"
                    />
                  ))}

                  {/* Horizontal Guidelines */}
                  {guidelines.y.map((y, index) => (
                    <div
                      key={`y-${index}`}
                      className="absolute left-0 h-px pointer-events-auto cursor-ns-resize hover:h-0.5"
                      style={{
                        top: `${y}%`,
                        width: "100%",
                        backgroundColor: guidelineSettings.color,
                        opacity: guidelineSettings.opacity,
                        boxShadow: `0 0 0 0.5px ${guidelineSettings.color}30`,
                      }}
                      onDoubleClick={() => !guidelineSettings.locked && handleGuidelineRemove("y", index)}
                      title="Double-click to remove guideline"
                    />
                  ))}
                </div>
              )}

              {/* Document Content */}
              <div ref={documentRef} className="relative w-full h-full">
                {config.spreadView ? renderSpreadView(containerWidth, containerHeight) : renderSinglePageView()}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed UI Controls */}
        {/* Tool Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-40">
          <div className="bg-black/80 text-white p-2 rounded-lg flex gap-2">
            <Button
              variant={tool === "select" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("select")}
              className="text-white hover:bg-white/20"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "pan" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("pan")}
              className="text-white hover:bg-white/20"
            >
              <Hand className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
          <div className="bg-black/80 text-white p-2 rounded-lg flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-white hover:bg-white/20">
              -
            </Button>
            <span className="text-sm px-2 py-1 min-w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-white hover:bg-white/20">
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRotate} className="text-white hover:bg-white/20">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetView} className="text-white hover:bg-white/20">
              Reset
            </Button>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="text-white hover:bg-white/20"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {config.pageCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.min(config.pageCount, currentPage + 1))}
            disabled={currentPage >= config.pageCount}
            className="text-white hover:bg-white/20"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Element Count */}
        <div className="absolute bottom-4 right-4 z-40">
          <Badge variant="secondary" className="bg-black/80 text-white border-white/20">
            {layout.elements.length} Elements
          </Badge>
        </div>
      </div>
    )
  }

  const renderSpreadView = (containerWidth: number, containerHeight: number) => {
    const pageWidth = layout!.dimensions.width
    const bindingGutter = config.bindingGutter
    const totalWidth = pageWidth * 2 + bindingGutter
    const leftPageWidth = (pageWidth / totalWidth) * containerWidth
    const gutterWidth = (bindingGutter / totalWidth) * containerWidth
    const rightPageWidth = leftPageWidth

    return (
      <div className="relative w-full h-full flex">
        {/* Left Page */}
        <div className="relative bg-white" style={{ width: leftPageWidth }}>
          <div className="absolute top-2 left-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none z-10">
            Left Page
          </div>
          {renderMargins(leftPageWidth, containerHeight, "left")}
        </div>

        {/* Binding Gutter */}
        <div className="relative bg-gray-100 border-x border-gray-300" style={{ width: gutterWidth }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-500 font-medium transform -rotate-90 whitespace-nowrap">
              {bindingGutter}mm
            </div>
          </div>
        </div>

        {/* Right Page */}
        <div className="relative bg-white" style={{ width: rightPageWidth }}>
          <div className="absolute top-2 right-2 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded pointer-events-none z-10">
            Right Page
          </div>
          {renderMargins(rightPageWidth, containerHeight, "right")}
        </div>

        {/* Interactive Elements */}
        {layout!.elements.map((element) => (
          <InteractiveElement
            key={element.id}
            element={element}
            config={config}
            pageWidth={layout!.dimensions.width}
            pageHeight={layout!.dimensions.height}
            isSelected={selectedElementId === element.id}
            onSelect={setSelectedElementId}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            scale={zoom}
            containerRef={documentRef}
          />
        ))}
      </div>
    )
  }

  const renderSinglePageView = () => {
    return (
      <div className="relative w-full h-full bg-white">
        {renderMargins(documentRef.current?.clientWidth || 0, documentRef.current?.clientHeight || 0, "single")}

        {/* Interactive Elements */}
        {layout!.elements.map((element) => (
          <InteractiveElement
            key={element.id}
            element={element}
            config={config}
            pageWidth={layout!.dimensions.width}
            pageHeight={layout!.dimensions.height}
            isSelected={selectedElementId === element.id}
            onSelect={setSelectedElementId}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            scale={zoom}
            containerRef={documentRef}
          />
        ))}
      </div>
    )
  }

  const renderMargins = (width: number, height: number, pageType: "left" | "right" | "single") => {
    if (!layout) return null

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
        <defs>
          <pattern id="marginPattern" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="none" />
            <rect width="2" height="2" fill="#3b82f6" fillOpacity="0.1" />
          </pattern>
        </defs>

        {/* Margin areas */}
        <rect
          x="0"
          y="0"
          width={width}
          height={topMargin}
          fill="url(#marginPattern)"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
        />
        <rect
          x="0"
          y={height - bottomMargin}
          width={width}
          height={bottomMargin}
          fill="url(#marginPattern)"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
        />
        <rect
          x="0"
          y="0"
          width={leftMargin}
          height={height}
          fill="url(#marginPattern)"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
        />
        <rect
          x={width - rightMargin}
          y="0"
          width={rightMargin}
          height={height}
          fill="url(#marginPattern)"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="2,2"
          strokeOpacity="0.5"
        />
      </svg>
    )
  }

  return renderWorkspace()
}
