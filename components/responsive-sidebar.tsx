"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Settings, FileText, Layers, Download, Menu, X, Grid3X3 } from "lucide-react"
import { ControlPanel } from "@/components/control-panel"
import { ContentTypeSelector } from "@/components/content-type-selector"
import { ElementLayerManager } from "@/components/element-layer-manager"
import { ExportPanel } from "@/components/export-panel"
import { GridControls } from "@/components/grid-controls"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import { getPageSize } from "@/lib/page-sizes"

interface ResponsiveSidebarProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: Partial<LayoutElement>) => void
  onReorderElement: (elementId: string, direction: "up" | "down") => void
  activePanel: string
  onPanelChange: (panel: string) => void
}

export function ResponsiveSidebar({
  config,
  layout,
  onConfigChange,
  onGenerate,
  isGenerating,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onReorderElement,
  activePanel,
  onPanelChange,
}: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get current page dimensions
  const currentPageSize = getPageSize(config.pageSize)
  const pageWidth = config.pageSize === "custom" ? config.customWidth : currentPageSize.width
  const pageHeight = config.pageSize === "custom" ? config.customHeight : currentPageSize.height

  const tabs = [
    {
      id: "layout",
      label: "Setup",
      shortLabel: "Setup",
      icon: Settings,
      content: (
        <ControlPanel config={config} onChange={onConfigChange} onGenerate={onGenerate} isGenerating={isGenerating} />
      ),
    },
    {
      id: "content",
      label: "Content",
      shortLabel: "Type",
      icon: FileText,
      content: <ContentTypeSelector config={config} onChange={onConfigChange} />,
    },
    {
      id: "grid",
      label: "Grid",
      shortLabel: "Grid",
      icon: Grid3X3,
      content: <GridControls config={config} onChange={onConfigChange} pageWidth={pageWidth} pageHeight={pageHeight} />,
    },
    {
      id: "layers",
      label: "Layers",
      shortLabel: "Layers",
      icon: Layers,
      badge: layout?.elements.length || 0,
      content: (
        <ElementLayerManager
          elements={layout?.elements || []}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
          onAddElement={onAddElement}
          onReorderElement={onReorderElement}
        />
      ),
    },
    {
      id: "export",
      label: "Export",
      shortLabel: "Save",
      icon: Download,
      content: <ExportPanel layout={layout} config={config} />,
    },
  ]

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Tools</h2>
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activePanel} onValueChange={onPanelChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 m-4 mb-0 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-1 h-14 text-xs relative p-2">
              <tab.icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline leading-tight text-center">{tab.shortLabel}</span>
              <span className="sm:hidden leading-tight text-center">{tab.shortLabel}</span>
              {tab.badge && tab.badge > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-4"
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ScrollArea className="flex-1 px-4 pb-4">{tab.content}</ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed top-16 left-4 z-40 bg-white/90 backdrop-blur-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r bg-white/50 backdrop-blur-sm">
        <SidebarContent />
      </div>
    </>
  )
}
