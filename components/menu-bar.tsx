"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, Palette, Download, Layers, Eye, Shuffle, BookOpen, Zap, HelpCircle } from "lucide-react"
import type { LayoutConfig, GeneratedLayout } from "@/types/layout"

interface MenuBarProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
  onShowPanel: (panel: string) => void
  activePanel: string
}

export function MenuBar({
  config,
  layout,
  onConfigChange,
  onGenerate,
  isGenerating,
  onShowPanel,
  activePanel,
}: MenuBarProps) {
  const [showAbout, setShowAbout] = useState(false)

  const menuItems = [
    {
      id: "layout",
      label: "Layout",
      icon: Settings,
      items: [
        { label: "Page Setup", action: () => onShowPanel("page-setup") },
        { label: "Margins & Bleed", action: () => onShowPanel("margins") },
        { label: "Grid System", action: () => onShowPanel("grid") },
        { separator: true },
        { label: "Spread View", action: () => onConfigChange({ spreadView: !config.spreadView }) },
        { label: "Show Guides", action: () => onShowPanel("guides") },
      ],
    },
    {
      id: "content",
      label: "Content",
      icon: FileText,
      items: [
        { label: "Content Type", action: () => onShowPanel("content-type") },
        { label: "Element Count", action: () => onShowPanel("elements") },
        {
          label: "Smart Placement",
          action: () => onConfigChange({ enableSmartPlacement: !config.enableSmartPlacement }),
        },
        { separator: true },
        { label: "Add Text Block", action: () => onShowPanel("add-text") },
        { label: "Add Image", action: () => onShowPanel("add-image") },
      ],
    },
    {
      id: "design",
      label: "Design",
      icon: Palette,
      items: [
        { label: "Aesthetic Rules", action: () => onShowPanel("aesthetic") },
        { label: "Layout Density", action: () => onShowPanel("density") },
        { separator: true },
        { label: "Rule of Thirds", action: () => onConfigChange({ showRuleOfThirds: !config.showRuleOfThirds }) },
        { label: "Golden Ratio", action: () => onConfigChange({ showGoldenRatio: !config.showGoldenRatio }) },
      ],
    },
    {
      id: "layers",
      label: "Layers",
      icon: Layers,
      items: [
        { label: "Layer Manager", action: () => onShowPanel("layers") },
        { label: "Show All", action: () => onShowPanel("show-all") },
        { label: "Hide All", action: () => onShowPanel("hide-all") },
      ],
    },
    {
      id: "view",
      label: "View",
      icon: Eye,
      items: [
        { label: "Zoom In", action: () => onShowPanel("zoom-in") },
        { label: "Zoom Out", action: () => onShowPanel("zoom-out") },
        { label: "Fit to Screen", action: () => onShowPanel("fit-screen") },
        { separator: true },
        { label: "Show Grid", action: () => onShowPanel("show-grid") },
        { label: "Show Margins", action: () => onShowPanel("show-margins") },
        { label: "Show Rulers", action: () => onShowPanel("show-rulers") },
      ],
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      items: [
        { label: "Export as PDF", action: () => onShowPanel("export-pdf") },
        { label: "Export as SVG", action: () => onShowPanel("export-svg") },
        { label: "Export to Figma", action: () => onShowPanel("export-figma") },
        { separator: true },
        { label: "Print Settings", action: () => onShowPanel("print") },
      ],
    },
  ]

  return (
    <div className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Menu Items */}
        <div className="flex items-center gap-1">
          {menuItems.map((menu) => (
            <DropdownMenu key={menu.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-3 ${activePanel.startsWith(menu.id) ? "bg-muted" : ""}`}
                >
                  <menu.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{menu.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {menu.items.map((item, index) => (
                  <div key={index}>
                    {item.separator ? (
                      <DropdownMenuSeparator />
                    ) : (
                      <DropdownMenuItem onClick={item.action} className="cursor-pointer">
                        {item.label}
                      </DropdownMenuItem>
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Center: Generate Button */}
        <div className="flex items-center gap-2">
          <Button onClick={onGenerate} disabled={isGenerating} className="h-8 px-3" size="sm">
            <Shuffle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate"}</span>
            <span className="sm:hidden">{isGenerating ? "..." : "Gen"}</span>
          </Button>

          {layout && (
            <Badge variant="secondary" className="text-xs hidden md:inline-flex">
              {layout.elements.length} elements
            </Badge>
          )}
        </div>

        {/* Right: Status & Help */}
        <div className="flex items-center gap-2">
          {config.spreadView && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Spread
            </Badge>
          )}

          {config.enableSmartPlacement && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          )}

          <Dialog open={showAbout} onOpenChange={setShowAbout}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About GridGenie</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>Professional Interactive Layout Editor for Print & Digital Design</p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Keyboard Shortcuts:</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>Arrow keys: Move selected element</li>
                    <li>Shift + Arrow: Move in larger steps</li>
                    <li>Delete/Backspace: Remove element</li>
                    <li>Escape: Deselect element</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
