"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Layers,
  Type,
  Grid,
  Palette,
  FileText,
  ImageIcon,
  Menu,
  X,
} from "lucide-react"
import { ControlPanel } from "./control-panel"
import { PaperSelector } from "./paper-selector"
import { ElementLayerManager } from "./element-layer-manager"
import { TypographyControls } from "./typography-controls"
import { GridControls } from "./grid-controls"
import { GuidelineControls } from "./guideline-controls"
import { ExportPanel } from "./export-panel"
import { PresetManager } from "./preset-manager"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"

interface TabletFriendlySidebarProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: Partial<LayoutElement>) => void
  activePanel: string
  onPanelChange: (panel: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function TabletFriendlySidebar({
  config,
  layout,
  onConfigChange,
  onGenerate,
  isGenerating,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  activePanel,
  onPanelChange,
  isCollapsed,
  onToggleCollapse,
}: TabletFriendlySidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    setup: true,
    paper: false,
    grid: false,
    typography: false,
    guidelines: false,
    layers: false,
    export: false,
    presets: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Layout Tools</h2>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Page Setup */}
          <Collapsible open={expandedSections.setup} onOpenChange={() => toggleSection("setup")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Page Setup</span>
                </div>
                {expandedSections.setup ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ControlPanel
                config={config}
                onChange={onConfigChange}
                onGenerate={onGenerate}
                isGenerating={isGenerating}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Paper Selection */}
          <Collapsible open={expandedSections.paper} onOpenChange={() => toggleSection("paper")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Paper & Materials</span>
                </div>
                {expandedSections.paper ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <PaperSelector config={config} onChange={onConfigChange} />
            </CollapsibleContent>
          </Collapsible>

          {/* Grid System */}
          <Collapsible open={expandedSections.grid} onOpenChange={() => toggleSection("grid")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  <span className="font-medium">Grid System</span>
                </div>
                {expandedSections.grid ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <GridControls config={config} onChange={onConfigChange} />
            </CollapsibleContent>
          </Collapsible>

          {/* Typography */}
          <Collapsible open={expandedSections.typography} onOpenChange={() => toggleSection("typography")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span className="font-medium">Typography</span>
                </div>
                {expandedSections.typography ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <TypographyControls config={config} onChange={onConfigChange} />
            </CollapsibleContent>
          </Collapsible>

          {/* Guidelines */}
          <Collapsible open={expandedSections.guidelines} onOpenChange={() => toggleSection("guidelines")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="font-medium">Guidelines & Guides</span>
                </div>
                {expandedSections.guidelines ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <GuidelineControls config={config} onChange={onConfigChange} />
            </CollapsibleContent>
          </Collapsible>

          {/* Element Layers */}
          {layout && (
            <Collapsible open={expandedSections.layers} onOpenChange={() => toggleSection("layers")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="font-medium">Layers ({layout.elements.length})</span>
                  </div>
                  {expandedSections.layers ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ElementLayerManager
                  elements={layout.elements}
                  onUpdateElement={onUpdateElement}
                  onDeleteElement={onDeleteElement}
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddElement({ type: "image" })}
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Add Image
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onAddElement({ type: "text" })} className="flex-1">
                    <Type className="h-4 w-4 mr-1" />
                    Add Text
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Export Options */}
          <Collapsible open={expandedSections.export} onOpenChange={() => toggleSection("export")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Export & Print</span>
                </div>
                {expandedSections.export ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ExportPanel config={config} layout={layout} />
            </CollapsibleContent>
          </Collapsible>

          {/* Presets */}
          <Collapsible open={expandedSections.presets} onOpenChange={() => toggleSection("presets")}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Presets & Templates</span>
                </div>
                {expandedSections.presets ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <PresetManager config={config} onConfigChange={onConfigChange} />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )

  // Desktop sidebar
  if (!isCollapsed) {
    return <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">{sidebarContent}</div>
  }

  // Mobile/tablet sheet or collapsed desktop
  return (
    <>
      {/* Collapsed desktop sidebar */}
      <div className="w-12 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col items-center py-4 gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => toggleSection("setup")} title="Page Setup">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleSection("paper")} title="Paper">
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleSection("grid")} title="Grid">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleSection("typography")} title="Typography">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleSection("guidelines")} title="Guidelines">
            <Palette className="h-4 w-4" />
          </Button>
          {layout && (
            <Button variant="ghost" size="sm" onClick={() => toggleSection("layers")} title="Layers">
              <Layers className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile/tablet sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden fixed top-4 left-4 z-50 bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}
