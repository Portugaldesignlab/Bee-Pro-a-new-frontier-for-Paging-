"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, ImageIcon, Layers, Figma } from "lucide-react"
import type { LayoutConfig, GeneratedLayout } from "@/types/layout"
import { exportToSVG, exportToPDF, exportToFigma } from "@/lib/export-utils"

interface ExportPanelProps {
  layout: GeneratedLayout | null
  config: LayoutConfig
}

export function ExportPanel({ layout, config }: ExportPanelProps) {
  const handleExport = async (format: string) => {
    if (!layout) return

    try {
      switch (format) {
        case "svg":
          await exportToSVG(layout, config)
          break
        case "pdf":
          await exportToPDF(layout, config)
          break
        case "figma":
          await exportToFigma(layout, config)
          break
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error)
    }
  }

  if (!layout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Generate a layout first to enable export options</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layout Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Layout Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elements:</span>
              <Badge variant="secondary">{layout.elements.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dimensions:</span>
              <span>
                {layout.dimensions.width} × {layout.dimensions.height}mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grid:</span>
              <span>
                {config.columns} × {config.rows}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aesthetic:</span>
              <span className="capitalize">{layout.metadata.aestheticRule}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Formats */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Export Formats</h3>

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("svg")}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Export as SVG
            <Badge variant="secondary" className="ml-auto">
              Vector
            </Badge>
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            Export Complete Document as PDF
            <Badge variant="secondary" className="ml-auto">
              All Pages
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => handleExport("figma")}
          >
            <Figma className="h-4 w-4 mr-2" />
            Export to Figma
            <Badge variant="secondary" className="ml-auto">
              Editable
            </Badge>
          </Button>

          <Button variant="outline" className="w-full justify-start bg-transparent" disabled>
            <Layers className="h-4 w-4 mr-2" />
            Export as PSD
            <Badge variant="outline" className="ml-auto">
              Coming Soon
            </Badge>
          </Button>
        </div>

        <Separator />

        {/* Layer Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Layer Structure</h3>
          <div className="space-y-1 text-xs">
            {layout.elements.map((element, index) => (
              <div key={element.id} className="flex items-center justify-between py-1 px-2 bg-muted rounded">
                <span className="font-mono">{element.id}</span>
                <Badge variant="outline" size="sm">
                  {element.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
