"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Type } from "lucide-react"
import type { LayoutConfig } from "@/types/layout"

interface TypographyControlsProps {
  config: LayoutConfig
  onChange: (config: Partial<LayoutConfig>) => void
}

const FONT_OPTIONS = [
  { id: "bookerly", name: "Bookerly", category: "serif" },
  { id: "minion-pro", name: "Minion Pro", category: "serif" },
  { id: "garamond", name: "Adobe Garamond Pro", category: "serif" },
  { id: "caslon", name: "Adobe Caslon Pro", category: "serif" },
  { id: "times", name: "Times New Roman", category: "serif" },
  { id: "georgia", name: "Georgia", category: "serif" },
  { id: "helvetica", name: "Helvetica Neue", category: "sans-serif" },
  { id: "futura", name: "Futura", category: "sans-serif" },
  { id: "avenir", name: "Avenir Next", category: "sans-serif" },
  { id: "proxima", name: "Proxima Nova", category: "sans-serif" },
  { id: "open-sans", name: "Open Sans", category: "sans-serif" },
  { id: "source-sans", name: "Source Sans Pro", category: "sans-serif" },
]

export function TypographyControls({ config, onChange }: TypographyControlsProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Typography
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Font */}
        <div className="space-y-2">
          <Label>Primary Font</Label>
          <Select value={config.primaryFont} onValueChange={(value) => onChange({ primaryFont: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Serif Fonts</div>
              {FONT_OPTIONS.filter((font) => font.category === "serif").map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  <span style={{ fontFamily: font.name }}>{font.name}</span>
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Sans-Serif Fonts</div>
              {FONT_OPTIONS.filter((font) => font.category === "sans-serif").map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  <span style={{ fontFamily: font.name }}>{font.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Base Typography Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Base Font Size: {config.baseFontSize}pt</Label>
              <Slider
                value={[config.baseFontSize]}
                onValueChange={([value]) => onChange({ baseFontSize: value })}
                min={8}
                max={18}
                step={0.5}
              />
            </div>
            <div className="space-y-2">
              <Label>Base Leading: {config.baseLeading}pt</Label>
              <Slider
                value={[config.baseLeading]}
                onValueChange={([value]) => onChange({ baseLeading: value })}
                min={10}
                max={24}
                step={0.5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paragraph Spacing: {config.paragraphSpacing}pt</Label>
            <Slider
              value={[config.paragraphSpacing]}
              onValueChange={([value]) => onChange({ paragraphSpacing: value })}
              min={0}
              max={18}
              step={0.5}
            />
          </div>
        </div>

        {/* Advanced Typography */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Advanced Typography</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="hyphenation">Enable Hyphenation</Label>
            <Switch
              id="hyphenation"
              checked={config.enableHyphenation}
              onCheckedChange={(checked) => onChange({ enableHyphenation: checked })}
            />
          </div>

          {config.enableHyphenation && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Hyphenation Zone: {config.hyphenationZone}mm</Label>
                <Slider
                  value={[config.hyphenationZone]}
                  onValueChange={([value]) => onChange({ hyphenationZone: value })}
                  min={5}
                  max={25}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Consecutive Hyphens: {config.maxConsecutiveHyphens}</Label>
                <Slider
                  value={[config.maxConsecutiveHyphens]}
                  onValueChange={([value]) => onChange({ maxConsecutiveHyphens: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="justification">Enable Justification</Label>
            <Switch
              id="justification"
              checked={config.enableJustification}
              onCheckedChange={(checked) => onChange({ enableJustification: checked })}
            />
          </div>

          {config.enableJustification && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Word Spacing: {config.wordSpacing}%</Label>
                <Slider
                  value={[config.wordSpacing]}
                  onValueChange={([value]) => onChange({ wordSpacing: value })}
                  min={80}
                  max={120}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Letter Spacing: {config.letterSpacing}%</Label>
                <Slider
                  value={[config.letterSpacing]}
                  onValueChange={([value]) => onChange({ letterSpacing: value })}
                  min={-5}
                  max={5}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Glyph Scaling: {config.glyphScaling}%</Label>
                <Slider
                  value={[config.glyphScaling]}
                  onValueChange={([value]) => onChange({ glyphScaling: value })}
                  min={95}
                  max={105}
                  step={1}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="orphan-control">Orphan & Widow Control</Label>
            <Switch
              id="orphan-control"
              checked={config.enableOrphanControl}
              onCheckedChange={(checked) => onChange({ enableOrphanControl: checked })}
            />
          </div>
        </div>

        {/* Typography Preview */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium mb-2 block">Typography Preview</Label>
          <div className="space-y-2 text-sm">
            <div
              style={{
                fontFamily: config.primaryFont,
                fontSize: `${config.baseFontSize}px`,
                lineHeight: `${config.baseLeading}px`,
                textAlign: config.enableJustification ? "justify" : "left",
                wordSpacing: `${(config.wordSpacing - 100) * 0.01}em`,
                letterSpacing: `${config.letterSpacing * 0.01}em`,
              }}
            >
              <div className="font-bold text-lg mb-1">Headline Style</div>
              <div className="font-semibold mb-1">Subheading Style</div>
              <div className="mb-2">
                This is body text showing how the typography settings affect readability and spacing. The quick brown
                fox jumps over the lazy dog.
              </div>
              <div className="text-xs italic">Caption text style for image descriptions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
