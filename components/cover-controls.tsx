"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { BookOpen } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"

interface CoverControlsProps {
  config: LayoutConfig
  onChange: (config: Partial<LayoutConfig>) => void
}

export function CoverControls({ config, onChange }: CoverControlsProps) {
  const spineWidth = Math.max(((config.pageCount * config.gsm) / 1000) * 0.8, 3) // Standard spine calculation

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Cover Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spine Information */}
        <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Calculated Spine</Label>
            <div className="text-sm font-mono">{spineWidth.toFixed(1)}mm</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Based on {config.pageCount} pages × {config.gsm}gsm paper
          </div>
        </div>

        <Separator />

        {/* Cover Margins */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Cover Margins</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Top: {config.coverMarginTop || config.marginTop}mm</Label>
              <Slider
                value={[config.coverMarginTop || config.marginTop]}
                onValueChange={([value]) => onChange({ coverMarginTop: value })}
                min={5}
                max={50}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Bottom: {config.coverMarginBottom || config.marginBottom}mm</Label>
              <Slider
                value={[config.coverMarginBottom || config.marginBottom]}
                onValueChange={([value]) => onChange({ coverMarginBottom: value })}
                min={5}
                max={50}
                step={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Inner: {config.coverMarginInner || config.marginInner}mm</Label>
              <Slider
                value={[config.coverMarginInner || config.marginInner]}
                onValueChange={([value]) => onChange({ coverMarginInner: value })}
                min={10}
                max={60}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Outer: {config.coverMarginOuter || config.marginOuter}mm</Label>
              <Slider
                value={[config.coverMarginOuter || config.marginOuter]}
                onValueChange={([value]) => onChange({ coverMarginOuter: value })}
                min={5}
                max={50}
                step={1}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Cover Bleed */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Cover Bleed</h3>

          <div className="space-y-2">
            <Label>Bleed: {config.coverBleed || config.bleed}mm</Label>
            <Slider
              value={[config.coverBleed || config.bleed]}
              onValueChange={([value]) => onChange({ coverBleed: value })}
              min={0}
              max={10}
              step={0.5}
            />
          </div>

          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
            Cover bleed extends beyond the trim line for printing safety
          </div>
        </div>

        <Separator />

        {/* Cover Elements */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Cover Elements</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Back Cover</span>
              <div className="text-xs text-muted-foreground">Element 1</div>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Spine</span>
              <div className="text-xs text-muted-foreground">Element 2</div>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Front Cover</span>
              <div className="text-xs text-muted-foreground">Element 3</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
