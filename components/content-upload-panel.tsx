"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Type,
  ImageIcon,
} from "lucide-react"
import { WordDocumentParser, type ExtractedContent } from "@/lib/word-parser"
import type { LayoutConfig } from "@/types/layout"

interface ContentUploadPanelProps {
  config: LayoutConfig
  onContentExtracted: (content: ExtractedContent) => void
  onUseContent: (useContent: boolean) => void
  extractedContent: ExtractedContent | null
  isUsingContent: boolean
}

export function ContentUploadPanel({
  config,
  onContentExtracted,
  onUseContent,
  extractedContent,
  isUsingContent,
}: ContentUploadPanelProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Check file type
      if (!file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
        setUploadError("Please upload a .docx or .txt file")
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const content = await WordDocumentParser.parseDocument(file)
        onContentExtracted(content)
        console.log("📄 Content extracted:", content)
      } catch (error) {
        setUploadError("Failed to parse document. Please try again.")
        console.error("Upload error:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [onContentExtracted],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file) {
        const fakeEvent = {
          target: { files: [file] },
        } as React.ChangeEvent<HTMLInputElement>
        handleFileUpload(fakeEvent)
      }
    },
    [handleFileUpload],
  )

  const clearContent = () => {
    onContentExtracted(null as any)
    onUseContent(false)
    setUploadError(null)
  }

  const toggleUseContent = () => {
    onUseContent(!isUsingContent)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            Upload Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!extractedContent ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">{isUploading ? "Processing..." : "Upload Word Document"}</div>
                <div className="text-xs text-muted-foreground">Drag & drop or click to select (.docx, .txt)</div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Content Extracted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-8 px-2">
                    {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearContent}
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-bold text-blue-600">{extractedContent.metadata.wordCount}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-bold text-green-600">{extractedContent.metadata.paragraphCount}</div>
                  <div className="text-xs text-muted-foreground">Paragraphs</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-bold text-purple-600">{extractedContent.headings.length}</div>
                  <div className="text-xs text-muted-foreground">Headings</div>
                </div>
              </div>

              {/* Use Content Toggle */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <Label className="text-sm font-medium">Use Uploaded Content</Label>
                </div>
                <Button
                  variant={isUsingContent ? "default" : "outline"}
                  size="sm"
                  onClick={toggleUseContent}
                  className="h-8"
                >
                  {isUsingContent ? "Using Content" : "Use Lorem Ipsum"}
                </Button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{uploadError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Preview */}
      {extractedContent && showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {/* Title */}
                {extractedContent.title && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs">
                        Title
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold p-2 bg-blue-50 rounded">{extractedContent.title}</div>
                  </div>
                )}

                {/* Subtitle */}
                {extractedContent.subtitle && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs">
                        Subtitle
                      </Badge>
                    </div>
                    <div className="text-sm p-2 bg-green-50 rounded">{extractedContent.subtitle}</div>
                  </div>
                )}

                {/* Headings */}
                {extractedContent.headings.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs">
                        Headings ({extractedContent.headings.length})
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {extractedContent.headings.slice(0, 3).map((heading, index) => (
                        <div key={index} className="text-xs p-2 bg-purple-50 rounded">
                          {heading}
                        </div>
                      ))}
                      {extractedContent.headings.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{extractedContent.headings.length - 3} more headings
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paragraphs */}
                {extractedContent.paragraphs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs">
                        Paragraphs ({extractedContent.paragraphs.length})
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {extractedContent.paragraphs.slice(0, 2).map((paragraph, index) => (
                        <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                          {paragraph.substring(0, 100)}
                          {paragraph.length > 100 && "..."}
                        </div>
                      ))}
                      {extractedContent.paragraphs.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{extractedContent.paragraphs.length - 2} more paragraphs
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Captions */}
                {extractedContent.captions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs">
                        Captions ({extractedContent.captions.length})
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {extractedContent.captions.map((caption, index) => (
                        <div key={index} className="text-xs p-2 bg-orange-50 rounded">
                          {caption}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
