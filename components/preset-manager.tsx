"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, Save, Trash2 } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"
import { getOrientationIcon, formatDimensions } from "@/lib/page-sizes"

interface PresetManagerProps {
  config: LayoutConfig
  onLoadPreset: (config: LayoutConfig) => void
  onSavePreset: (name: string, config: LayoutConfig) => void
}

const defaultPresets: Record<string, LayoutConfig> = {
  "Editorial Magazine": {
    pageSize: "A4",
    customWidth: 210,
    customHeight: 297,
    pageCount: 1,
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 20,
    marginRight: 20,
    bleed: 3,
    gsm: 170,
    bindingType: "perfect",
    imageCount: 2,
    textCount: 6,
    aestheticRule: "golden-ratio",
    gridSystem: "modular",
    columns: 8,
    rows: 12,
    gutterX: 4,
    gutterY: 6,
  },
  "Art Book Portrait": {
    pageSize: "art-book",
    customWidth: 229,
    customHeight: 305,
    pageCount: 1,
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 25,
    marginRight: 25,
    bleed: 5,
    gsm: 200,
    bindingType: "casebound",
    imageCount: 4,
    textCount: 2,
    aestheticRule: "rule-of-thirds",
    gridSystem: "fibonacci",
    columns: 6,
    rows: 8,
    gutterX: 8,
    gutterY: 10,
  },
  "Coffee Table Book": {
    pageSize: "coffee-table",
    customWidth: 305,
    customHeight: 254,
    pageCount: 1,
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    bleed: 5,
    gsm: 200,
    bindingType: "casebound",
    imageCount: 6,
    textCount: 3,
    aestheticRule: "golden-ratio",
    gridSystem: "fibonacci",
    columns: 8,
    rows: 6,
    gutterX: 6,
    gutterY: 8,
  },
  "Photo Book Landscape": {
    pageSize: "photo-book",
    customWidth: 280,
    customHeight: 210,
    pageCount: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    bleed: 3,
    gsm: 170,
    bindingType: "perfect",
    imageCount: 8,
    textCount: 2,
    aestheticRule: "rule-of-thirds",
    gridSystem: "uniform",
    columns: 10,
    rows: 6,
    gutterX: 5,
    gutterY: 5,
  },
  "Trade Paperback": {
    pageSize: "trade-paperback",
    customWidth: 152,
    customHeight: 229,
    pageCount: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 18,
    marginRight: 12,
    bleed: 3,
    gsm: 80,
    bindingType: "perfect",
    imageCount: 1,
    textCount: 8,
    aestheticRule: "modular",
    gridSystem: "uniform",
    columns: 4,
    rows: 12,
    gutterX: 3,
    gutterY: 4,
  },
  "Children's Book": {
    pageSize: "children-landscape",
    customWidth: 254,
    customHeight: 203,
    pageCount: 1,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    bleed: 3,
    gsm: 150,
    bindingType: "saddle",
    imageCount: 5,
    textCount: 3,
    aestheticRule: "rule-of-thirds",
    gridSystem: "uniform",
    columns: 8,
    rows: 6,
    gutterX: 4,
    gutterY: 4,
  },
  "Square Instagram Book": {
    pageSize: "instagram-book",
    customWidth: 210,
    customHeight: 210,
    pageCount: 1,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    bleed: 3,
    gsm: 170,
    bindingType: "perfect",
    imageCount: 9,
    textCount: 1,
    aestheticRule: "rule-of-thirds",
    gridSystem: "uniform",
    columns: 6,
    rows: 6,
    gutterX: 3,
    gutterY: 3,
  },
  Calendar: {
    pageSize: "calendar",
    customWidth: 297,
    customHeight: 210,
    pageCount: 1,
    marginTop: 10,
    marginBottom: 25,
    marginLeft: 15,
    marginRight: 15,
    bleed: 3,
    gsm: 200,
    bindingType: "spiral",
    imageCount: 1,
    textCount: 12,
    aestheticRule: "golden-ratio",
    gridSystem: "uniform",
    columns: 7,
    rows: 8,
    gutterX: 2,
    gutterY: 2,
  },
}

export function PresetManager({ config, onLoadPreset, onSavePreset }: PresetManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [savedPresets, setSavedPresets] = useState<Record<string, LayoutConfig>>({})

  const handleSavePreset = () => {
    if (presetName.trim()) {
      setSavedPresets((prev) => ({
        ...prev,
        [presetName]: config,
      }))
      onSavePreset(presetName, config)
      setPresetName("")
    }
  }

  const handleDeletePreset = (name: string) => {
    setSavedPresets((prev) => {
      const newPresets = { ...prev }
      delete newPresets[name]
      return newPresets
    })
  }

  const allPresets = { ...defaultPresets, ...savedPresets }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bookmark className="h-4 w-4 mr-2" />
          Presets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Layout Presets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Preset */}
          <div className="space-y-2">
            <Label>Save Current Layout</Label>
            <div className="flex gap-2">
              <Input placeholder="Preset name..." value={presetName} onChange={(e) => setPresetName(e.target.value)} />
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Available Presets */}
          <div className="space-y-2">
            <Label>Available Presets</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(allPresets).map(([name, presetConfig]) => {
                const width = presetConfig.pageSize === "custom" ? presetConfig.customWidth : presetConfig.customWidth
                const height =
                  presetConfig.pageSize === "custom" ? presetConfig.customHeight : presetConfig.customHeight
                const orientationIcon = getOrientationIcon(width, height)

                return (
                  <div key={name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span>{orientationIcon}</span>
                        {name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDimensions(width, height)} • {presetConfig.columns}×{presetConfig.rows} •{" "}
                        {presetConfig.imageCount}
                        img + {presetConfig.textCount}txt
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onLoadPreset(presetConfig)
                          setIsOpen(false)
                        }}
                      >
                        Load
                      </Button>
                      {savedPresets[name] && (
                        <Button size="sm" variant="outline" onClick={() => handleDeletePreset(name)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
