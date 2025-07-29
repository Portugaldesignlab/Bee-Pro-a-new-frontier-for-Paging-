"use client"

import React from "react"
import { useState, useRef } from "react"

interface ProfessionalRulersProps {
  width: number
  height: number
  zoom: number
  guidelines: { x: number[]; y: number[] }
  guidelineSettings: {
    color: string
    opacity: number
    locked: boolean
    visible: boolean
    snapDistance: number
  }
  onGuidelineAdd: (type: "x" | "y", position: number) => void
  onGuidelineRemove: (type: "x" | "y", index: number) => void
  onGuidelineMove: (type: "x" | "y", index: number, position: number) => void
  children: React.ReactNode
}

export function ProfessionalRulers({
  width,
  height,
  zoom,
  guidelines,
  guidelineSettings,
  onGuidelineAdd,
  onGuidelineRemove,
  onGuidelineMove,
  children,
}: ProfessionalRulersProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    type: "x" | "y"
    index: number
    startPos: number
  } | null>(null)

  const rulerSize = 24
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleRulerMouseDown = (e: React.MouseEvent, type: "x" | "y") => {
    if (guidelineSettings.locked) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const position =
      type === "x"
        ? ((e.clientX - rect.left - rulerSize) / width) * 100
        : ((e.clientY - rect.top - rulerSize) / height) * 100

    if (position >= 0 && position <= 100) {
      onGuidelineAdd(type, position)
    }
  }

  const handleGuidelineMouseDown = (e: React.MouseEvent, type: "x" | "y", index: number) => {
    if (guidelineSettings.locked) return

    e.stopPropagation()
    setDragState({
      isDragging: true,
      type,
      index,
      startPos: type === "x" ? e.clientX : e.clientY,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentPos = dragState.type === "x" ? e.clientX : e.clientY
    const containerSize = dragState.type === "x" ? width : height
    const containerStart = dragState.type === "x" ? rect.left + rulerSize : rect.top + rulerSize

    const position = ((currentPos - containerStart) / containerSize) * 100
    const clampedPosition = Math.max(0, Math.min(100, position))

    onGuidelineMove(dragState.type, dragState.index, clampedPosition)
  }

  const handleMouseUp = () => {
    setDragState(null)
  }

  // Add event listeners for dragging
  React.useEffect(() => {
    if (dragState) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragState])

  return (
    <div ref={containerRef} className="relative" style={{ width: width + rulerSize, height: height + rulerSize }}>
      {/* Horizontal Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-b border-gray-300 cursor-crosshair"
        style={{ width: width + rulerSize, height: rulerSize }}
        onMouseDown={(e) => handleRulerMouseDown(e, "x")}
      >
        <svg width="100%" height="100%">
          {/* Corner */}
          <rect x="0" y="0" width={rulerSize} height={rulerSize} fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />

          {/* Ruler marks */}
          <g transform={`translate(${rulerSize}, 0)`}>{generateRulerMarks(width, false)}</g>
        </svg>
      </div>

      {/* Vertical Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-r border-gray-300 cursor-crosshair"
        style={{ width: rulerSize, height: height + rulerSize }}
        onMouseDown={(e) => handleRulerMouseDown(e, "y")}
      >
        <svg width="100%" height="100%">
          <g transform={`translate(0, ${rulerSize})`}>{generateRulerMarks(height, true)}</g>
        </svg>
      </div>

      {/* Guidelines */}
      {guidelineSettings.visible && (
        <div className="absolute pointer-events-none" style={{ top: rulerSize, left: rulerSize }}>
          {/* Vertical Guidelines */}
          {guidelines.x.map((x, index) => (
            <div
              key={`x-${index}`}
              className={`absolute top-0 w-px pointer-events-auto ${
                guidelineSettings.locked ? "cursor-not-allowed" : "cursor-ew-resize hover:w-0.5"
              }`}
              style={{
                left: `${x}%`,
                height: height,
                backgroundColor: guidelineSettings.color,
                opacity: guidelineSettings.opacity,
                boxShadow: `0 0 0 0.5px ${guidelineSettings.color}30`,
              }}
              onMouseDown={(e) => handleGuidelineMouseDown(e, "x", index)}
              onDoubleClick={() => !guidelineSettings.locked && onGuidelineRemove("x", index)}
              title={guidelineSettings.locked ? "Guidelines are locked" : "Drag to move, double-click to remove"}
            />
          ))}

          {/* Horizontal Guidelines */}
          {guidelines.y.map((y, index) => (
            <div
              key={`y-${index}`}
              className={`absolute left-0 h-px pointer-events-auto ${
                guidelineSettings.locked ? "cursor-not-allowed" : "cursor-ns-resize hover:h-0.5"
              }`}
              style={{
                top: `${y}%`,
                width: width,
                backgroundColor: guidelineSettings.color,
                opacity: guidelineSettings.opacity,
                boxShadow: `0 0 0 0.5px ${guidelineSettings.color}30`,
              }}
              onMouseDown={(e) => handleGuidelineMouseDown(e, "y", index)}
              onDoubleClick={() => !guidelineSettings.locked && onGuidelineRemove("y", index)}
              title={guidelineSettings.locked ? "Guidelines are locked" : "Drag to move, double-click to remove"}
            />
          ))}
        </div>
      )}

      {/* Document Content */}
      <div
        className="absolute"
        style={{
          left: rulerSize,
          top: rulerSize,
          width: width,
          height: height,
        }}
      >
        {children}
      </div>
    </div>
  )
}
