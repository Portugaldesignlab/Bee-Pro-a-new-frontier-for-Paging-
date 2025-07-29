"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Palette, Grid, Square } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"

interface GuidelineControlsProps {
  config: LayoutConfig
  onChange: (updates: Partial<LayoutConfig>) => void
}

const GRID_COLORS = [
  { name: "Magenta", value: "#ff00ff", color: "bg-fuchsia-500" },
  { name: "Cyan", value: "#00ffff", color: "bg-cyan-400" },
  { name: "Blue", value: "#0066ff", color: "bg-blue-600" },
  { name: "Red", value: "#ff0000", color: "bg-red-500" },
  { name: "Green", value: "#00ff00", color: "bg-green-500" },
  { name: "Orange", value: "#ff6600", color: "bg-orange-500" },
]

export function GuidelineControls({ config, onChange }: GuidelineControlsProps) {
  const [selectedColor, setSelectedColor] = useState(config.gridLineColor || "#ff00ff")

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    onChange({ gridLineColor: color })
  }

  const handleOpacityChange = (value: number[]) => {
    onChange({ gridLineOpacity: value[0] / 100 })
  }

  const generatePreviewGrid = () => {
    const gridLines = []
    const cellSize = 40
    const cols = 6
    const rows = 4
    const opacity = config.gridLineOpacity || 1

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * cellSize
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={rows * cellSize}
          stroke={selectedColor}
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity={opacity}
        />,
      )
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * cellSize
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={cols * cellSize}
          y2={y}
          stroke={selectedColor}
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity={opacity}
        />,
      )
    }

    // Add margin guides
    const marginSize = 20
    gridLines.push(
      <rect
        key="margin"
        x={marginSize}
        y={marginSize}
        width={cols * cellSize - marginSize * 2}
        height={rows * cellSize - marginSize * 2}
        fill="none"
        stroke={selectedColor}
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity={opacity * 0.7}
      />,
    )

    return gridLines
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Guidelines & Guides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aesthetic Guides */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Aesthetic Guides</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="rule-of-thirds" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Rule of Thirds
            </Label>
            <Switch
              id="rule-of-thirds"
              checked={config.showRuleOfThirds}
              onCheckedChange={(checked) => onChange({ showRuleOfThirds: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="golden-ratio" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Golden Ratio
            </Label>
            <Switch
              id="golden-ratio"
              checked={config.showGoldenRatio}
              onCheckedChange={(checked) => onChange({ showGoldenRatio: checked })}
            />
          </div>
        </div>

        {/* Margin Guides */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Margin & Bleed Guides</h4>

          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="text-sm text-muted-foreground">
              Margin guides are always visible and update in real-time with your margin settings.
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-pink-500 border-dashed border"></div>
                <span className="text-xs">Margins</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-cyan-400 border-dashed border-2"></div>
                <span className="text-xs">Bleed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Guides */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Grid Guides</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid-guides">Show Grid Lines</Label>
            <Switch
              id="show-grid-guides"
              checked={config.showGridLines}
              onCheckedChange={(checked) => onChange({ showGridLines: checked })}
            />
          </div>

          {config.showGridLines && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Grid Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {GRID_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      className={`w-8 h-8 rounded-lg ${colorOption.color} border-2 transition-all ${
                        selectedColor === colorOption.value
                          ? "border-white shadow-lg scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleColorChange(colorOption.value)}
                      title={colorOption.name}
                    >
                      {selectedColor === colorOption.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Grid Opacity: {Math.round((config.gridLineOpacity || 1) * 100)}%</Label>
                <Slider
                  value={[(config.gridLineOpacity || 1) * 100]}
                  onValueChange={handleOpacityChange}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Smart Guides */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">Smart Guides</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="snap-to-grid">Snap to Grid</Label>
            <Switch
              id="snap-to-grid"
              checked={config.snapToGrid}
              onCheckedChange={(checked) => onChange({ snapToGrid: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smart-placement">Smart Element Placement</Label>
            <Switch
              id="smart-placement"
              checked={config.enableSmartPlacement}
              onCheckedChange={(checked) => onChange({ enableSmartPlacement: checked })}
            />
          </div>
        </div>

        {/* Guide Preview */}
        <div className="p-3 bg-muted/30 rounded-lg pt-4 border-t">
          <Label className="text-sm font-medium mb-2 block">Guide Preview</Label>
          <div className="w-full h-32 border rounded relative overflow-hidden bg-white">
            <svg className="absolute inset-0 w-full h-full">
              {/* Rule of thirds */}
              {config.showRuleOfThirds && (
                <>
                  <line
                    x1="33.33%"
                    y1="0"
                    x2="33.33%"
                    y2="100%"
                    stroke="#ff00ff"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="66.67%"
                    y1="0"
                    x2="66.67%"
                    y2="100%"
                    stroke="#ff00ff"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="0"
                    y1="33.33%"
                    x2="100%"
                    y2="33.33%"
                    stroke="#ff00ff"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1="0"
                    y1="66.67%"
                    x2="100%"
                    y2="66.67%"
                    stroke="#ff00ff"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="3,3"
                  />
                </>
              )}

              {/* Golden ratio */}
              {config.showGoldenRatio && (
                <>
                  <line
                    x1="38.2%"
                    y1="0"
                    x2="38.2%"
                    y2="100%"
                    stroke="#ffaa00"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="5,2"
                  />
                  <line
                    x1="61.8%"
                    y1="0"
                    x2="61.8%"
                    y2="100%"
                    stroke="#ffaa00"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="5,2"
                  />
                  <line
                    x1="0"
                    y1="38.2%"
                    x2="100%"
                    y2="38.2%"
                    stroke="#ffaa00"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="5,2"
                  />
                  <line
                    x1="0"
                    y1="61.8%"
                    x2="100%"
                    y2="61.8%"
                    stroke="#ffaa00"
                    strokeWidth="1"
                    opacity="0.6"
                    strokeDasharray="5,2"
                  />
                </>
              )}

              {/* Grid lines */}
              {config.showGridLines && generatePreviewGrid()}

              {/* Margin guides */}
              <rect
                x="10%"
                y="15%"
                width="80%"
                height="70%"
                fill="none"
                stroke="#ff00ff"
                strokeWidth="1"
                opacity="0.7"
                strokeDasharray="3,3"
              />
            </svg>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Preview shows active guides that will appear in the workspace
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
