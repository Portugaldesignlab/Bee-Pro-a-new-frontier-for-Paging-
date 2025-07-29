"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Grid3X3 } from "lucide-react"

interface GutterControlsProps {
  showGutters: boolean
  onToggleGutters: (show: boolean) => void
  showMargins: boolean
  onToggleMargins: (show: boolean) => void
  gutterX: number
  gutterY: number
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

export function GutterControls({
  showGutters,
  onToggleGutters,
  showMargins,
  onToggleMargins,
  gutterX,
  gutterY,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
}: GutterControlsProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Grid3X3 className="h-4 w-4" />
          Layout Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Margin Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-margins" className="text-sm">
              Show Margin Zones
            </Label>
            <Switch id="show-margins" checked={showMargins} onCheckedChange={onToggleMargins} />
          </div>

          {showMargins && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-60"></div>
                <span>
                  Page margins: T:{marginTop}mm B:{marginBottom}mm L:{marginLeft}mm R:{marginRight}mm
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Gutter Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-gutters" className="text-sm">
              Show Gutter Zones
            </Label>
            <Switch id="show-gutters" checked={showGutters} onCheckedChange={onToggleGutters} />
          </div>

          {showGutters && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-sm opacity-60"></div>
                <span>Vertical gutters: {gutterX}mm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-sm opacity-60"></div>
                <span>Horizontal gutters: {gutterY}mm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm opacity-60"></div>
                <span>Gutter intersections</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
