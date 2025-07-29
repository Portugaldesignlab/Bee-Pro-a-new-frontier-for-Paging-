"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Settings, Book, FileText, ImageIcon, RotateCcw, BookOpen, Calculator, Palette } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"
import {
  PAGE_SIZES,
  getPageSize,
  formatDimensions,
  mmToInches,
  inchesToMm,
  getOrientationIcon,
  getOrientation,
} from "@/lib/page-sizes"
import { useState } from "react"

interface ControlPanelProps {
  config: LayoutConfig
  onChange: (config: Partial<LayoutConfig>) => void
  onGenerate: () => void
  isGenerating: boolean
}

const CONTENT_TYPES = [
  { value: "magazine", label: "Magazine", icon: "📖", description: "Multi-page publication with articles and images" },
  { value: "book", label: "Book", icon: "📚", description: "Text-heavy publication with chapters" },
  { value: "catalog", label: "Catalog", icon: "📋", description: "Product showcase with images and descriptions" },
  { value: "brochure", label: "Brochure", icon: "📄", description: "Marketing material with balanced content" },
  { value: "newsletter", label: "Newsletter", icon: "📰", description: "Regular publication with news and updates" },
  { value: "report", label: "Report", icon: "📊", description: "Data-driven document with charts and text" },
  { value: "portfolio", label: "Portfolio", icon: "🎨", description: "Creative showcase with emphasis on visuals" },
  { value: "manual", label: "Manual", icon: "📖", description: "Instructional document with step-by-step content" },
]

const BINDING_TYPES = [
  { value: "perfect", label: "Perfect Bound", description: "Square spine, professional look" },
  { value: "saddle", label: "Saddle Stitch", description: "Folded and stapled, cost-effective" },
  { value: "casebound", label: "Case Bound", description: "Hardcover with dust jacket" },
  { value: "spiral", label: "Spiral Bound", description: "Wire or plastic coil binding" },
  { value: "wire-o", label: "Wire-O", description: "Double wire binding, lays flat" },
  { value: "comb", label: "Comb Bound", description: "Plastic comb binding" },
]

export function ControlPanel({ config, onChange, onGenerate, isGenerating }: ControlPanelProps) {
  const [dimensionUnit, setDimensionUnit] = useState<"mm" | "inches">("mm")
  const currentPageSize = getPageSize(config.pageSize)

  const handlePageSizeChange = (value: string) => {
    const pageSize = getPageSize(value)
    onChange({
      pageSize: value,
      customWidth: pageSize.width,
      customHeight: pageSize.height,
    })
  }

  const handleCustomDimensionChange = (dimension: "width" | "height", value: number) => {
    const mmValue = dimensionUnit === "inches" ? inchesToMm(value) : value
    onChange({
      [dimension === "width" ? "customWidth" : "customHeight"]: mmValue,
    })
  }

  const handleOrientationFlip = () => {
    const currentWidth = config.pageSize === "custom" ? config.customWidth : currentPageSize.width
    const currentHeight = config.pageSize === "custom" ? config.customHeight : currentPageSize.height

    onChange({
      customWidth: currentHeight,
      customHeight: currentWidth,
    })
  }

  const getDisplayValue = (mmValue: number) => {
    return dimensionUnit === "inches" ? mmToInches(mmValue) : mmValue
  }

  const totalElements = config.imageCount + config.textCount
  const maxElements = config.columns * config.rows * (config.spreadView ? 2 : 1)

  const currentWidth = config.pageSize === "custom" ? config.customWidth : currentPageSize.width
  const currentHeight = config.pageSize === "custom" ? config.customHeight : currentPageSize.height
  const orientation = getOrientation(currentWidth, currentHeight)
  const orientationIcon = getOrientationIcon(currentWidth, currentHeight)

  // Calculate spine width based on page count and GSM
  const calculateSpineWidth = (pages: number, gsm: number) => {
    return Math.max((pages * gsm * 0.8) / 1000, 3) // minimum 3mm spine
  }

  const spineWidth = calculateSpineWidth(config.pageCount, config.gsm)

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type */}
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={config.contentType} onValueChange={(value) => onChange({ contentType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{totalElements}</div>
              <div className="text-xs text-muted-foreground">Total Elements</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{config.pageCount}</div>
              <div className="text-xs text-muted-foreground">Pages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Page Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Page Size</Label>
            <Select value={config.pageSize} onValueChange={handlePageSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Standard Sizes</div>
                {PAGE_SIZES.filter((size) => size.category === "standard").map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <div className="flex items-center gap-2">
                      <span>{getOrientationIcon(size.width, size.height)}</span>
                      <span>
                        {size.name} - {formatDimensions(size.width, size.height)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-2" />
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Book className="h-3 w-3" />
                  Portrait Books
                </div>
                {PAGE_SIZES.filter((size) => size.category === "book" && size.width < size.height).map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span>
                        {size.name} - {formatDimensions(size.width, size.height)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-2" />
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Book className="h-3 w-3" />
                  Landscape Books
                </div>
                {PAGE_SIZES.filter((size) => size.category === "book" && size.width > size.height).map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <div className="flex items-center gap-2">
                      <span>📖</span>
                      <span>
                        {size.name} - {formatDimensions(size.width, size.height)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-2" />
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Book className="h-3 w-3" />
                  Square Books
                </div>
                {PAGE_SIZES.filter((size) => size.category === "book" && size.width === size.height).map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <div className="flex items-center gap-2">
                      <span>⬜</span>
                      <span>
                        {size.name} - {formatDimensions(size.width, size.height)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <Separator className="my-2" />
                {PAGE_SIZES.filter((size) => size.category === "custom").map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Count and GSM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Count</Label>
              <Input
                type="number"
                value={config.pageCount}
                onChange={(e) => onChange({ pageCount: Number.parseInt(e.target.value) || 1 })}
                min="1"
                max="500"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Paper Weight (GSM)</Label>
              <Input
                type="number"
                value={config.gsm}
                onChange={(e) => onChange({ gsm: Number.parseInt(e.target.value) || 170 })}
                min="60"
                max="400"
                className="h-10"
              />
            </div>
          </div>

          {/* Binding Type */}
          <div className="space-y-2">
            <Label>Binding Type</Label>
            <Select value={config.bindingType} onValueChange={(value) => onChange({ bindingType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BINDING_TYPES.map((binding) => (
                  <SelectItem key={binding.value} value={binding.value}>
                    <div>
                      <div className="font-medium">{binding.label}</div>
                      <div className="text-xs text-muted-foreground">{binding.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Spread View Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <Label htmlFor="spread-view" className="text-sm font-medium">
                Spread View (Facing Pages)
              </Label>
            </div>
            <Switch
              id="spread-view"
              checked={config.spreadView}
              onCheckedChange={(checked) => onChange({ spreadView: checked })}
            />
          </div>

          {config.spreadView && (
            <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Spread Settings</Label>
                <div className="text-xs text-muted-foreground">📖 Book Layout</div>
              </div>

              <div className="space-y-2">
                <Label>Binding Gutter: {config.bindingGutter}mm</Label>
                <Slider
                  value={[config.bindingGutter]}
                  onValueChange={([value]) => onChange({ bindingGutter: value })}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="spread-elements" className="text-sm">
                  Allow Cross-Page Elements
                </Label>
                <Switch
                  id="spread-elements"
                  checked={config.allowSpreadElements}
                  onCheckedChange={(checked) => onChange({ allowSpreadElements: checked })}
                />
              </div>
            </div>
          )}

          {/* Custom Dimensions */}
          {config.pageSize === "custom" && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Dimensions</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOrientationFlip}
                    className="h-8 px-2 bg-transparent"
                    title="Flip orientation"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Select value={dimensionUnit} onValueChange={(value: "mm" | "inches") => setDimensionUnit(value)}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="inches">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={getDisplayValue(config.customWidth).toFixed(dimensionUnit === "inches" ? 1 : 0)}
                    onChange={(e) => handleCustomDimensionChange("width", Number.parseFloat(e.target.value) || 0)}
                    step={dimensionUnit === "inches" ? 0.1 : 1}
                    min={dimensionUnit === "inches" ? 1 : 25}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={getDisplayValue(config.customHeight).toFixed(dimensionUnit === "inches" ? 1 : 0)}
                    onChange={(e) => handleCustomDimensionChange("height", Number.parseFloat(e.target.value) || 0)}
                    step={dimensionUnit === "inches" ? 0.1 : 1}
                    min={dimensionUnit === "inches" ? 1 : 25}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {formatDimensions(config.customWidth, config.customHeight)}
              </div>
            </div>
          )}

          {/* Current Page Info */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded flex items-center gap-2">
            <span className="text-lg">{config.spreadView ? "📖" : orientationIcon}</span>
            <div className="flex-1">
              <div className="font-medium capitalize">
                {config.spreadView ? "Spread Layout" : `${orientation} Format`}
              </div>
              <div>
                {config.spreadView
                  ? `${formatDimensions(currentWidth * 2 + config.bindingGutter, currentHeight)} (spread)`
                  : formatDimensions(currentWidth, currentHeight)}
              </div>
              {config.pageCount > 1 && (
                <div className="text-xs mt-1 flex items-center gap-2">
                  <Calculator className="h-3 w-3" />
                  <span>Spine: {spineWidth.toFixed(1)}mm</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4" />
            Content Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  Images: {config.imageCount}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {config.imageCount > 0 ? Math.round((config.imageCount / totalElements) * 100) : 0}%
                </Badge>
              </div>
              <Slider
                value={[config.imageCount]}
                onValueChange={([value]) => onChange({ imageCount: value })}
                min={0}
                max={Math.min(maxElements, 20)}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Text Blocks: {config.textCount}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {config.textCount > 0 ? Math.round((config.textCount / totalElements) * 100) : 0}%
                </Badge>
              </div>
              <Slider
                value={[config.textCount]}
                onValueChange={([value]) => onChange({ textCount: value })}
                min={0}
                max={Math.min(maxElements, 20)}
                step={1}
              />
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
              Total: {totalElements} elements ({maxElements} max for {config.columns}×{config.rows}{" "}
              {config.spreadView ? "spread" : "page"})
              {totalElements > maxElements && (
                <div className="text-orange-600 font-medium mt-1">⚠️ Too many elements for current grid size</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margins & Bleed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Book className="h-4 w-4" />
            Margins & Bleed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.spreadView ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Top: {config.marginTop}mm</Label>
                  <Slider
                    value={[config.marginTop]}
                    onValueChange={([value]) => onChange({ marginTop: value })}
                    min={5}
                    max={50}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bottom: {config.marginBottom}mm</Label>
                  <Slider
                    value={[config.marginBottom]}
                    onValueChange={([value]) => onChange({ marginBottom: value })}
                    min={5}
                    max={50}
                    step={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Inner (Binding): {config.marginInner}mm</Label>
                  <Slider
                    value={[config.marginInner]}
                    onValueChange={([value]) => onChange({ marginInner: value })}
                    min={10}
                    max={60}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outer: {config.marginOuter}mm</Label>
                  <Slider
                    value={[config.marginOuter]}
                    onValueChange={([value]) => onChange({ marginOuter: value })}
                    min={5}
                    max={50}
                    step={1}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Top: {config.marginTop}mm</Label>
                <Slider
                  value={[config.marginTop]}
                  onValueChange={([value]) => onChange({ marginTop: value })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Bottom: {config.marginBottom}mm</Label>
                <Slider
                  value={[config.marginBottom]}
                  onValueChange={([value]) => onChange({ marginBottom: value })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Left: {config.marginLeft}mm</Label>
                <Slider
                  value={[config.marginLeft]}
                  onValueChange={([value]) => onChange({ marginLeft: value })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Right: {config.marginRight}mm</Label>
                <Slider
                  value={[config.marginRight]}
                  onValueChange={([value]) => onChange({ marginRight: value })}
                  min={5}
                  max={50}
                  step={1}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Bleed: {config.bleed}mm</Label>
            <Slider
              value={[config.bleed]}
              onValueChange={([value]) => onChange({ bleed: value })}
              min={0}
              max={10}
              step={0.5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={onGenerate}
            disabled={isGenerating || totalElements === 0 || totalElements > maxElements}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Shuffle className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">
              {isGenerating ? "Generating..." : `Generate ${config.spreadView ? "Spread" : orientation} Layout`}
            </span>
            <span className="sm:hidden">{isGenerating ? "Generating..." : "Generate"}</span>
          </Button>

          {totalElements === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Add at least one image or text block to generate a layout
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
