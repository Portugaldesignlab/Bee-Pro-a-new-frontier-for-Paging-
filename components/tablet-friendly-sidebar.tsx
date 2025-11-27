"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Layers, Grid, Type, Download, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { ControlPanel } from "./control-panel"
import { ElementLayerManager } from "./element-layer-manager"
import { GridControls } from "./grid-controls"
import { ExportPanel } from "./export-panel"
import { ContentUploadPanel } from "./content-upload-panel"
import { StyleControls } from "./style-controls"
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
  extractedContent?: ExtractedContent | null
  isUsingContent?: boolean
  onContentExtracted?: (content: ExtractedContent) => void
  onUseContent?: (useContent: boolean) => void
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
  extractedContent,
  isUsingContent,
  onContentExtracted,
  onUseContent,
}: TabletFriendlySidebarProps) {
  const handleApplyStyleToAll = (style: Record<string, any>) => {
    if (!layout) return

    layout.elements.forEach((element) => {
      if (element.type === "text") {
        const updates: Partial<LayoutElement> = {}

        if (style.primaryFont) updates.fontFamily = style.primaryFont
        if (style.baseFontSize) updates.fontSize = style.baseFontSize
        if (style.baseLeading) updates.leading = style.baseLeading
        if (style.letterSpacing) updates.letterSpacing = style.letterSpacing

        onUpdateElement(element.id, updates)
      }
    })
  }

  const tabs = [
    { id: "setup", label: "Setup", icon: Settings, badge: null },
    { id: "content", label: "Content", icon: Upload, badge: extractedContent ? "1" : null },
    { id: "elements", label: "Elements", icon: Layers, badge: layout?.elements.length.toString() || "0" },
    { id: "grid", label: "Grid", icon: Grid, badge: null },
    { id: "style", label: "Style", icon: Type, badge: null },
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-semibold">Layout Controls</h2>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-7 w-7 p-0" title="Collapse sidebar">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs - Fixed at top */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <Tabs value={activePanel} onValueChange={onPanelChange} className="w-full">
          <TabsList className="grid grid-cols-6 w-full gap-0 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
              >
                <div className="flex flex-col items-center gap-1">
                  <tab.icon className="h-4 w-4" />
                  {tab.badge && (
                    <Badge
                      variant="secondary"
                      className="absolute top-0 right-0 h-4 w-4 p-0 text-xs flex items-center justify-center bg-red-500 text-white"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <Tabs value={activePanel} onValueChange={onPanelChange} className="w-full">
            <div className="w-full">
              <TabsContent value="setup" className="mt-0 px-4 py-3">
                <div className="space-y-3">
                  <ControlPanel
                    config={config}
                    onChange={onConfigChange}
                    onGenerate={onGenerate}
                    isGenerating={isGenerating}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0 px-4 py-3">
                {onContentExtracted && onUseContent && (
                  <div className="space-y-3">
                    <ContentUploadPanel
                      config={config}
                      onContentExtracted={onContentExtracted}
                      onUseContent={onUseContent}
                      extractedContent={extractedContent || null}
                      isUsingContent={isUsingContent || false}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="elements" className="mt-0 px-4 py-3">
                <div className="space-y-3">
                  <ElementLayerManager
                    layout={layout}
                    onUpdateElement={onUpdateElement}
                    onDeleteElement={onDeleteElement}
                    onAddElement={onAddElement}
                  />
                </div>
              </TabsContent>

              <TabsContent value="grid" className="mt-0 px-4 py-3">
                <div className="space-y-3">
                  <GridControls config={config} onChange={onConfigChange} />
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-0 px-4 py-3">
                <div className="space-y-3">
                  <StyleControls
                    config={config}
                    layout={layout}
                    onConfigChange={onConfigChange}
                    onApplyStyleToAll={handleApplyStyleToAll}
                  />
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-0 px-4 py-3">
                <div className="space-y-3">
                  <ExportPanel layout={layout} config={config} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  )
}
