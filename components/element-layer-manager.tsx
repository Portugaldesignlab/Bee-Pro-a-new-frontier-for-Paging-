"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Layers, Eye, EyeOff, Lock, Unlock, ImageIcon, FileText, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react"
import type { LayoutElement, TextStyle, ImageAlignment, ContentRole } from "@/types/layout"

interface ElementLayerManagerProps {
  elements: LayoutElement[]
  onUpdateElement: (elementId: string, updates: Partial<LayoutElement>) => void
  onDeleteElement: (elementId: string) => void
  onAddElement: (element: Partial<LayoutElement>) => void
  onReorderElement: (elementId: string, direction: "up" | "down") => void
}

const TEXT_STYLES: { value: TextStyle; label: string }[] = [
  { value: "headline", label: "Headline" },
  { value: "subhead", label: "Subhead" },
  { value: "body", label: "Body Text" },
  { value: "caption", label: "Caption" },
  { value: "quote", label: "Quote" },
  { value: "byline", label: "Byline" },
]

const IMAGE_ALIGNMENTS: { value: ImageAlignment; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
]

const CONTENT_ROLES: { value: ContentRole; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "subtitle", label: "Subtitle" },
  { value: "hero-image", label: "Hero Image" },
  { value: "body-text", label: "Body Text" },
  { value: "caption", label: "Caption" },
  { value: "quote", label: "Quote" },
  { value: "byline", label: "Byline" },
  { value: "barcode", label: "Barcode" },
  { value: "issue-info", label: "Issue Info" },
  { value: "page-number", label: "Page Number" },
  { value: "product-image", label: "Product Image" },
  { value: "product-specs", label: "Product Specs" },
  { value: "price", label: "Price" },
  { value: "call-to-action", label: "Call to Action" },
  { value: "portrait", label: "Portrait" },
  { value: "question", label: "Question" },
  { value: "answer", label: "Answer" },
  { value: "pull-quote", label: "Pull Quote" },
]

export function ElementLayerManager({
  elements,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onReorderElement,
}: ElementLayerManagerProps) {
  const sortedElements = [...elements].sort((a, b) => (b.layer || 0) - (a.layer || 0))

  const handleLayerNameChange = (elementId: string, layerName: string) => {
    onUpdateElement(elementId, { layerName })
  }

  const handleToggleLock = (elementId: string, locked: boolean) => {
    onUpdateElement(elementId, { locked })
  }

  const handleToggleVisibility = (elementId: string, hidden: boolean) => {
    onUpdateElement(elementId, { hidden })
  }

  const handleContentRoleChange = (elementId: string, contentRole: ContentRole) => {
    onUpdateElement(elementId, { contentRole })
  }

  const handleTextStyleChange = (elementId: string, textStyle: TextStyle) => {
    onUpdateElement(elementId, { textStyle })
  }

  const handleImageAlignmentChange = (elementId: string, imageAlignment: ImageAlignment) => {
    onUpdateElement(elementId, { imageAlignment })
  }

  const handlePriorityChange = (elementId: string, priority: number) => {
    onUpdateElement(elementId, { priority })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4" />
          Layer Manager
          <Badge variant="secondary" className="ml-auto">
            {elements.length} layers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Element */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement({ type: "text", contentRole: "body-text" })}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement({ type: "image", contentRole: "hero-image" })}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Image
          </Button>
        </div>

        <Separator />

        {/* Layer List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No elements yet</p>
              <p className="text-xs">Generate a layout to see layers</p>
            </div>
          ) : (
            sortedElements.map((element, index) => (
              <div key={element.id} className="space-y-3 p-3 border rounded-lg bg-muted/30">
                {/* Layer Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {element.type === "image" ? (
                      <ImageIcon className="h-4 w-4 text-purple-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium">Layer {(element.layer || 0) + 1}</span>
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReorderElement(element.id, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReorderElement(element.id, "down")}
                      disabled={index === sortedElements.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(element.id, !element.hidden)}
                      className="h-6 w-6 p-0"
                    >
                      {element.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLock(element.id, !element.locked)}
                      className="h-6 w-6 p-0"
                    >
                      {element.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteElement(element.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Layer Name */}
                <div className="space-y-1">
                  <Label className="text-xs">Layer Name</Label>
                  <Input
                    value={element.layerName || element.id}
                    onChange={(e) => handleLayerNameChange(element.id, e.target.value)}
                    placeholder="Enter layer name..."
                    className="h-7 text-xs"
                  />
                </div>

                {/* Content Role */}
                <div className="space-y-1">
                  <Label className="text-xs">Content Role</Label>
                  <Select
                    value={element.contentRole || "body-text"}
                    onValueChange={(value: ContentRole) => handleContentRoleChange(element.id, value)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type-specific controls */}
                {element.type === "text" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Text Style</Label>
                    <Select
                      value={element.textStyle || "body"}
                      onValueChange={(value: TextStyle) => handleTextStyleChange(element.id, value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {element.type === "image" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Image Alignment</Label>
                    <Select
                      value={element.imageAlignment || "center"}
                      onValueChange={(value: ImageAlignment) => handleImageAlignmentChange(element.id, value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_ALIGNMENTS.map((alignment) => (
                          <SelectItem key={alignment.value} value={alignment.value}>
                            {alignment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-xs">Priority (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={element.priority || 5}
                    onChange={(e) => handlePriorityChange(element.id, Number.parseInt(e.target.value) || 5)}
                    className="h-7 text-xs"
                  />
                </div>

                {/* Element Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Position: {element.x?.toFixed(1)}%, {element.y?.toFixed(1)}%
                  </div>
                  <div>
                    Size: {element.width?.toFixed(1)}% × {element.height?.toFixed(1)}%
                  </div>
                  <div>
                    Grid: {element.gridX},{element.gridY} ({element.gridWidth}×{element.gridHeight})
                  </div>
                  {element.page && <div>Page: {element.page}</div>}
                  {element.spreadElement && (
                    <Badge variant="outline" className="text-xs">
                      Spread Element
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
