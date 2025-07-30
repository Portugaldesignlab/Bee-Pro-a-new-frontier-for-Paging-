"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Layers, Grid, Type, Download, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { ControlPanel } from "./control-panel"
import { ElementLayerManager } from "./element-layer-manager"
import { GridControls } from "./grid-controls"
import { TypographyControls } from "./typography-controls"
import { ExportPanel } from "./export-panel"
import { ContentUploadPanel } from "./content-upload-panel"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"
import type { ExtractedContent } from "@/lib/word-parser"

interface TabletFriendlySidebarProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: LayoutElement) => void
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
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null)
  const [isUsingContent, setIsUsingContent] = useState(false)

  const handleContentExtracted = (content: ExtractedContent) => {
    setExtractedContent(content)
    if (content) {
      setIsUsingContent(true)
    }
  }

  const handleUseContent = (useContent: boolean) => {
    setIsUsingContent(useContent)
  }

  const tabs = [
    { id: "setup", label: "Setup", icon: Settings, badge: null },
    { id: "content", label: "Content", icon: Upload, badge: extractedContent ? "1" : null },
    { id: "elements", label: "Elements", icon: Layers, badge: layout?.elements.length.toString() || "0" },
    { id: "grid", label: "Grid", icon: Grid, badge: null },
    { id: "typography", label: "Type", icon: Type, badge: null },
    { id: "export", label: "Export", icon: Download, badge: null },
  ]

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-10 w-10 m-1 p-0"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex flex-col gap-1 p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activePanel === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onPanelChange(tab.id)}
              className="h-10 w-10 p-0 relative"
              title={tab.label}
            >
              <tab.icon className="h-4 w-4" />
              {tab.badge && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Layout Controls</h2>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-8 w-8 p-0" title="Collapse sidebar">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activePanel} onValueChange={onPanelChange} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-6 m-4 mb-0">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="relative">
              <tab.icon className="h-4 w-4" />
              {tab.badge && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <TabsContent value="setup" className="mt-0">
                <ControlPanel
                  config={config}
                  onChange={onConfigChange}
                  onGenerate={onGenerate}
                  isGenerating={isGenerating}
                />
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <ContentUploadPanel
                  config={config}
                  onContentExtracted={handleContentExtracted}
                  onUseContent={handleUseContent}
                  extractedContent={extractedContent}
                  isUsingContent={isUsingContent}
                />
              </TabsContent>

              <TabsContent value="elements" className="mt-0">
                <ElementLayerManager
                  layout={layout}
                  onUpdateElement={onUpdateElement}
                  onDeleteElement={onDeleteElement}
                  onAddElement={onAddElement}
                />
              </TabsContent>

              <TabsContent value="grid" className="mt-0">
                <GridControls config={config} onChange={onConfigChange} />
              </TabsContent>

              <TabsContent value="typography" className="mt-0">
                <TypographyControls config={config} onChange={onConfigChange} />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportPanel layout={layout} config={config} />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  )
}
