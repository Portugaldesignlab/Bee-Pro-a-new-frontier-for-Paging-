"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Grid3X3, Eye, FileText, Newspaper, Book, Package, RotateCcw, EyeOff } from "lucide-react"
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

interface GridControlsProps {
  config: LayoutConfig
  onChange: (updates: Partial<LayoutConfig>) => void
  pageWidth?: number
  pageHeight?: number
}

const PAPER_TYPES = [
  {
    id: "coated",
    name: "Coated",
    icon: FileText,
    description: "Smooth, glossy finish",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    recommended: ["magazine", "catalog", "brochure"],
  },
  {
    id: "uncoated",
    name: "Uncoated",
    icon: Book,
    description: "Natural, matte finish",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    recommended: ["book", "poster"],
  },
  {
    id: "newsprint",
    name: "Newsprint",
    icon: Newspaper,
    description: "Lightweight, absorbent",
    color: "bg-gray-50 border-gray-200 text-gray-700",
    recommended: ["newspaper"],
  },
  {
    id: "recycled",
    name: "Recycled",
    icon: Package,
    description: "Eco-friendly option",
    color: "bg-green-50 border-green-200 text-green-700",
    recommended: ["book", "magazine"],
  },
]

const GSM_OPTIONS = [
  { value: 60, label: "60 GSM", category: "Lightweight", description: "Newsprint, inserts" },
  { value: 80, label: "80 GSM", category: "Lightweight", description: "Office paper, flyers" },
  { value: 90, label: "90 GSM", category: "Standard", description: "Magazines, catalogs" },
  { value: 115, label: "115 GSM", category: "Standard", description: "Brochures, covers" },
  { value: 130, label: "130 GSM", category: "Medium", description: "Quality magazines" },
  { value: 150, label: "150 GSM", category: "Medium", description: "Postcards, covers" },
  { value: 170, label: "170 GSM", category: "Heavy", description: "Business cards" },
  { value: 200, label: "200 GSM", category: "Heavy", description: "Thick covers" },
  { value: 250, label: "250 GSM", category: "Card Stock", description: "Premium covers" },
  { value: 300, label: "300 GSM", category: "Card Stock", description: "Rigid cards" },
]

const PAPER_BRANDS = [
  "Mohawk",
  "Neenah",
  "Sappi",
  "International Paper",
  "Domtar",
  "UPM",
  "Stora Enso",
  "Mondi",
  "Generic",
]

const GRID_SPACING_PRESETS = [
  { name: "None", gutterX: 0, gutterY: 0 },
  { name: "Tight", gutterX: 2, gutterY: 2 },
  { name: "Normal", gutterX: 5, gutterY: 5 },
  { name: "Wide", gutterX: 10, gutterY: 10 },
]

const GRID_COLOR_PRESETS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
  { name: "Black", value: "#000000" },
]

export function GridControls({ config, onChange }: GridControlsProps) {
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

  const handleSpacingPreset = (preset: (typeof GRID_SPACING_PRESETS)[0]) => {
    onChange({
      gutterX: preset.gutterX,
      gutterY: preset.gutterY,
    })
  }

  const handleColorChange = (color: string) => {
    onChange({ gridLineColor: color })
  }

  const selectedPaperType = PAPER_TYPES.find((type) => type.id === config.paperType) || PAPER_TYPES[0]
  const selectedGSM = GSM_OPTIONS.find((gsm) => gsm.value === config.gsm) || GSM_OPTIONS[2]

  // Calculate spine width based on page count and GSM
  const calculateSpineWidth = (pages: number, gsm: number) => {
    return Math.max((pages * gsm * 0.8) / 1000, 3) // minimum 3mm spine
  }

  const spineWidth = calculateSpineWidth(config.pageCount, config.gsm)
  const currentWidth = config.pageSize === "custom" ? config.customWidth : currentPageSize.width
  const currentHeight = config.pageSize === "custom" ? config.customHeight : currentPageSize.height
  const orientation = getOrientation(currentWidth, currentHeight)
  const orientationIcon = getOrientationIcon(currentWidth, currentHeight)

  return (
    <div className="space-y-6">
      {/* Page Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
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

          {/* Page Count */}
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
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded flex items-center gap-2">
            <span className="text-lg">{config.spreadView ? "📖" : orientationIcon}</span>
            <div>
              <div className="font-medium capitalize">
                {config.spreadView ? "Spread Layout" : `${orientation} Format`}
              </div>
              <div>
                {config.spreadView
                  ? `${formatDimensions(currentWidth * 2 + config.bindingGutter, currentHeight)} (spread)`
                  : formatDimensions(currentWidth, currentHeight)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paper Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Paper Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PAPER_TYPES.map((paperType) => {
              const Icon = paperType.icon
              const isSelected = config.paperType === paperType.id
              const isRecommended = paperType.recommended.includes(config.contentType)

              return (
                <button
                  key={paperType.id}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected ? paperType.color + " border-current" : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onChange({ paperType: paperType.id as any })}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{paperType.name}</span>
                    {isRecommended && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-75">{paperType.description}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paper Weight (GSM) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Paper Weight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="gsm-select">GSM (Grams per Square Meter)</Label>
            <Select value={config.gsm.toString()} onValueChange={(value) => onChange({ gsm: Number.parseInt(value) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GSM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {option.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-1">Weight Guide</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• 60-80 GSM: Lightweight (newspapers, inserts)</div>
              <div>• 90-115 GSM: Standard (magazines, brochures)</div>
              <div>• 130-170 GSM: Medium (quality publications)</div>
              <div>• 200+ GSM: Heavy (covers, cards)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paper Brand */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Paper Brand</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={config.paperBrand} onValueChange={(value) => onChange({ paperBrand: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select paper brand" />
            </SelectTrigger>
            <SelectContent>
              {PAPER_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Paper Specifications Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Paper Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{selectedPaperType.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium">
              {selectedGSM.label} ({selectedGSM.category})
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Brand:</span>
            <span className="font-medium">{config.paperBrand || "Not selected"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pages:</span>
            <span className="font-medium">{config.pageCount}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground">Calculated Spine:</span>
            <span className="font-medium text-blue-600">{spineWidth.toFixed(1)}mm</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid Definition Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Grid Definition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Definition Mode</Label>
            <Select
              value={config.gridSizeMode}
              onValueChange={(value: "count" | "size") => onChange({ gridSizeMode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">By Column/Row Count</SelectItem>
                <SelectItem value="size">By Physical Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.gridSizeMode === "count" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Columns: {config.columns}</Label>
                <Slider
                  value={[config.columns]}
                  onValueChange={([value]) => onChange({ columns: value })}
                  min={1}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Rows: {config.rows}</Label>
                <Slider
                  value={[config.rows]}
                  onValueChange={([value]) => onChange({ rows: value })}
                  min={1}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cell Width: {config.gridCellWidth}mm</Label>
                <Slider
                  value={[config.gridCellWidth]}
                  onValueChange={([value]) => onChange({ gridCellWidth: value })}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Cell Height: {config.gridCellHeight}mm</Label>
                <Slider
                  value={[config.gridCellHeight]}
                  onValueChange={([value]) => onChange({ gridCellHeight: value })}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Grid Spacing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>H-Gutter: {config.gutterX}mm</Label>
              <Slider
                value={[config.gutterX]}
                onValueChange={([value]) => onChange({ gutterX: value })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>V-Gutter: {config.gutterY}mm</Label>
              <Slider
                value={[config.gutterY]}
                onValueChange={([value]) => onChange({ gutterY: value })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Spacing Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {GRID_SPACING_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={
                    config.gutterX === preset.gutterX && config.gutterY === preset.gutterY ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSpacingPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Grid Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid" className="flex items-center gap-2 text-sm">
              {config.showGridLines ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Show Grid Lines
            </Label>
            <Switch
              id="show-grid"
              checked={config.showGridLines}
              onCheckedChange={(checked) => onChange({ showGridLines: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="snap-grid" className="text-sm">
              Snap to Grid
            </Label>
            <Switch
              id="snap-grid"
              checked={config.snapToGrid}
              onCheckedChange={(checked) => onChange({ snapToGrid: checked })}
            />
          </div>

          {config.showGridLines && (
            <>
              <div className="space-y-2">
                <Label>Grid Line Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {GRID_COLOR_PRESETS.map((color) => (
                    <Button
                      key={color.value}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 p-0 border-2 bg-transparent"
                      style={{
                        backgroundColor: color.value,
                        borderColor: config.gridLineColor === color.value ? "#000" : "transparent",
                      }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                    >
                      {config.gridLineColor === color.value && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.gridLineColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <span className="text-sm text-muted-foreground">{config.gridLineColor}</span>
              </div>

              <div className="space-y-2">
                <Label>Grid Line Opacity: {Math.round(config.gridLineOpacity * 100)}%</Label>
                <Slider
                  value={[config.gridLineOpacity]}
                  onValueChange={([value]) => onChange({ gridLineOpacity: value })}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
