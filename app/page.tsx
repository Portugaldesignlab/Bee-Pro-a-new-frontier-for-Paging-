"use client"

import { useState } from "react"
import { ProfessionalMenuBar } from "@/components/professional-menu-bar"
import { TabletFriendlySidebar } from "@/components/tablet-friendly-sidebar"
import { ConstantRulersWorkspace } from "@/components/constant-rulers-workspace"
import {
  generateLayout,
  createTextElement,
  createImageElement,
  findNextAvailablePosition,
} from "@/lib/layout-generator"
import type { LayoutConfig, GeneratedLayout, LayoutElement } from "@/types/layout"

const defaultConfig: LayoutConfig = {
  pageSize: "A4",
  customWidth: 210,
  customHeight: 297,
  pageCount: 5,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 15,
  marginRight: 15,
  marginInner: 25,
  marginOuter: 15,
  bleed: 3,
  gsm: 170,
  bindingType: "perfect",
  imageCount: 3,
  textCount: 4,
  aestheticRule: "golden-ratio",
  gridSystem: "fibonacci",
  columns: 6,
  rows: 8,
  gutterX: 5,
  gutterY: 5,
  spreadView: true,
  bindingGutter: 6,
  allowSpreadElements: false,
  contentType: "custom",
  layoutDensity: 60,
  enableSmartPlacement: true,
  showRuleOfThirds: false,
  showGoldenRatio: false,
  gridSizeMode: "count",
  gridCellWidth: 25,
  gridCellHeight: 20,
  gridSpacingX: 5,
  gridSpacingY: 5,
  showGridLines: false,
  snapToGrid: true,
  gridLineColor: "#3b82f6",
  gridLineOpacity: 0.4,
  // Typography defaults
  primaryFont: "bookerly",
  enableHyphenation: true,
  enableJustification: true,
  enableOrphanControl: true,
  wordSpacing: 100,
  letterSpacing: 0,
  glyphScaling: 100,
  baseFontSize: 11,
  baseLeading: 14,
  paragraphSpacing: 6,
  hyphenationZone: 12,
  maxConsecutiveHyphens: 2,
}

export default function GridGenie() {
  const [config, setConfig] = useState<LayoutConfig>(defaultConfig)
  const [generatedLayout, setGeneratedLayout] = useState<GeneratedLayout | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePanel, setActivePanel] = useState("setup")
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const layout = await generateLayout(config)
      setGeneratedLayout(layout)
    } catch (error) {
      console.error("Layout generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfigChange = (newConfig: Partial<LayoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }

  const handleUpdateElement = (elementId: string, updates: Partial<LayoutElement>) => {
    if (!generatedLayout) return

    const updatedElements = generatedLayout.elements.map((element) =>
      element.id === elementId ? { ...element, ...updates } : element,
    )

    setGeneratedLayout({
      ...generatedLayout,
      elements: updatedElements,
    })
  }

  const handleDeleteElement = (elementId: string) => {
    if (!generatedLayout) return

    const updatedElements = generatedLayout.elements.filter((element) => element.id !== elementId)

    setGeneratedLayout({
      ...generatedLayout,
      elements: updatedElements,
    })
  }

  const handleAddElement = (element: LayoutElement) => {
    if (!generatedLayout) {
      // Initialize empty layout if none exists
      setGeneratedLayout({
        id: `layout_${Date.now()}`,
        elements: [element],
        dimensions: {
          width: config.customWidth,
          height: config.customHeight,
          aspectRatio: config.customWidth / config.customHeight,
        },
        metadata: {
          aestheticRule: config.aestheticRule,
          gridSystem: config.gridSystem,
          generatedAt: new Date(),
          elementCount: 1,
          isSpread: config.spreadView,
          contentType: config.contentType,
        },
      })
    } else {
      const updatedElements = [...generatedLayout.elements, element]
      setGeneratedLayout({
        ...generatedLayout,
        elements: updatedElements,
        metadata: {
          ...generatedLayout.metadata,
          elementCount: updatedElements.length,
        },
      })
    }
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleAddText = () => {
    if (!generatedLayout) {
      // Initialize empty layout if none exists
      setGeneratedLayout({
        id: `layout_${Date.now()}`,
        elements: [],
        dimensions: {
          width: config.customWidth,
          height: config.customHeight,
          aspectRatio: config.customWidth / config.customHeight,
        },
        metadata: {
          aestheticRule: config.aestheticRule,
          gridSystem: config.gridSystem,
          generatedAt: new Date(),
          elementCount: 0,
          isSpread: config.spreadView,
          contentType: config.contentType,
        },
      })
    }

    // Find next available position within margins
    const position = findNextAvailablePosition(
      generatedLayout?.elements || [],
      currentPage,
      config.columns,
      config.rows,
      3, // default text width
      2, // default text height
    )

    // Create new text element within margins
    const newElement = createTextElement(config, currentPage, position.gridX, position.gridY, 3, 2, "body")

    const updatedElements = [...(generatedLayout?.elements || []), newElement]

    setGeneratedLayout((prev) => ({
      ...prev!,
      elements: updatedElements,
      metadata: {
        ...prev!.metadata,
        elementCount: updatedElements.length,
      },
    }))
  }

  const handleAddImage = () => {
    if (!generatedLayout) {
      // Initialize empty layout if none exists
      setGeneratedLayout({
        id: `layout_${Date.now()}`,
        elements: [],
        dimensions: {
          width: config.customWidth,
          height: config.customHeight,
          aspectRatio: config.customWidth / config.customHeight,
        },
        metadata: {
          aestheticRule: config.aestheticRule,
          gridSystem: config.gridSystem,
          generatedAt: new Date(),
          elementCount: 0,
          isSpread: config.spreadView,
          contentType: config.contentType,
        },
      })
    }

    // Find next available position within margins
    const position = findNextAvailablePosition(
      generatedLayout?.elements || [],
      currentPage,
      config.columns,
      config.rows,
      2, // default image width
      2, // default image height
    )

    // Create new image element within margins
    const newElement = createImageElement(config, currentPage, position.gridX, position.gridY, 2, 2)

    const updatedElements = [...(generatedLayout?.elements || []), newElement]

    setGeneratedLayout((prev) => ({
      ...prev!,
      elements: updatedElements,
      metadata: {
        ...prev!.metadata,
        elementCount: updatedElements.length,
      },
    }))
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Professional Menu Bar */}
      <ProfessionalMenuBar
        config={config}
        layout={generatedLayout}
        onConfigChange={handleConfigChange}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        onShowPanel={setActivePanel}
        activePanel={activePanel}
        onToggleSidebar={handleToggleSidebar}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Tablet-Friendly Sidebar */}
        <TabletFriendlySidebar
          config={config}
          layout={generatedLayout}
          onConfigChange={handleConfigChange}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onAddElement={handleAddElement}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Constant Rulers Workspace */}
        <ConstantRulersWorkspace
          layout={generatedLayout}
          config={config}
          isGenerating={isGenerating}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onAddElement={handleAddElement}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
