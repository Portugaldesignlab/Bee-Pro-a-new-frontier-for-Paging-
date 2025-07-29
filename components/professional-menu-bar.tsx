"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  FileText,
  Palette,
  Layers,
  Eye,
  Download,
  Shuffle,
  BookOpen,
  HelpCircle,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Type,
  ImageIcon,
  Menu,
} from "lucide-react"
import type { LayoutConfig, GeneratedLayout } from "@/types/layout"
import { useState } from "react"

interface ProfessionalMenuBarProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
  onShowPanel: (panel: string) => void
  activePanel: string
  onToggleSidebar: () => void
  onAddText: () => void
  onAddImage: () => void
}

export function ProfessionalMenuBar({
  config,
  layout,
  onConfigChange,
  onGenerate,
  isGenerating,
  onShowPanel,
  activePanel,
  onToggleSidebar,
  onAddText,
  onAddImage,
}: ProfessionalMenuBarProps) {
  const [zoom, setZoom] = useState(1.0)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1.0)
  }

  const menuItems = [
    { id: "layout", label: "Layout", icon: Settings },
    { id: "content", label: "Content", icon: FileText },
    { id: "design", label: "Design", icon: Palette },
    { id: "layers", label: "Layers", icon: Layers },
    { id: "view", label: "View", icon: Eye },
    { id: "export", label: "Export", icon: Download },
  ]

  return (
    <div className="border-b bg-white flex items-center justify-between px-4 py-2 h-12">
      {/* Left: Menu Toggle and Menu Items */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="h-8 w-8 p-0 mr-2">
          <Menu className="h-4 w-4" />
        </Button>

        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`h-8 px-3 ${activePanel === item.id ? "bg-muted" : ""}`}
            onClick={() => onShowPanel(item.id)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Center: Generate Button and Add Element Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="h-8 px-4 bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Layout"}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          onClick={onAddText}
          variant="outline"
          size="sm"
          className="h-8 px-3 bg-transparent"
          title="Add Text Element"
        >
          <Type className="h-4 w-4 mr-2" />
          Add Text
        </Button>

        <Button
          onClick={onAddImage}
          variant="outline"
          size="sm"
          className="h-8 px-3 bg-transparent"
          title="Add Image Element"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Add Image
        </Button>

        {layout && (
          <Badge variant="secondary" className="text-xs">
            {layout.elements.length} elements
          </Badge>
        )}
      </div>

      {/* Right: View Controls */}
      <div className="flex items-center gap-2">
        {config.spreadView && (
          <Badge variant="outline" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            Spread
          </Badge>
        )}

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleResetZoom}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
