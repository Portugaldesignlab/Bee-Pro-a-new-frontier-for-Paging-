"use client"

import type React from "react"

import { useState } from "react"

interface RulersAndGuidelinesProps {
  width: number
  height: number
  zoom: number
  showRulers: boolean
  guidelines: { x: number[]; y: number[] }
  onGuidelineAdd: (type: "x" | "y", position: number) => void
  onGuidelineRemove: (type: "x" | "y", index: number) => void
}

export function RulersAndGuidelines({
  width,
  height,
  zoom,
  showRulers,
  guidelines,
  onGuidelineAdd,
  onGuidelineRemove,
}: RulersAndGuidelinesProps) {
  const [isDraggingGuideline, setIsDraggingGuideline] = useState<{
    type: "x" | "y"
    index: number
  } | null>(null)

  const rulerSize = 24

  if (!showRulers) return null

  // Generate ruler marks
  const generateRulerMarks = (length: number, isVertical: boolean) => {
    const marks = []
    const pixelsPerMM = zoom * 3.78 // Approximate pixels per mm at current zoom
    const mmLength = length / pixelsPerMM

    for (let mm = 0; mm <= mmLength; mm += 1) {
      const position = mm * pixelsPerMM
      const isMajor = mm % 10 === 0
      const isMinor = mm % 5 === 0

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
          {isMajor && (
            <text
              x={isVertical ? rulerSize - 10 : position}
              y={isVertical ? position - 2 : rulerSize - 10}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
              transform={isVertical ? `rotate(-90, ${rulerSize - 10}, ${position - 2})` : ""}
            >
              {mm}
            </text>
          )}
        </g>,
      )
    }

    return marks
  }

  const handleRulerClick = (e: React.MouseEvent, type: "x" | "y") => {
    const rect = e.currentTarget.getBoundingClientRect()
    const position =
      type === "x"
        ? ((e.clientX - rect.left - rulerSize) / (rect.width - rulerSize)) * 100
        : ((e.clientY - rect.top - rulerSize) / (rect.height - rulerSize)) * 100

    if (position >= 0 && position <= 100) {
      onGuidelineAdd(type, position)
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Horizontal Ruler */}
      <svg
        className="absolute top-0 left-0 pointer-events-auto cursor-crosshair"
        width={width + rulerSize}
        height={rulerSize}
        onClick={(e) => handleRulerClick(e, "x")}
      >
        <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <g transform={`translate(${rulerSize}, 0)`}>{generateRulerMarks(width, false)}</g>

        {/* Corner */}
        <rect x="0" y="0" width={rulerSize} height={rulerSize} fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
      </svg>

      {/* Vertical Ruler */}
      <svg
        className="absolute top-0 left-0 pointer-events-auto cursor-crosshair"
        width={rulerSize}
        height={height + rulerSize}
        onClick={(e) => handleRulerClick(e, "y")}
      >
        <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <g transform={`translate(0, ${rulerSize})`}>{generateRulerMarks(height, true)}</g>
      </svg>

      {/* Guidelines */}
      <div className="absolute pointer-events-none" style={{ top: rulerSize, left: rulerSize }}>
        {/* Vertical Guidelines */}
        {guidelines.x.map((x, index) => (
          <div
            key={`x-${index}`}
            className="absolute top-0 w-px bg-cyan-400 pointer-events-auto cursor-ew-resize hover:bg-cyan-500"
            style={{
              left: `${x}%`,
              height: height,
              boxShadow: "0 0 0 0.5px rgba(6, 182, 212, 0.3)",
            }}
            onDoubleClick={() => onGuidelineRemove("x", index)}
            title="Double-click to remove guideline"
          />
        ))}

        {/* Horizontal Guidelines */}
        {guidelines.y.map((y, index) => (
          <div
            key={`y-${index}`}
            className="absolute left-0 h-px bg-cyan-400 pointer-events-auto cursor-ns-resize hover:bg-cyan-500"
            style={{
              top: `${y}%`,
              width: width,
              boxShadow: "0 0 0 0.5px rgba(6, 182, 212, 0.3)",
            }}
            onDoubleClick={() => onGuidelineRemove("y", index)}
            title="Double-click to remove guideline"
          />
        ))}
      </div>
    </div>
  )
}
