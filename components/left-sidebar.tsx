"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, FileText, Grid3X3, Layers, Download } from "lucide-react"
import { ControlPanel } from "@/components/control-panel"
import { ContentTypeSelector } from "@/components/content-type-selector"
import { GridControls } from "@/components/grid-controls"
import { ElementLayerManager } from "@/components/element-layer-manager"
import { ExportPanel } from "@/components/export-panel"
import { TypographyControls } from "@/components/typography-controls"
import { GuidelineControls } from "@/components/guideline-controls"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import { getPageSize } from "@/lib/page-sizes"

interface LeftSidebarProps {
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
}

export function LeftSidebar({
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
}: LeftSidebarProps) {
  const currentPageSize = getPageSize(config.pageSize)
  const pageWidth = config.pageSize === "custom" ? config.customWidth : currentPageSize.width
  const pageHeight = config.pageSize === "custom" ? config.customHeight : currentPageSize.height

  const tabs = [
    {
      id: "setup",
      label: "Setup",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <ControlPanel config={config} onChange={onConfigChange} onGenerate={onGenerate} isGenerating={isGenerating} />
          <TypographyControls config={config} onChange={onConfigChange} />
          <GuidelineControls
            guidelines={{ x: [], y: [] }}
            guidelineSettings={{
              color: "#06b6d4",
              opacity: 0.8,
              locked: false,
              visible: true,
              snapDistance: 8,
            }}
            onGuidelineSettingsChange={() => {}}
            onClearGuidelines={() => {}}
            onLockGuidelines={() => {}}
          />
        </div>
      ),
    },
    {
      id: "type",
      label: "Type",
      icon: FileText,
      content: <ContentTypeSelector config={config} onChange={onConfigChange} />,
    },
    {
      id: "grid",
      label: "Grid",
      icon: Grid3X3,
      content: <GridControls config={config} onChange={onConfigChange} pageWidth={pageWidth} pageHeight={pageHeight} />,
    },
    {
      id: "layers",
      label: "Layers",
      icon: Layers,
      badge: layout?.elements.length || 0,
      content: (
        <ElementLayerManager
          elements={layout?.elements || []}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
          onAddElement={onAddElement}
          onReorderElement={() => {}}
        />
      ),
    },
    {
      id: "save",
      label: "Save",
      icon: Download,
      content: <ExportPanel layout={layout} config={config} />,
    },
  ]

  return (
    <div className="w-80 border-r bg-white flex flex-col h-full">
      {/* Sidebar Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <h2 className="font-semibold text-sm">Tools</h2>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="flex-shrink-0 bg-white border-b">
        <Tabs value={activePanel || "setup"} onValueChange={onPanelChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 m-4 mb-0 h-auto bg-gray-100">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-1 h-16 text-xs relative p-2">
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                <span className="leading-tight text-center">{tab.label}</span>
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

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                {/* Independent scrolling area for each tab */}
                <ScrollArea className="flex-1">
                  <div className="px-4 pb-4 space-y-4" style={{ minHeight: "calc(100vh - 200px)" }}>
                    {tab.content}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
