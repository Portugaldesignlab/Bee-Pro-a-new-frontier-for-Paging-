"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { BookOpen, FileText, ImageIcon, ShoppingCart, MessageSquare, Camera, Zap } from "lucide-react"
import type { LayoutConfig, ContentType } from "@/types/layout"
import { CONTENT_TEMPLATES } from "@/lib/content-templates"

interface ContentTypeSelectorProps {
  config: LayoutConfig
  onChange: (config: Partial<LayoutConfig>) => void
}

const CONTENT_TYPE_ICONS = {
  "magazine-cover": BookOpen,
  "table-of-contents": FileText,
  "feature-spread": BookOpen,
  "interview-page": MessageSquare,
  "product-showcase": ShoppingCart,
  "article-page": FileText,
  "photo-essay": Camera,
  advertisement: Zap,
  custom: FileText,
}

export function ContentTypeSelector({ config, onChange }: ContentTypeSelectorProps) {
  const handleContentTypeChange = (contentType: ContentType) => {
    const template = CONTENT_TEMPLATES[contentType]
    if (template) {
      // Auto-calculate element counts based on template
      const imageElements = template.requiredElements.filter((el) => el.type === "image")
      const textElements = template.requiredElements.filter((el) => el.type === "text")

      onChange({
        contentType,
        imageCount: imageElements.length,
        textCount: textElements.length,
        enableSmartPlacement: true,
        // Set recommended aesthetic rule
        aestheticRule: template.aestheticRules[0] || config.aestheticRule,
      })
    } else {
      onChange({ contentType })
    }
  }

  const currentTemplate = CONTENT_TEMPLATES[config.contentType]
  const IconComponent = CONTENT_TYPE_ICONS[config.contentType] || FileText

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <IconComponent className="h-4 w-4" />
          Content Type & Smart Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Type Selector */}
        <div className="space-y-2">
          <Label>Layout Purpose</Label>
          <Select value={config.contentType} onValueChange={handleContentTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTENT_TEMPLATES).map(([key, template]) => {
                const Icon = CONTENT_TYPE_ICONS[key as ContentType] || FileText
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Custom Layout</div>
                    <div className="text-xs text-muted-foreground">Manual element placement</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Info */}
        {currentTemplate && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Template Elements</Label>
              <Badge variant="secondary">{currentTemplate.requiredElements.length} elements</Badge>
            </div>

            <div className="space-y-2">
              {currentTemplate.requiredElements.map((element, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {element.type === "image" ? (
                      <ImageIcon className="h-3 w-3 text-purple-600" />
                    ) : (
                      <FileText className="h-3 w-3 text-green-600" />
                    )}
                    <span className="capitalize">{element.role.replace("-", " ")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {element.required && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Required
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {element.defaultSize.width}×{element.defaultSize.height}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Priorities:</strong> {currentTemplate.layoutPriorities.join(", ")}
            </div>
          </div>
        )}

        {/* Smart Layout Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="smart-placement" className="text-sm">
              Enable Smart Placement
            </Label>
            <Switch
              id="smart-placement"
              checked={config.enableSmartPlacement}
              onCheckedChange={(checked) => onChange({ enableSmartPlacement: checked })}
            />
          </div>

          {config.enableSmartPlacement && (
            <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50">
              <div className="space-y-2">
                <Label>Layout Density: {config.layoutDensity}%</Label>
                <Slider
                  value={[config.layoutDensity]}
                  onValueChange={([value]) => onChange({ layoutDensity: value })}
                  min={20}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">
                  {config.layoutDensity < 40 && "Spacious - lots of white space"}
                  {config.layoutDensity >= 40 && config.layoutDensity < 70 && "Balanced - moderate spacing"}
                  {config.layoutDensity >= 70 && "Dense - tightly packed elements"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visual Guides */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visual Guides</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="rule-of-thirds" className="text-sm">
              Rule of Thirds Overlay
            </Label>
            <Switch
              id="rule-of-thirds"
              checked={config.showRuleOfThirds}
              onCheckedChange={(checked) => onChange({ showRuleOfThirds: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="golden-ratio" className="text-sm">
              Golden Ratio Overlay
            </Label>
            <Switch
              id="golden-ratio"
              checked={config.showGoldenRatio}
              onCheckedChange={(checked) => onChange({ showGoldenRatio: checked })}
            />
          </div>
        </div>

        {/* Content-Specific Tips */}
        {currentTemplate && (
          <div className="p-3 border rounded-lg bg-yellow-50/50">
            <div className="text-xs font-medium text-yellow-800 mb-1">💡 Layout Tips</div>
            <div className="text-xs text-yellow-700">
              {config.contentType === "magazine-cover" &&
                "Focus on visual impact and clear hierarchy. Hero image should dominate."}
              {config.contentType === "table-of-contents" &&
                "Prioritize readability and organization. Use consistent spacing."}
              {config.contentType === "feature-spread" &&
                "Create visual flow across pages. Use asymmetric layouts for drama."}
              {config.contentType === "interview-page" &&
                "Balance portrait with Q&A text. Use pull quotes for emphasis."}
              {config.contentType === "product-showcase" &&
                "Make product the hero. Keep specs clear and price prominent."}
              {config.contentType === "photo-essay" &&
                "Let images tell the story. Minimize text, maximize visual impact."}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
