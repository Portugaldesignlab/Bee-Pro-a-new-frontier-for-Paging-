"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InteractiveElement } from "@/components/interactive-element"
import { ZoomIn, ZoomOut, RotateCcw, Move, Hand, BookOpen, FileText, Plus } from "lucide-react"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import { getPageSize } from "@/lib/page-sizes"
import { createTextElement, createImageElement, findNextAvailablePosition } from "@/lib/layout-generator"

interface ConstantRulersWorkspaceProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: LayoutElement) => void
  currentPage: number
  onPageChange: (page: number) => void
}

interface SpreadLayout {
  spreadNumber: number
  pages: number[]
  type: "cover" | "right-only" | "left-only" | "facing" | "single"
  elements: LayoutElement[]
  spineWidth?: number
}

interface Guideline {
  id: string
  type: "vertical" | "horizontal"
  position: number
  color: string
  locked: boolean
}

interface BindingSpecs {
  spineCalculation: (pages: number, gsm: number) => number
  coverOverhang: number
  spineMargin: number
  bleedRequirement: number
  foldAllowance: number
  safetyMargin: number
}

interface MarginBounds {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}

const BINDING_SPECIFICATIONS: Record<string, BindingSpecs> = {
  "perfect-bound": {
    spineCalculation: (pages, gsm) => Math.max((pages * gsm * 0.8) / 1000, 3),
    coverOverhang: 3,
    spineMargin: 4,
    bleedRequirement: 3,
    foldAllowance: 0,
    safetyMargin: 2,
  },
  "saddle-stitched": {
    spineCalculation: (pages, gsm) => Math.max((pages * gsm * 0.4) / 1000, 1.5),
    coverOverhang: 0,
    spineMargin: 6,
    bleedRequirement: 3,
    foldAllowance: 2,
    safetyMargin: 3,
  },
  "spiral-bound": {
    spineCalculation: () => 12,
    coverOverhang: 0,
    spineMargin: 15,
    bleedRequirement: 3,
    foldAllowance: 0,
    safetyMargin: 5,
  },
  "case-bound": {
    spineCalculation: (pages, gsm) => Math.max((pages * gsm * 0.9) / 1000 + 6, 8),
    coverOverhang: 6,
    spineMargin: 5,
    bleedRequirement: 6,
    foldAllowance: 3,
    safetyMargin: 3,
  },
  "wire-o": {
    spineCalculation: () => 8,
    coverOverhang: 0,
    spineMargin: 12,
    bleedRequirement: 3,
    foldAllowance: 0,
    safetyMargin: 4,
  },
  "comb-bound": {
    spineCalculation: () => 10,
    coverOverhang: 0,
    spineMargin: 15,
    bleedRequirement: 3,
    foldAllowance: 0,
    safetyMargin: 5,
  },
}

export function ConstantRulersWorkspace({
  config,
  layout,
  isGenerating,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  currentPage,
  onPageChange,
}: ConstantRulersWorkspaceProps) {
  const [zoom, setZoom] = useState(0.4)
  const [tool, setTool] = useState<"select" | "pan">("select")
  const [selectedElementId, setSelectedElementId] = useState<string>("")
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>("")
  const [facingPages, setFacingPages] = useState(true)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [isDraggingFromRuler, setIsDraggingFromRuler] = useState<{
    active: boolean
    type: "vertical" | "horizontal"
    startPos: { x: number; y: number }
  } | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })

  const workspaceRef = useRef<HTMLDivElement>(null)
  const rulerSize = 24

  const pageSize = getPageSize(config.pageSize)
  const pageWidth = config.pageSize === "custom" ? config.customWidth : pageSize.width
  const pageHeight = config.pageSize === "custom" ? config.customHeight : pageSize.height
  const elementCount = layout?.elements?.length || 0

  // Get binding specifications
  const bindingSpecs = BINDING_SPECIFICATIONS[config.bindingType] || BINDING_SPECIFICATIONS["perfect-bound"]

  const handleZoomIn = useCallback(() => setZoom((prev) => Math.min(prev * 1.2, 3)), [])
  const handleZoomOut = useCallback(() => setZoom((prev) => Math.max(prev / 1.2, 0.2)), [])
  const handleResetView = () => setZoom(0.4)

  // Calculate margin bounds for a specific spread and page
  const getMarginBounds = useCallback(
    (spreadLayout: SpreadLayout, pageIndex = 0): MarginBounds => {
      const { type, pages } = spreadLayout
      const pageNumber = pages[pageIndex] || pages[0]

      let marginLeft = config.marginLeft || 20
      let marginRight = config.marginRight || 20
      const marginTop = config.marginTop || 20
      const marginBottom = config.marginBottom || 20

      // Adjust margins based on page type
      if (type === "facing") {
        if (pageIndex === 0) {
          // Left page
          marginLeft = config.marginOuter || 25
          marginRight = config.marginInner || 15
        } else {
          // Right page
          marginLeft = config.marginInner || 15
          marginRight = config.marginOuter || 25
        }
      } else if (type === "left-only") {
        marginLeft = config.marginOuter || 25
        marginRight = config.marginInner || 15
      } else if (type === "right-only") {
        marginLeft = config.marginInner || 15
        marginRight = config.marginOuter || 25
      }

      const bounds = {
        left: marginLeft,
        right: pageWidth - marginRight,
        top: marginTop,
        bottom: pageHeight - marginBottom,
        width: pageWidth - marginLeft - marginRight,
        height: pageHeight - marginTop - marginBottom,
      }

      return bounds
    },
    [config, pageWidth, pageHeight],
  )

  // Handle window resize and set initial size
  useEffect(() => {
    const updateWindowSize = () => {
      if (typeof window !== "undefined") {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    updateWindowSize()

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateWindowSize)
      return () => window.removeEventListener("resize", updateWindowSize)
    }
  }, [])

  // Track scroll position for ruler updates with throttling
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking && workspaceRef.current) {
        requestAnimationFrame(() => {
          if (workspaceRef.current) {
            setScrollPosition({
              x: workspaceRef.current.scrollLeft,
              y: workspaceRef.current.scrollTop,
            })
          }
          ticking = false
        })
        ticking = true
      }
    }

    const workspace = workspaceRef.current
    if (workspace) {
      workspace.addEventListener("scroll", handleScroll, { passive: true })
      return () => workspace.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Handle ruler drag to create guidelines
  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent, type: "vertical" | "horizontal") => {
      if (tool !== "select") return

      e.preventDefault()
      setIsDraggingFromRuler({
        active: true,
        type,
        startPos: { x: e.clientX, y: e.clientY },
      })
    },
    [tool],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingFromRuler?.active || !workspaceRef.current) return

      const workspaceRect = workspaceRef.current.getBoundingClientRect()
      const rulerOffset = rulerSize

      if (isDraggingFromRuler.type === "vertical") {
        const x = e.clientX - workspaceRect.left - rulerOffset + scrollPosition.x
        const percentage = Math.max(0, Math.min(100, (x / (workspaceRect.width - rulerOffset)) * 100))

        const previewLine = document.getElementById("preview-guideline")
        if (previewLine) {
          previewLine.style.left = `${percentage}%`
          previewLine.style.display = "block"
        }
      } else {
        const y = e.clientY - workspaceRect.top - rulerOffset + scrollPosition.y
        const percentage = Math.max(0, Math.min(100, (y / (workspaceRect.height - rulerOffset)) * 100))

        const previewLine = document.getElementById("preview-guideline")
        if (previewLine) {
          previewLine.style.top = `${percentage}%`
          previewLine.style.display = "block"
        }
      }
    },
    [isDraggingFromRuler, scrollPosition],
  )

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingFromRuler?.active || !workspaceRef.current) return

      const workspaceRect = workspaceRef.current.getBoundingClientRect()
      const rulerOffset = rulerSize

      let percentage: number
      if (isDraggingFromRuler.type === "vertical") {
        const x = e.clientX - workspaceRect.left - rulerOffset + scrollPosition.x
        percentage = Math.max(0, Math.min(100, (x / (workspaceRect.width - rulerOffset)) * 100))
      } else {
        const y = e.clientY - workspaceRect.top - rulerOffset + scrollPosition.y
        percentage = Math.max(0, Math.min(100, (y / (workspaceRect.height - rulerOffset)) * 100))
      }

      const newGuideline: Guideline = {
        id: `guideline-${Date.now()}`,
        type: isDraggingFromRuler.type,
        position: percentage,
        color: config.gridLineColor || "#ff00ff",
        locked: false,
      }

      setGuidelines((prev) => [...prev, newGuideline])
      setIsDraggingFromRuler(null)

      const previewLine = document.getElementById("preview-guideline")
      if (previewLine) {
        previewLine.style.display = "none"
      }
    },
    [isDraggingFromRuler, scrollPosition, config.gridLineColor],
  )

  useEffect(() => {
    if (isDraggingFromRuler?.active) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDraggingFromRuler, handleMouseMove, handleMouseUp])

  // Remove guideline on double click
  const handleGuidelineDoubleClick = (guidelineId: string) => {
    setGuidelines((prev) => prev.filter((g) => g.id !== guidelineId))
  }

  // Generate ruler marks
  const generateRulerMarks = (length: number, isVertical: boolean, offset = 0) => {
    const marks = []
    const pixelsPerMM = 3.78 * zoom
    const startMM = Math.floor(offset / pixelsPerMM)
    const endMM = Math.ceil((offset + length) / pixelsPerMM)

    for (let mm = startMM; mm <= endMM; mm += 5) {
      const position = mm * pixelsPerMM - offset
      const isMajor = mm % 10 === 0

      if (position < -20 || position > length + 20) continue

      marks.push(
        <g key={mm}>
          <line
            x1={isVertical ? rulerSize - (isMajor ? 8 : 4) : position}
            y1={isVertical ? position : rulerSize - (isMajor ? 8 : 4)}
            x2={isVertical ? rulerSize : position}
            y2={isVertical ? position : rulerSize}
            stroke="#666"
            strokeWidth="0.5"
          />
          {isMajor && position >= 0 && position <= length && (
            <text
              x={isVertical ? rulerSize - 12 : position}
              y={isVertical ? position + 3 : rulerSize - 10}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
              transform={isVertical ? `rotate(-90, ${rulerSize - 12}, ${position + 3})` : ""}
            >
              {mm}
            </text>
          )}
        </g>,
      )
    }

    return marks
  }

  // Generate unified grid and guideline system
  const generateGridAndGuidelines = (
    width: number,
    height: number,
    offsetX = 0,
    offsetY = 0,
    isLeftPage = false,
    isRightPage = false,
  ) => {
    const lines = []
    const scale = 2.5 * zoom

    // Calculate margin-aligned grid area with safety checks
    let marginLeft = (config.marginLeft || 20) * scale
    let marginRight = (config.marginRight || 20) * scale
    const marginTop = (config.marginTop || 20) * scale
    const marginBottom = (config.marginBottom || 20) * scale

    // Adjust margins for facing pages
    if (isLeftPage) {
      marginLeft = (config.marginOuter || 25) * scale
      marginRight = (config.marginInner || 15) * scale
    } else if (isRightPage) {
      marginLeft = (config.marginInner || 15) * scale
      marginRight = (config.marginOuter || 25) * scale
    }

    const gridAreaX = offsetX + marginLeft
    const gridAreaY = offsetY + marginTop
    const gridAreaWidth = Math.max(0, width - marginLeft - marginRight)
    const gridAreaHeight = Math.max(0, height - marginTop - marginBottom)

    // Only proceed if we have valid dimensions
    if (gridAreaWidth <= 0 || gridAreaHeight <= 0) {
      return lines
    }

    // Grid lines (if enabled)
    if (config.showGridLines) {
      if (config.gridSizeMode === "count") {
        const totalHorizontalSpacing = (config.columns - 1) * config.gridSpacingX * scale
        const totalVerticalSpacing = (config.rows - 1) * config.gridSpacingY * scale
        const availableGridWidth = gridAreaWidth - totalHorizontalSpacing
        const availableGridHeight = gridAreaHeight - totalVerticalSpacing

        const cellWidth = availableGridWidth / config.columns
        const cellHeight = availableGridHeight / config.rows
        const spacingX = config.gridSpacingX * scale
        const spacingY = config.gridSpacingY * scale

        // Vertical grid lines (columns with spacing)
        for (let i = 0; i <= config.columns; i++) {
          const x = gridAreaX + i * (cellWidth + spacingX)
          if (x <= gridAreaX + gridAreaWidth) {
            lines.push(
              <line
                key={`grid-v-${i}-${offsetX}`}
                x1={x}
                y1={gridAreaY}
                x2={x}
                y2={gridAreaY + gridAreaHeight}
                stroke={config.gridLineColor}
                strokeWidth="0.5"
                opacity={config.gridLineOpacity}
                strokeDasharray="1,1"
              />,
            )
          }

          if (i < config.columns && spacingX > 0) {
            const gutterX = gridAreaX + i * (cellWidth + spacingX) + cellWidth
            if (gutterX + spacingX <= gridAreaX + gridAreaWidth) {
              lines.push(
                <rect
                  key={`gutter-v-${i}-${offsetX}`}
                  x={gutterX}
                  y={gridAreaY}
                  width={spacingX}
                  height={gridAreaHeight}
                  fill={config.gridLineColor}
                  opacity={config.gridLineOpacity * 0.2}
                />,
              )
            }
          }
        }

        // Horizontal grid lines (rows with spacing)
        for (let i = 0; i <= config.rows; i++) {
          const y = gridAreaY + i * (cellHeight + spacingY)
          if (y <= gridAreaY + gridAreaHeight) {
            lines.push(
              <line
                key={`grid-h-${i}-${offsetY}`}
                x1={gridAreaX}
                y1={y}
                x2={gridAreaX + gridAreaWidth}
                y2={y}
                stroke={config.gridLineColor}
                strokeWidth="0.5"
                opacity={config.gridLineOpacity}
                strokeDasharray="1,1"
              />,
            )
          }

          if (i < config.rows && spacingY > 0) {
            const gutterY = gridAreaY + i * (cellHeight + spacingY) + cellHeight
            if (gutterY + spacingY <= gridAreaY + gridAreaHeight) {
              lines.push(
                <rect
                  key={`gutter-h-${i}-${offsetY}`}
                  x={gridAreaX}
                  y={gutterY}
                  width={gridAreaWidth}
                  height={spacingY}
                  fill={config.gridLineColor}
                  opacity={config.gridLineOpacity * 0.2}
                />,
              )
            }
          }
        }
      } else {
        // Grid by physical size with gutters
        const cellWidth = config.gridCellWidth * scale
        const cellHeight = config.gridCellHeight * scale
        const gutterX = config.gridSpacingX * scale
        const gutterY = config.gridSpacingY * scale

        const totalCellAndGutterWidth = cellWidth + gutterX
        const totalCellAndGutterHeight = cellHeight + gutterY
        const columnsCount = Math.floor((gridAreaWidth + gutterX) / totalCellAndGutterWidth)
        const rowsCount = Math.floor((gridAreaHeight + gutterY) / totalCellAndGutterHeight)

        // Vertical lines (columns with gutters)
        for (let i = 0; i <= columnsCount; i++) {
          const x = gridAreaX + i * totalCellAndGutterWidth
          if (x <= gridAreaX + gridAreaWidth) {
            lines.push(
              <line
                key={`grid-v-${i}-${offsetX}`}
                x1={x}
                y1={gridAreaY}
                x2={x}
                y2={gridAreaY + gridAreaHeight}
                stroke={config.gridLineColor}
                strokeWidth="0.5"
                opacity={config.gridLineOpacity}
                strokeDasharray="1,1"
              />,
            )
          }

          if (i < columnsCount && gutterX > 0) {
            const gutterLineX = x + cellWidth
            if (gutterLineX <= gridAreaX + gridAreaWidth) {
              lines.push(
                <line
                  key={`grid-vg-${i}-${offsetX}`}
                  x1={gutterLineX}
                  y1={gridAreaY}
                  x2={gutterLineX}
                  y2={gridAreaY + gridAreaHeight}
                  stroke={config.gridLineColor}
                  strokeWidth="0.25"
                  opacity={config.gridLineOpacity * 0.5}
                  strokeDasharray="2,2"
                />,
              )
            }
          }
        }

        // Horizontal lines (rows with gutters)
        for (let i = 0; i <= rowsCount; i++) {
          const y = gridAreaY + i * totalCellAndGutterHeight
          if (y <= gridAreaY + gridAreaHeight) {
            lines.push(
              <line
                key={`grid-h-${i}-${offsetY}`}
                x1={gridAreaX}
                y1={y}
                x2={gridAreaX + gridAreaWidth}
                y2={y}
                stroke={config.gridLineColor}
                strokeWidth="0.5"
                opacity={config.gridLineOpacity}
                strokeDasharray="1,1"
              />,
            )
          }

          if (i < rowsCount && gutterY > 0) {
            const gutterLineY = y + cellHeight
            if (gutterLineY <= gridAreaY + gridAreaHeight) {
              lines.push(
                <line
                  key={`grid-hg-${i}-${offsetY}`}
                  x1={gridAreaX}
                  y1={gutterLineY}
                  x2={gridAreaX + gridAreaWidth}
                  y2={gutterLineY}
                  stroke={config.gridLineColor}
                  strokeWidth="0.25"
                  opacity={config.gridLineOpacity * 0.5}
                  strokeDasharray="2,2"
                />,
              )
            }
          }
        }
      }
    }

    // Rule of thirds guides
    if (config.showRuleOfThirds) {
      const thirdWidth = gridAreaWidth / 3
      const thirdHeight = gridAreaHeight / 3

      for (let i = 1; i < 3; i++) {
        const x = gridAreaX + i * thirdWidth
        lines.push(
          <line
            key={`thirds-v-${i}-${offsetX}`}
            x1={x}
            y1={gridAreaY}
            x2={x}
            y2={gridAreaY + gridAreaHeight}
            stroke="#ff00ff"
            strokeWidth="1"
            opacity="0.6"
            strokeDasharray="3,3"
          />,
        )
      }

      for (let i = 1; i < 3; i++) {
        const y = gridAreaY + i * thirdHeight
        lines.push(
          <line
            key={`thirds-h-${i}-${offsetY}`}
            x1={gridAreaX}
            y1={y}
            x2={gridAreaX + gridAreaWidth}
            y2={y}
            stroke="#ff00ff"
            strokeWidth="1"
            opacity="0.6"
            strokeDasharray="3,3"
          />,
        )
      }
    }

    // Golden ratio guides
    if (config.showGoldenRatio) {
      const goldenRatioX = gridAreaWidth * 0.618
      const goldenRatioY = gridAreaHeight * 0.618

      lines.push(
        <line
          key={`golden-v-${offsetX}`}
          x1={gridAreaX + goldenRatioX}
          y1={gridAreaY}
          x2={gridAreaX + goldenRatioX}
          y2={gridAreaY + gridAreaHeight}
          stroke="#ffaa00"
          strokeWidth="1"
          opacity="0.6"
          strokeDasharray="5,2"
        />,
      )

      lines.push(
        <line
          key={`golden-v2-${offsetX}`}
          x1={gridAreaX + gridAreaWidth - goldenRatioX}
          y1={gridAreaY}
          x2={gridAreaX + gridAreaWidth - goldenRatioX}
          y2={gridAreaY + gridAreaHeight}
          stroke="#ffaa00"
          strokeWidth="1"
          opacity="0.6"
          strokeDasharray="5,2"
        />,
      )

      lines.push(
        <line
          key={`golden-h-${offsetY}`}
          x1={gridAreaX}
          y1={gridAreaY + goldenRatioY}
          x2={gridAreaX + gridAreaWidth}
          y2={gridAreaY + goldenRatioY}
          stroke="#ffaa00"
          strokeWidth="1"
          opacity="0.6"
          strokeDasharray="5,2"
        />,
      )

      lines.push(
        <line
          key={`golden-h2-${offsetY}`}
          x1={gridAreaX}
          y1={gridAreaY + gridAreaHeight - goldenRatioY}
          x2={gridAreaX + gridAreaWidth}
          y2={gridAreaY + gridAreaHeight - goldenRatioY}
          stroke="#ffaa00"
          strokeWidth="1"
          opacity="0.6"
          strokeDasharray="5,2"
        />,
      )
    }

    // Custom guidelines
    guidelines.forEach((guideline) => {
      if (guideline.type === "vertical") {
        const x = offsetX + (width * guideline.position) / 100
        lines.push(
          <line
            key={`guideline-${guideline.id}`}
            x1={x}
            y1={offsetY}
            x2={x}
            y2={offsetY + height}
            stroke={guideline.color}
            strokeWidth="1"
            opacity="0.8"
            strokeDasharray="4,4"
            style={{ cursor: guideline.locked ? "not-allowed" : "pointer" }}
            onDoubleClick={() => !guideline.locked && handleGuidelineDoubleClick(guideline.id)}
          />,
        )
      } else {
        const y = offsetY + (height * guideline.position) / 100
        lines.push(
          <line
            key={`guideline-${guideline.id}`}
            x1={offsetX}
            y1={y}
            x2={offsetX + width}
            y2={y}
            stroke={guideline.color}
            strokeWidth="1"
            opacity="0.8"
            strokeDasharray="4,4"
            style={{ cursor: guideline.locked ? "not-allowed" : "pointer" }}
            onDoubleClick={() => !guideline.locked && handleGuidelineDoubleClick(guideline.id)}
          />,
        )
      }
    })

    return lines
  }

  // Generate spread layouts with pages starting from 1
  const generateSpreadLayouts = (): SpreadLayout[] => {
    const spreads: SpreadLayout[] = []
    const totalPages = config.pageCount || 6
    const totalElements = layout?.elements?.length || 0

    const spineWidth = bindingSpecs.spineCalculation(totalPages, config.gsm)

    if (facingPages) {
      let elementIndex = 0

      // Cover spread
      const coverElements = layout?.elements?.slice(0, 3) || []
      spreads.push({
        spreadNumber: 1,
        pages: [0],
        type: "cover",
        elements: coverElements,
        spineWidth,
      })
      elementIndex += 3

      // Right page only (page 1)
      const elementsPerPage = Math.floor((totalElements - 3) / Math.max(totalPages - 1, 1))
      const rightPageElements = layout?.elements?.slice(elementIndex, elementIndex + elementsPerPage) || []
      spreads.push({
        spreadNumber: 2,
        pages: [1],
        type: "right-only",
        elements: rightPageElements,
      })
      elementIndex += elementsPerPage

      // Middle spreads - facing pages
      const remainingPages = Math.max(totalPages - 2, 0)
      const middleSpreads = Math.floor(remainingPages / 2)

      for (let i = 0; i < middleSpreads; i++) {
        const leftPage = 2 + i * 2
        const rightPage = leftPage + 1
        const spreadElements = layout?.elements?.slice(elementIndex, elementIndex + elementsPerPage) || []

        spreads.push({
          spreadNumber: 3 + i,
          pages: [leftPage, rightPage],
          type: "facing",
          elements: spreadElements,
        })
        elementIndex += elementsPerPage
      }

      // Last spread - left page only (if odd number of remaining pages)
      if (remainingPages % 2 === 1) {
        const lastPageNumber = totalPages - 1
        const lastPageElements = layout?.elements?.slice(elementIndex) || []
        spreads.push({
          spreadNumber: spreads.length + 1,
          pages: [lastPageNumber],
          type: "left-only",
          elements: lastPageElements,
        })
      }
    } else {
      // Single page mode
      const elementsPerPage = Math.floor(totalElements / totalPages)
      for (let i = 0; i < totalPages; i++) {
        const pageNumber = i + 1
        const startIndex = i * elementsPerPage
        const endIndex = Math.min(startIndex + elementsPerPage, totalElements)
        const pageElements = layout?.elements?.slice(startIndex, endIndex) || []

        spreads.push({
          spreadNumber: i + 1,
          pages: [pageNumber],
          type: "single",
          elements: pageElements,
        })
      }
    }

    return spreads
  }

  const spreadLayouts = generateSpreadLayouts()

  // Handle spread selection
  const handleSpreadClick = (spreadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSpreadId(spreadId)
    setSelectedElementId("")
  }

  // Handle workspace click (deselect all)
  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId("")
      setSelectedSpreadId("")
    }
  }

  // Handle adding elements to a specific spread with margin constraints
  const handleAddElementToSpread = useCallback(
    (spreadLayout: SpreadLayout, elementType: "text" | "image") => {
      const targetPage = spreadLayout.pages[0] || 1
      const marginBounds = getMarginBounds(spreadLayout, 0)

      // Find next available position within margins
      const position = findNextAvailablePosition(
        layout?.elements || [],
        targetPage,
        config.columns,
        config.rows,
        elementType === "text" ? 3 : 2,
        elementType === "text" ? 2 : 2,
      )

      // Create new element with proper margin alignment
      const newElement: LayoutElement =
        elementType === "text"
          ? createTextElement(config, targetPage, position.gridX, position.gridY, 3, 2, "body")
          : createImageElement(config, targetPage, position.gridX, position.gridY, 2, 2)

      // Add element through parent callback
      onAddElement(newElement)

      // Select the new element immediately
      setSelectedElementId(newElement.id)
      setSelectedSpreadId("")
    },
    [config, getMarginBounds, layout?.elements, onAddElement],
  )

  // Handle canvas click to create elements at specific positions
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent, spreadLayout: SpreadLayout) => {
      if (tool !== "select") return

      const rect = e.currentTarget.getBoundingClientRect()
      if (!rect) return

      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Convert click position to page coordinates with validation
      const pageX = clickX / zoom / 2.5 || 0
      const pageY = clickY / zoom / 2.5 || 0

      const marginBounds = getMarginBounds(spreadLayout, 0)

      // Check if click is within margin bounds
      if (
        pageX >= marginBounds.left &&
        pageX <= marginBounds.right &&
        pageY >= marginBounds.top &&
        pageY <= marginBounds.bottom
      ) {
        // Create default text element at click position
        const elementWidth = Math.max(50, (marginBounds.width / (config.columns || 4)) * 2)
        const elementHeight = Math.max(30, (marginBounds.height / (config.rows || 6)) * 1.5)

        const newElement: LayoutElement = createTextElement(config, spreadLayout.pages[0] || 1, 0, 0, 2, 1, "body")

        // Override position to click location with validation
        newElement.x = Math.max(
          marginBounds.left,
          Math.min(marginBounds.right - elementWidth, pageX - elementWidth / 2),
        )
        newElement.y = Math.max(
          marginBounds.top,
          Math.min(marginBounds.bottom - elementHeight, pageY - elementHeight / 2),
        )
        newElement.width = elementWidth
        newElement.height = elementHeight
        newElement.content = "New text element"

        onAddElement(newElement)
        setSelectedElementId(newElement.id)
      }
    },
    [tool, zoom, config, onAddElement, getMarginBounds],
  )

  // Handle keyboard shortcuts for element creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom controls
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          handleZoomOut()
        }
      }

      if (!selectedSpreadId) return

      const selectedSpread = spreadLayouts.find((s) => `spread-${s.spreadNumber}` === selectedSpreadId)
      if (!selectedSpread) return

      if (e.key === "t" || e.key === "T") {
        e.preventDefault()
        handleAddElementToSpread(selectedSpread, "text")
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault()
        handleAddElementToSpread(selectedSpread, "image")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedSpreadId, spreadLayouts, handleZoomIn, handleZoomOut, handleAddElementToSpread])

  const renderCoverSpread = (spreadLayout: SpreadLayout) => {
    const { elements, spineWidth = 3 } = spreadLayout
    const baseWidth = pageWidth * 2.5
    const baseHeight = pageHeight * 2.5
    const pasteboardMargin = 60 * zoom
    const spreadId = `spread-${spreadLayout.spreadNumber}`
    const isSelected = selectedSpreadId === spreadId

    const pageWidthPx = baseWidth * zoom
    const pageHeightPx = baseHeight * zoom
    const spineWidthPx = spineWidth * 2.5 * zoom

    const coverOverhang = bindingSpecs.coverOverhang * 2.5 * zoom
    const foldAllowance = bindingSpecs.foldAllowance * 2.5 * zoom
    const safetyMargin = bindingSpecs.safetyMargin * 2.5 * zoom

    const adjustedPageWidth = pageWidthPx + coverOverhang
    const adjustedPageHeight = pageHeightPx + coverOverhang * 2
    const coverWidth = adjustedPageWidth * 2 + spineWidthPx + foldAllowance * 2
    const totalWidth = coverWidth + pasteboardMargin * 2
    const totalHeight = adjustedPageHeight + pasteboardMargin * 2

    const coverBleed = Math.max(bindingSpecs.bleedRequirement, config.coverBleed || config.bleed) * 2.5 * zoom
    const coverMarginTop = (config.coverMarginTop || config.marginTop) * 2.5 * zoom + safetyMargin
    const coverMarginBottom = (config.coverMarginBottom || config.marginBottom) * 2.5 * zoom + safetyMargin
    const coverMarginOuter = (config.coverMarginOuter || config.marginOuter) * 2.5 * zoom + safetyMargin
    const coverMarginInner = Math.max(
      (config.coverMarginInner || config.marginInner) * 2.5 * zoom,
      bindingSpecs.spineMargin * 2.5 * zoom,
    )

    const backCoverElement = elements[0]
    const spineElement = elements[1]
    const frontCoverElement = elements[2]

    return (
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-4 text-sm text-gray-300 font-medium">
          Cover Spread ({config.bindingType.replace("-", " ").toUpperCase()})
        </div>

        <div
          className={`relative bg-gray-500 cursor-pointer transition-all duration-200 ${
            isSelected ? "ring-4 ring-blue-400 ring-opacity-50" : "hover:ring-2 ring-blue-300 ring-opacity-30"
          }`}
          style={{
            width: totalWidth,
            height: totalHeight,
          }}
          onClick={(e) => handleSpreadClick(spreadId, e)}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div
            className="absolute bg-white shadow-xl"
            style={{
              left: pasteboardMargin,
              top: pasteboardMargin,
              width: coverWidth,
              height: adjustedPageHeight,
            }}
          >
            <div
              className="absolute border-2 border-cyan-400"
              style={{
                left: -coverBleed,
                top: -coverBleed,
                width: coverWidth + coverBleed * 2,
                height: adjustedPageHeight + coverBleed * 2,
                zIndex: 5,
                backgroundColor: "transparent",
                borderStyle: "dashed",
              }}
            />

            {config.bindingType === "spiral-bound" && (
              <div
                className="absolute border border-red-400 bg-red-50/20"
                style={{
                  left: adjustedPageWidth + foldAllowance,
                  top: 0,
                  width: spineWidthPx,
                  height: adjustedPageHeight,
                  zIndex: 6,
                }}
              />
            )}

            {config.bindingType === "saddle-stitched" && (
              <div
                className="absolute border-2 border-orange-400"
                style={{
                  left: adjustedPageWidth + foldAllowance + spineWidthPx / 2 - 1,
                  top: adjustedPageHeight * 0.3,
                  width: 2,
                  height: adjustedPageHeight * 0.4,
                  zIndex: 6,
                  backgroundColor: "orange",
                  opacity: 0.6,
                }}
              />
            )}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              <rect
                x={foldAllowance}
                y="0"
                width={adjustedPageWidth}
                height={adjustedPageHeight}
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                opacity="0.8"
              />

              <rect
                x={adjustedPageWidth + foldAllowance}
                y="0"
                width={spineWidthPx}
                height={adjustedPageHeight}
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                opacity="0.8"
              />

              <rect
                x={adjustedPageWidth + spineWidthPx + foldAllowance}
                y="0"
                width={adjustedPageWidth}
                height={adjustedPageHeight}
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                opacity="0.8"
              />

              <rect
                x={foldAllowance + coverMarginOuter}
                y={coverMarginTop}
                width={adjustedPageWidth - (coverMarginOuter + coverMarginInner)}
                height={adjustedPageHeight - (coverMarginTop + coverMarginBottom)}
                fill="none"
                stroke="#ff00ff"
                strokeWidth="0.5"
                strokeDasharray="3,3"
                opacity="0.7"
              />

              <rect
                x={adjustedPageWidth + spineWidthPx + foldAllowance + coverMarginInner}
                y={coverMarginTop}
                width={adjustedPageWidth - (coverMarginInner + coverMarginOuter)}
                height={adjustedPageHeight - (coverMarginTop + coverMarginBottom)}
                fill="none"
                stroke="#ff00ff"
                strokeWidth="0.5"
                strokeDasharray="3,3"
                opacity="0.7"
              />

              <rect
                x={adjustedPageWidth + foldAllowance + bindingSpecs.spineMargin * 2.5 * zoom}
                y={coverMarginTop}
                width={spineWidthPx - bindingSpecs.spineMargin * 2 * 2.5 * zoom}
                height={adjustedPageHeight - (coverMarginTop + coverMarginBottom)}
                fill="none"
                stroke="#ff00ff"
                strokeWidth="0.5"
                strokeDasharray="3,3"
                opacity="0.7"
              />

              {generateGridAndGuidelines(adjustedPageWidth, adjustedPageHeight, foldAllowance, 0, true, false)}
              {generateGridAndGuidelines(
                adjustedPageWidth,
                adjustedPageHeight,
                adjustedPageWidth + spineWidthPx + foldAllowance,
                0,
                false,
                true,
              )}
            </svg>

            <div className="relative w-full h-full">
              {elements.map((element) => (
                <InteractiveElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  onSelect={setSelectedElementId}
                  onUpdate={onUpdateElement}
                  onDelete={onDeleteElement}
                  zoom={zoom * 2.5}
                  config={config}
                />
              ))}

              {isSelected && (
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddElementToSpread(spreadLayout, "text")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddElementToSpread(spreadLayout, "image")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                </div>
              )}

              <div className="absolute top-2 left-4 text-xs text-gray-400 font-medium pointer-events-none">
                Back Cover
                {bindingSpecs.coverOverhang > 0 && (
                  <div className="text-xs text-blue-400">+{bindingSpecs.coverOverhang}mm overhang</div>
                )}
              </div>
              <div
                className="absolute top-2 text-xs text-gray-400 font-medium pointer-events-none"
                style={{ left: adjustedPageWidth + foldAllowance + spineWidthPx / 2, transform: "translateX(-50%)" }}
              >
                Spine ({spineWidth.toFixed(1)}mm)
                <div className="text-xs text-blue-400">{config.bindingType}</div>
              </div>
              <div
                className="absolute top-2 right-4 text-xs text-gray-400 font-medium pointer-events-none"
                style={{ right: 16 }}
              >
                Front Cover
                {bindingSpecs.coverOverhang > 0 && (
                  <div className="text-xs text-blue-400">+{bindingSpecs.coverOverhang}mm overhang</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400 text-center">
          Cover Spread • {elements.length} elements • Spine: {spineWidth.toFixed(1)}mm • Bleed:{" "}
          {Math.max(bindingSpecs.bleedRequirement, config.coverBleed || config.bleed)}mm
          {isSelected && <span className="text-blue-400 font-medium"> • SELECTED</span>}
        </div>
      </div>
    )
  }

  const renderRegularSpread = (spreadLayout: SpreadLayout) => {
    const { spreadNumber, pages, type, elements } = spreadLayout
    const baseWidth = pageWidth * 2.5
    const baseHeight = pageHeight * 2.5
    const pasteboardMargin = 50 * zoom
    const bindingGutter = config.bindingGutter * 2.5 * zoom
    const spreadId = `spread-${spreadNumber}`
    const isSelected = selectedSpreadId === spreadId

    const pageWidthPx = baseWidth * zoom
    const pageHeightPx = baseHeight * zoom

    let spreadWidth: number
    let leftOffset = 0
    const isRightOnly = type === "right-only"
    const isLeftOnly = type === "left-only"
    const isFacing = type === "facing"

    if (isRightOnly) {
      spreadWidth = pageWidthPx
      leftOffset = 0
    } else if (isLeftOnly) {
      spreadWidth = pageWidthPx
      leftOffset = 0
    } else if (isFacing) {
      spreadWidth = pageWidthPx * 2 + bindingGutter
      leftOffset = 0
    } else {
      spreadWidth = pageWidthPx
      leftOffset = 0
    }

    const totalWidth = spreadWidth + pasteboardMargin * 2
    const totalHeight = pageHeightPx + pasteboardMargin * 2

    const bleedSize = config.bleed * 2.5 * zoom

    return (
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-4 text-sm text-gray-300 font-medium">
          {type === "right-only"
            ? `Page ${pages[0]} (Right Only)`
            : type === "left-only"
              ? `Page ${pages[0]} (Left Only)`
              : `Pages ${pages.join("-")} (Spread)`}
        </div>

        <div
          className={`relative bg-gray-500 cursor-pointer transition-all duration-200 ${
            isSelected ? "ring-4 ring-blue-400 ring-opacity-50" : "hover:ring-2 ring-blue-300 ring-opacity-30"
          }`}
          style={{
            width: totalWidth,
            height: totalHeight,
          }}
          onClick={(e) => {
            handleSpreadClick(spreadId, e)
            if (isSelected && tool === "select") {
              handleCanvasClick(e, spreadLayout)
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (tool === "select") {
              handleCanvasClick(e, spreadLayout)
            }
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div
            className="absolute bg-white shadow-xl"
            style={{
              left: pasteboardMargin + leftOffset,
              top: pasteboardMargin,
              width: spreadWidth,
              height: pageHeightPx,
            }}
          >
            <div
              className="absolute border-2 border-cyan-400"
              style={{
                left: -bleedSize,
                top: -bleedSize,
                width: spreadWidth + bleedSize * 2,
                height: pageHeightPx + bleedSize * 2,
                zIndex: 5,
                backgroundColor: "transparent",
                borderStyle: "dashed",
              }}
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              <rect
                x="0"
                y="0"
                width={spreadWidth}
                height={pageHeightPx}
                fill="none"
                stroke="#000000"
                strokeWidth="1"
                opacity="0.8"
              />

              {isFacing ? (
                <>
                  <rect
                    x={config.marginOuter * 2.5 * zoom}
                    y={config.marginTop * 2.5 * zoom}
                    width={pageWidthPx - (config.marginOuter + config.marginInner) * 2.5 * zoom}
                    height={pageHeightPx - (config.marginTop + config.marginBottom) * 2.5 * zoom}
                    fill="none"
                    stroke="#ff00ff"
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                    opacity="0.7"
                  />
                  <rect
                    x={pageWidthPx + bindingGutter + config.marginInner * 2.5 * zoom}
                    y={config.marginTop * 2.5 * zoom}
                    width={pageWidthPx - (config.marginInner + config.marginOuter) * 2.5 * zoom}
                    height={pageHeightPx - (config.marginTop + config.marginBottom) * 2.5 * zoom}
                    fill="none"
                    stroke="#ff00ff"
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                    opacity="0.7"
                  />
                  <line
                    x1={pageWidthPx + bindingGutter / 2}
                    y1="0"
                    x2={pageWidthPx + bindingGutter / 2}
                    y2={pageHeightPx}
                    stroke="#ff00ff"
                    strokeWidth="1"
                    opacity="0.8"
                  />
                </>
              ) : (
                <rect
                  x={
                    isRightOnly
                      ? (config.marginInner || 15) * 2.5 * zoom
                      : isLeftOnly
                        ? (config.marginOuter || 25) * 2.5 * zoom
                        : (config.marginLeft || 20) * 2.5 * zoom
                  }
                  y={(config.marginTop || 20) * 2.5 * zoom}
                  width={Math.max(
                    0,
                    pageWidthPx -
                      (isRightOnly
                        ? ((config.marginInner || 15) + (config.marginOuter || 25)) * 2.5 * zoom
                        : isLeftOnly
                          ? ((config.marginOuter || 25) + (config.marginInner || 15)) * 2.5 * zoom
                          : ((config.marginLeft || 20) + (config.marginRight || 20)) * 2.5 * zoom),
                  )}
                  height={Math.max(
                    0,
                    pageHeightPx - ((config.marginTop || 20) + (config.marginBottom || 20)) * 2.5 * zoom,
                  )}
                  fill="none"
                  stroke="#ff00ff"
                  strokeWidth="0.5"
                  strokeDasharray="3,3"
                  opacity="0.7"
                />
              )}

              {isFacing ? (
                <>
                  {generateGridAndGuidelines(pageWidthPx, pageHeightPx, 0, 0, true, false)}
                  {generateGridAndGuidelines(pageWidthPx, pageHeightPx, pageWidthPx + bindingGutter, 0, false, true)}
                </>
              ) : (
                generateGridAndGuidelines(spreadWidth, pageHeightPx, 0, 0, isLeftOnly, isRightOnly)
              )}
              {isSelected && (
                <>
                  <rect
                    x={
                      isRightOnly
                        ? config.marginInner * 2.5 * zoom
                        : isLeftOnly
                          ? config.marginOuter * 2.5 * zoom
                          : config.marginLeft * 2.5 * zoom
                    }
                    y={config.marginTop * 2.5 * zoom}
                    width={
                      pageWidthPx -
                      (isRightOnly
                        ? (config.marginInner + config.marginOuter) * 2.5 * zoom
                        : isLeftOnly
                          ? (config.marginOuter + config.marginInner) * 2.5 * zoom
                          : (config.marginLeft + config.marginRight) * 2.5 * zoom)
                    }
                    height={pageHeightPx - (config.marginTop + config.marginBottom) * 2.5 * zoom}
                    fill="rgba(59, 130, 246, 0.1)"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.8"
                  />
                  <text
                    x={pageWidthPx / 2}
                    y={config.marginTop * 2.5 * zoom - 5}
                    fontSize="10"
                    fill="#3b82f6"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    Content Area - Press T for Text, I for Image
                  </text>
                </>
              )}
            </svg>

            <div className="relative w-full h-full">
              {elements.map((element) => (
                <InteractiveElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  onSelect={setSelectedElementId}
                  onUpdate={onUpdateElement}
                  onDelete={onDeleteElement}
                  zoom={zoom * 2.5}
                  config={config}
                />
              ))}

              {isSelected && (
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddElementToSpread(spreadLayout, "text")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddElementToSpread(spreadLayout, "image")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                </div>
              )}

              {isFacing && (
                <>
                  <div className="absolute top-2 left-4 text-xs text-gray-400 font-medium pointer-events-none">
                    Page {pages[0]}
                  </div>
                  <div className="absolute top-2 right-4 text-xs text-gray-400 font-medium pointer-events-none">
                    Page {pages[1]}
                  </div>
                </>
              )}
              {isRightOnly && (
                <div className="absolute top-2 right-4 text-xs text-gray-400 font-medium pointer-events-none">
                  Page {pages[0]} (Right)
                </div>
              )}
              {isLeftOnly && (
                <div className="absolute top-2 left-4 text-xs text-gray-400 font-medium pointer-events-none">
                  Page {pages[0]} (Left)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400 text-center">
          {elements.length} elements • {type.replace("-", " ")}
          {isSelected && <span className="text-blue-400 font-medium"> • SELECTED</span>}
        </div>
      </div>
    )
  }

  const renderSpread = (spreadLayout: SpreadLayout, index: number) => {
    if (spreadLayout.type === "cover") {
      return renderCoverSpread(spreadLayout)
    } else {
      return renderRegularSpread(spreadLayout)
    }
  }

  return (
    <div className="flex-1 bg-gray-600 relative overflow-hidden">
      {/* Horizontal Ruler - Fixed at top */}
      <div
        className="absolute top-0 left-6 right-0 h-6 bg-white border-b border-gray-300 z-20 cursor-crosshair"
        style={{ left: rulerSize }}
        onMouseDown={(e) => handleRulerMouseDown(e, "vertical")}
        title="Drag to create vertical guideline"
      >
        <svg width="100%" height="100%">
          {generateRulerMarks(windowSize.width - rulerSize, false, scrollPosition.x)}
        </svg>
      </div>

      {/* Vertical Ruler - Fixed at left */}
      <div
        className="absolute left-0 top-6 bottom-0 w-6 bg-white border-r border-gray-300 z-20 cursor-crosshair"
        style={{ top: rulerSize }}
        onMouseDown={(e) => handleRulerMouseDown(e, "horizontal")}
        title="Drag to create horizontal guideline"
      >
        <svg width="100%" height="100%">
          {generateRulerMarks(windowSize.height - rulerSize, true, scrollPosition.y)}
        </svg>
      </div>

      {/* Ruler Corner */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-gray-200 border-r border-b border-gray-300 z-30" />

      {/* Preview guideline while dragging */}
      <div
        id="preview-guideline"
        className="absolute pointer-events-none z-25"
        style={{
          display: "none",
          width: isDraggingFromRuler?.type === "vertical" ? "1px" : "100%",
          height: isDraggingFromRuler?.type === "horizontal" ? "1px" : "100%",
          backgroundColor: config.gridLineColor || "#ff00ff",
          opacity: 0.8,
        }}
      />

      {/* Main Workspace - Scrollable area with spreads */}
      <div
        ref={workspaceRef}
        className="absolute inset-0 overflow-auto"
        style={{
          paddingTop: rulerSize,
          paddingLeft: rulerSize,
          cursor: tool === "pan" ? "grab" : isDraggingFromRuler?.active ? "crosshair" : "default",
        }}
        onClick={handleWorkspaceClick}
      >
        <div className="min-w-full p-8">
          <div className="flex flex-col items-center space-y-12 py-8">
            {isGenerating ? (
              <div className="text-center text-white py-16">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Generating Layout...</h3>
                <p className="text-gray-300">Creating your professional layout</p>
              </div>
            ) : spreadLayouts.length > 0 ? (
              spreadLayouts.map((spreadLayout, index) => renderSpread(spreadLayout, index))
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

      {/* Tool Controls - Fixed position */}
      <div className="absolute top-8 left-8 flex flex-col gap-3 z-40">
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

      {/* View Controls - Fixed position */}
      <div className="absolute top-8 right-8 flex flex-col gap-3 z-40">
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

        {/* Page View Toggle */}
        <div className="bg-black/90 text-white p-3 rounded-xl flex gap-2 shadow-lg">
          <Button
            variant={facingPages ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFacingPages(true)}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Facing Pages"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button
            variant={!facingPages ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFacingPages(false)}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Status Bar - Fixed at bottom */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm">
        {spreadLayouts.length} {facingPages ? "Spreads" : "Pages"} • {elementCount} Elements Total • {guidelines.length}{" "}
        Guidelines • {config.bindingType.replace("-", " ").toUpperCase()} • Zoom: Ctrl+/Ctrl-
        {selectedSpreadId && <span className="text-blue-400 font-medium"> • Spread Selected</span>}
        {selectedElementId && <span className="text-green-400 font-medium"> • Element Selected</span>}
      </div>

      {/* Page Size Badge - Fixed at bottom right */}
      <div className="absolute bottom-6 right-6">
        <Badge variant="secondary" className="bg-black/90 text-white border-white/20">
          {pageWidth}×{pageHeight}mm
        </Badge>
      </div>
    </div>
  )
}
