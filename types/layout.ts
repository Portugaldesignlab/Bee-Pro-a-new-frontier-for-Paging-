export interface LayoutConfig {
  // Page settings
  pageSize: string
  customWidth: number
  customHeight: number
  pageCount: number
  orientation?: "portrait" | "landscape"

  // Paper settings
  paperType?: string
  paperBrand?: string
  gsm: number

  // Margins
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  marginInner: number
  marginOuter: number

  // Grid settings
  columns: number
  rows: number
  gridSpacingX: number
  gridSpacingY: number
  gridSizeMode?: "count" | "size"
  gridCellWidth?: number
  gridCellHeight?: number
  gutterX: number
  gutterY: number

  // Visual settings
  showGridLines: boolean
  gridLineColor: string
  gridLineOpacity: number
  showRuleOfThirds?: boolean
  showGoldenRatio?: boolean
  snapToGrid: boolean

  // Typography
  primaryFont: string
  secondaryFont?: string
  baseFontSize: number
  baseLeading: number
  textColor?: string
  paragraphSpacing?: number
  enableHyphenation: boolean
  enableJustification: boolean
  enableOrphanControl: boolean
  wordSpacing: number
  letterSpacing: number
  glyphScaling: number
  hyphenationZone?: number
  maxConsecutiveHyphens?: number

  // Content
  imageCount: number
  textCount: number
  aestheticRule: string
  gridSystem: string
  contentType: string
  layoutDensity: number
  enableSmartPlacement: boolean

  // Spread settings
  spreadView: boolean
  bindingGutter?: number
  allowSpreadElements?: boolean

  // Binding and printing
  bindingType: string
  bleed: number
  coverBleed?: number

  // Cover margins (if different from inner pages)
  coverMarginTop?: number
  coverMarginBottom?: number
  coverMarginInner?: number
  coverMarginOuter?: number
}

export interface LayoutElement {
  id: string
  type: "text" | "image"
  x: number
  y: number
  width: number
  height: number
  page: number
  content?: string

  // Text-specific properties
  fontSize?: number
  fontFamily?: string
  fontWeight?: "normal" | "bold" | "500" | "600" | "700"
  color?: string
  backgroundColor?: string
  textAlign?: "left" | "center" | "right" | "justify"
  leading?: number
  letterSpacing?: number
  wordSpacing?: number
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  opacity?: number

  // Transform properties
  rotation?: number

  // State properties
  locked?: boolean
  hidden?: boolean
}

export interface GeneratedLayout {
  id: string
  elements: LayoutElement[]
  dimensions: {
    width: number
    height: number
    aspectRatio: number
  }
  metadata: {
    aestheticRule: string
    gridSystem: string
    generatedAt: Date
    elementCount: number
    isSpread: boolean
    contentType: string
  }
}

export interface PageSize {
  name: string
  width: number
  height: number
}

export interface GuidelineSettings {
  color: string
  opacity: number
  locked: boolean
  visible: boolean
  snapDistance: number
}
