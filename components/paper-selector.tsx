"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Newspaper, Book, Package } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"

interface PaperSelectorProps {
  config: LayoutConfig
  onChange: (updates: Partial<LayoutConfig>) => void
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

export function PaperSelector({ config, onChange }: PaperSelectorProps) {
  const selectedPaperType = PAPER_TYPES.find((type) => type.id === config.paperType) || PAPER_TYPES[0]
  const selectedGSM = GSM_OPTIONS.find((gsm) => gsm.value === config.gsm) || GSM_OPTIONS[2]

  // Calculate spine width based on page count and GSM
  const calculateSpineWidth = (pages: number, gsm: number) => {
    return Math.max((pages * gsm * 0.8) / 1000, 3) // minimum 3mm spine
  }

  const spineWidth = calculateSpineWidth(config.pageCount, config.gsm)

  return (
    <div className="space-y-4">
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
    </div>
  )
}
