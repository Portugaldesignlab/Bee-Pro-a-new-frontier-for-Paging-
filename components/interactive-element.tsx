"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react"
import type { LayoutElement, LayoutConfig } from "@/types/layout"

interface InteractiveElementProps {
  element: LayoutElement
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<LayoutElement>) => void
  onDelete: (id: string) => void
  zoom: number
  config: LayoutConfig
}

interface DragState {
  isDragging: boolean
  isResizing: boolean
  isRotating: boolean
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startRotation: number
  resizeHandle: string
  initialElementX: number
  initialElementY: number
}

export function InteractiveElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  zoom,
  config,
}: InteractiveElementProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
    resizeHandle: "",
    initialElementX: 0,
    initialElementY: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(element.content || "")
  const [localPosition, setLocalPosition] = useState({ x: element.x || 0, y: element.y || 0 })
  const [localSize, setLocalSize] = useState({ width: element.width || 50, height: element.height || 30 })
  const [localRotation, setLocalRotation] = useState(element.rotation || 0)

  const elementRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)

  const handleSize = 8
  const rotationHandleDistance = 20
  const updateThrottle = 16 // ~60fps

  // Sync local state with props when not dragging
  useEffect(() => {
    if (!dragState.isDragging && !dragState.isResizing && !dragState.isRotating) {
      setLocalPosition({ x: element.x || 0, y: element.y || 0 })
      setLocalSize({ width: element.width || 50, height: element.height || 30 })
      setLocalRotation(element.rotation || 0)
    }
  }, [element.x, element.y, element.width, element.height, element.rotation, dragState])

  // Throttled update function
  const throttledUpdate = useCallback(
    (updates: Partial<LayoutElement>) => {
      const now = Date.now()
      if (now - lastUpdateRef.current >= updateThrottle) {
        onUpdate(element.id, updates)
        lastUpdateRef.current = now
      }
    },
    [element.id, onUpdate],
  )

  // Handle element selection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!element.locked) {
        onSelect(element.id)
      }
    },
    [element.id, element.locked, onSelect],
  )

  // Handle double-click for text editing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (element.type === "text" && !element.locked) {
        setIsEditing(true)
        setEditContent(element.content || "")
      }
    },
    [element.type, element.locked, element.content],
  )

  // Handle text editing
  const handleTextEdit = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  const handleTextSave = useCallback(() => {
    onUpdate(element.id, { content: editContent })
    setIsEditing(false)
  }, [element.id, editContent, onUpdate])

  const handleTextCancel = useCallback(() => {
    setEditContent(element.content || "")
    setIsEditing(false)
  }, [element.content])

  // Handle mouse down for dragging, resizing, and rotating
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, action: "drag" | "resize" | "rotate", handle?: string) => {
      if (element.locked) return

      e.preventDefault()
      e.stopPropagation()

      const rect = elementRef.current?.getBoundingClientRect()
      if (!rect) return

      setDragState({
        isDragging: action === "drag",
        isResizing: action === "resize",
        isRotating: action === "rotate",
        startX: e.clientX,
        startY: e.clientY,
        startWidth: element.width || 50,
        startHeight: element.height || 30,
        startRotation: element.rotation || 0,
        resizeHandle: handle || "",
        initialElementX: element.x || 0,
        initialElementY: element.y || 0,
      })

      onSelect(element.id)
    },
    [element.locked, element.id, element.width, element.height, element.rotation, element.x, element.y, onSelect],
  )

  // Handle mouse move for dragging, resizing, and rotating
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging && !dragState.isResizing && !dragState.isRotating) return

      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      animationFrameRef.current = requestAnimationFrame(() => {
        const deltaX = (e.clientX - dragState.startX) / zoom
        const deltaY = (e.clientY - dragState.startY) / zoom

        if (dragState.isDragging) {
          // Handle dragging with immediate visual feedback
          const newX = Math.max(0, dragState.initialElementX + deltaX)
          const newY = Math.max(0, dragState.initialElementY + deltaY)

          setLocalPosition({ x: newX, y: newY })
          throttledUpdate({ x: newX, y: newY })
        } else if (dragState.isResizing) {
          // Handle resizing with immediate visual feedback
          let newWidth = dragState.startWidth
          let newHeight = dragState.startHeight
          let newX = dragState.initialElementX
          let newY = dragState.initialElementY

          const minSize = 10

          switch (dragState.resizeHandle) {
            case "se":
              newWidth = Math.max(minSize, dragState.startWidth + deltaX)
              newHeight = Math.max(minSize, dragState.startHeight + deltaY)
              break
            case "sw":
              newWidth = Math.max(minSize, dragState.startWidth - deltaX)
              newHeight = Math.max(minSize, dragState.startHeight + deltaY)
              newX = dragState.initialElementX + (dragState.startWidth - newWidth)
              break
            case "ne":
              newWidth = Math.max(minSize, dragState.startWidth + deltaX)
              newHeight = Math.max(minSize, dragState.startHeight - deltaY)
              newY = dragState.initialElementY + (dragState.startHeight - newHeight)
              break
            case "nw":
              newWidth = Math.max(minSize, dragState.startWidth - deltaX)
              newHeight = Math.max(minSize, dragState.startHeight - deltaY)
              newX = dragState.initialElementX + (dragState.startWidth - newWidth)
              newY = dragState.initialElementY + (dragState.startHeight - newHeight)
              break
            case "n":
              newHeight = Math.max(minSize, dragState.startHeight - deltaY)
              newY = dragState.initialElementY + (dragState.startHeight - newHeight)
              break
            case "s":
              newHeight = Math.max(minSize, dragState.startHeight + deltaY)
              break
            case "w":
              newWidth = Math.max(minSize, dragState.startWidth - deltaX)
              newX = dragState.initialElementX + (dragState.startWidth - newWidth)
              break
            case "e":
              newWidth = Math.max(minSize, dragState.startWidth + deltaX)
              break
          }

          setLocalPosition({ x: newX, y: newY })
          setLocalSize({ width: newWidth, height: newHeight })
          throttledUpdate({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          })
        } else if (dragState.isRotating) {
          // Handle rotation with immediate visual feedback
          const rect = elementRef.current?.getBoundingClientRect()
          if (!rect) return

          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
          let rotation = (angle * 180) / Math.PI + 90

          // Snap to 15-degree increments if Shift is held
          if (e.shiftKey) {
            rotation = Math.round(rotation / 15) * 15
          }

          // Normalize rotation to 0-360 degrees
          rotation = ((rotation % 360) + 360) % 360

          setLocalRotation(rotation)
          throttledUpdate({ rotation })
        }
      })
    },
    [dragState, zoom, throttledUpdate],
  )

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Final update to ensure consistency
    if (dragState.isDragging || dragState.isResizing || dragState.isRotating) {
      const finalUpdates: Partial<LayoutElement> = {}

      if (dragState.isDragging) {
        finalUpdates.x = localPosition.x
        finalUpdates.y = localPosition.y
      }

      if (dragState.isResizing) {
        finalUpdates.x = localPosition.x
        finalUpdates.y = localPosition.y
        finalUpdates.width = localSize.width
        finalUpdates.height = localSize.height
      }

      if (dragState.isRotating) {
        finalUpdates.rotation = localRotation
      }

      onUpdate(element.id, finalUpdates)
    }

    setDragState({
      isDragging: false,
      isResizing: false,
      isRotating: false,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startRotation: 0,
      resizeHandle: "",
      initialElementX: 0,
      initialElementY: 0,
    })

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [dragState, localPosition, localSize, localRotation, element.id, onUpdate])

  // Add global mouse event listeners
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing || dragState.isRotating) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [dragState, handleMouseMove, handleMouseUp])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || element.locked) return

      switch (e.key) {
        case "Delete":
        case "Backspace":
          e.preventDefault()
          onDelete(element.id)
          break
        case "r":
        case "R":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const newRotation = 0
            setLocalRotation(newRotation)
            onUpdate(element.id, { rotation: newRotation })
          }
          break
        case "ArrowUp":
          e.preventDefault()
          const newY = Math.max(0, localPosition.y - (e.shiftKey ? 10 : 1))
          setLocalPosition((prev) => ({ ...prev, y: newY }))
          onUpdate(element.id, { y: newY })
          break
        case "ArrowDown":
          e.preventDefault()
          const newYDown = localPosition.y + (e.shiftKey ? 10 : 1)
          setLocalPosition((prev) => ({ ...prev, y: newYDown }))
          onUpdate(element.id, { y: newYDown })
          break
        case "ArrowLeft":
          e.preventDefault()
          const newX = Math.max(0, localPosition.x - (e.shiftKey ? 10 : 1))
          setLocalPosition((prev) => ({ ...prev, x: newX }))
          onUpdate(element.id, { x: newX })
          break
        case "ArrowRight":
          e.preventDefault()
          const newXRight = localPosition.x + (e.shiftKey ? 10 : 1)
          setLocalPosition((prev) => ({ ...prev, x: newXRight }))
          onUpdate(element.id, { x: newXRight })
          break
      }
    }

    if (isSelected) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isSelected, element, onUpdate, onDelete, localPosition])

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      handleTextEdit()
    }
  }, [isEditing, handleTextEdit])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const isLocked = element.locked || false
  const isHidden = element.hidden || false

  if (isHidden) return null

  return (
    <div
      ref={elementRef}
      className={`absolute select-none transition-none ${
        isSelected ? "z-50" : "z-10"
      } ${isLocked ? "cursor-not-allowed" : "cursor-move"}`}
      style={{
        left: Math.max(0, localPosition.x),
        top: Math.max(0, localPosition.y),
        width: Math.max(10, localSize.width),
        height: Math.max(10, localSize.height),
        transform: `rotate(${localRotation}deg)`,
        transformOrigin: "center center",
        willChange: dragState.isDragging || dragState.isResizing || dragState.isRotating ? "transform" : "auto",
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => !isLocked && handleMouseDown(e, "drag")}
    >
      {/* Element Content */}
      <div
        className={`w-full h-full border-2 transition-colors duration-200 ${
          isSelected
            ? "border-blue-500 bg-blue-50/20"
            : isLocked
              ? "border-red-300 bg-red-50/10"
              : "border-gray-300 hover:border-gray-400 bg-white/80"
        } ${element.type === "text" ? "p-2" : "p-0"}`}
        style={{
          borderStyle: isLocked ? "dashed" : "solid",
        }}
      >
        {element.type === "text" ? (
          isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleTextSave}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleTextSave()
                } else if (e.key === "Escape") {
                  handleTextCancel()
                }
              }}
              className="w-full h-full resize-none border-none outline-none bg-transparent text-sm"
              style={{
                fontSize: `${(element.fontSize || config.baseFontSize || 12) * zoom}px`,
                fontFamily: element.fontFamily || config.primaryFont || "Arial",
                lineHeight: element.leading || config.baseLeading || 1.4,
                textAlign: (element.textAlign as any) || "left",
                color: element.color || config.textColor || "#000000",
              }}
            />
          ) : (
            <div
              className="w-full h-full overflow-hidden text-sm leading-relaxed"
              style={{
                fontSize: `${(element.fontSize || config.baseFontSize || 12) * zoom}px`,
                fontFamily: element.fontFamily || config.primaryFont || "Arial",
                lineHeight: element.leading || config.baseLeading || 1.4,
                textAlign: (element.textAlign as any) || "left",
                color: element.color || config.textColor || "#000000",
              }}
            >
              {element.content || "Click to edit text"}
            </div>
          )
        ) : (
          <img
            src={element.content || "/placeholder.svg?height=100&width=100&text=Image"}
            alt="Layout element"
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
      </div>

      {/* Selection Handles and Controls */}
      {isSelected && !isLocked && !isEditing && (
        <>
          {/* Resize Handles */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-nw-resize hover:bg-blue-600 transition-colors"
            style={{
              top: -handleSize / 2,
              left: -handleSize / 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "nw")}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-ne-resize hover:bg-blue-600 transition-colors"
            style={{
              top: -handleSize / 2,
              right: -handleSize / 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "ne")}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-sw-resize hover:bg-blue-600 transition-colors"
            style={{
              bottom: -handleSize / 2,
              left: -handleSize / 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "sw")}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-se-resize hover:bg-blue-600 transition-colors"
            style={{
              bottom: -handleSize / 2,
              right: -handleSize / 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "se")}
          />

          {/* Middle Resize Handles */}
          {/* Top middle */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-n-resize hover:bg-blue-600 transition-colors"
            style={{
              top: -handleSize / 2,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "n")}
          />
          {/* Bottom middle */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-s-resize hover:bg-blue-600 transition-colors"
            style={{
              bottom: -handleSize / 2,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "s")}
          />
          {/* Left middle */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-w-resize hover:bg-blue-600 transition-colors"
            style={{
              top: "50%",
              left: -handleSize / 2,
              transform: "translateY(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "w")}
          />
          {/* Right middle */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white cursor-e-resize hover:bg-blue-600 transition-colors"
            style={{
              top: "50%",
              right: -handleSize / 2,
              transform: "translateY(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize", "e")}
          />

          {/* Rotation Handle */}
          <div
            className="absolute w-3 h-3 bg-orange-500 border-2 border-white rounded-full cursor-grab active:cursor-grabbing hover:bg-orange-600 transition-colors"
            style={{
              top: -rotationHandleDistance,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            onMouseDown={(e) => handleMouseDown(e, "rotate")}
            title="Drag to rotate"
          />

          {/* Rotation Guide Circle */}
          {dragState.isRotating && (
            <div
              className="absolute border border-orange-400 rounded-full pointer-events-none"
              style={{
                top: -Math.max(localSize.width, localSize.height) / 2,
                left: -Math.max(localSize.width, localSize.height) / 2,
                width: Math.max(localSize.width, localSize.height),
                height: Math.max(localSize.width, localSize.height),
                borderStyle: "dashed",
                opacity: 0.5,
              }}
            />
          )}

          {/* Element Info Badge */}
          <div className="absolute -top-8 left-0 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
              {element.type} {localRotation !== 0 && `• ${Math.round(localRotation)}°`}
            </Badge>
          </div>

          {/* Control Buttons */}
          <div className="absolute -top-8 right-0 flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate(element.id, { locked: !isLocked })
              }}
              title={isLocked ? "Unlock" : "Lock"}
            >
              {isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate(element.id, { hidden: !isHidden })
              }}
              title={isHidden ? "Show" : "Hide"}
            >
              {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                const newRotation = 0
                setLocalRotation(newRotation)
                onUpdate(element.id, { rotation: newRotation })
              }}
              title="Reset Rotation"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-red-500/90 hover:bg-red-600 text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(element.id)
              }}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}

      {/* Locked Indicator */}
      {isLocked && (
        <div className="absolute top-1 right-1">
          <Lock className="h-4 w-4 text-red-500" />
        </div>
      )}
    </div>
  )
}
