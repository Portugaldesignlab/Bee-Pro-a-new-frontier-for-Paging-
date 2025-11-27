"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Palette, Type, Copy } from "lucide-react"
import type { LayoutConfig, GeneratedLayout } from "@/types/layout"

interface StyleControlsProps {
  config: LayoutConfig
  layout: GeneratedLayout | null
  onConfigChange: (config: Partial<LayoutConfig>) => void
  onApplyStyleToAll: (style: Record<string, any>) => void
}

export function StyleControls({ config, layout, onConfigChange, onApplyStyleToAll }: StyleControlsProps) {
  const [selectedFont, setSelectedFont] = useState(config.primaryFont || "Inter")
  const [selectedFontSize, setSelectedFontSize] = useState(config.baseFontSize || 11)
  const [selectedLineHeight, setSelectedLineHeight] = useState(config.baseLeading || 1.4)
  const [selectedLetterSpacing, setSelectedLetterSpacing] = useState(config.letterSpacing || 0)
  const [selectedTextColor, setSelectedTextColor] = useState("#000000")

  const fonts = [
    "Inter",
    "Georgia",
    "Bookerly",
    "Garamond",
    "Times New Roman",
    "Helvetica",
    "Arial",
    "Courier New",
    "Verdana",
    "Trebuchet MS",
  ]

  const handleApplyStylesAcrossDocument = () => {
    const style = {
      primaryFont: selectedFont,
      baseFontSize: selectedFontSize,
      baseLeading: selectedLineHeight,
      letterSpacing: selectedLetterSpacing,
    }

    onConfigChange(style)
    onApplyStyleToAll(style)
  }

  return (
    <div className="space-y-4">
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Font Family</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font} value={font} className="text-xs">
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Base Font Size: <span className="text-blue-600">{selectedFontSize}pt</span>
            </Label>
            <Slider
              value={[selectedFontSize]}
              onValueChange={(value) => setSelectedFontSize(value[0])}
              min={8}
              max={24}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Line Height: <span className="text-blue-600">{selectedLineHeight.toFixed(2)}</span>
            </Label>
            <Slider
              value={[selectedLineHeight]}
              onValueChange={(value) => setSelectedLineHeight(value[0])}
              min={1}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Letter Spacing: <span className="text-blue-600">{selectedLetterSpacing}%</span>
            </Label>
            <Slider
              value={[selectedLetterSpacing]}
              onValueChange={(value) => setSelectedLetterSpacing(value[0])}
              min={-5}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <code className="text-xs text-muted-foreground">{selectedTextColor}</code>
            </div>
          </div>

          {/* Hyphenation */}
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Enable Hyphenation</Label>
            <Button
              variant={config.enableHyphenation ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs"
              onClick={() => onConfigChange({ enableHyphenation: !config.enableHyphenation })}
            >
              {config.enableHyphenation ? "On" : "Off"}
            </Button>
          </div>

          {/* Justification */}
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Enable Justification</Label>
            <Button
              variant={config.enableJustification ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs"
              onClick={() => onConfigChange({ enableJustification: !config.enableJustification })}
            >
              {config.enableJustification ? "On" : "Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Apply to Document */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Copy className="h-4 w-4 text-blue-600" />
            Apply to Entire Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleApplyStylesAcrossDocument}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!layout || layout.elements.length === 0}
          >
            <span className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Apply Styles to All {layout?.elements.length || 0} Elements
            </span>
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Applies the selected typography settings to all text elements across all pages
          </p>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4" />
            Color Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {["#000000", "#1a1a1a", "#333333", "#666666", "#0066cc", "#cc0000", "#008000", "#ff6600"].map((color) => (
              <button
                key={color}
                className="w-full h-8 rounded border border-gray-300 hover:border-gray-500 transition-all"
                style={{ backgroundColor: color }}
                onClick={() => setSelectedTextColor(color)}
                title={color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {layout && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-semibold">Document Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <Badge variant="secondary" className="text-xs">
                  {layout.elements.length} Elements
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="text-xs">
                  {layout.elements.filter((el) => el.type === "text").length} Text
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="text-xs">
                  {layout.elements.filter((el) => el.type === "image").length} Images
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="text-xs">
                  Font: {selectedFont}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
