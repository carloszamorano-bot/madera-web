import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PRIMARY = '#E8401C'
const ACCENT = '#F5A623'
const TEXT = '#1A1A1A'
const GRAY = '#9E9E9E'

export class PdfBuilder {
  private doc: jsPDF
  private y: number
  private margin: number
  private pageW: number
  private pageH: number

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' })
    this.margin = 15
    this.pageW = this.doc.internal.pageSize.getWidth()
    this.pageH = this.doc.internal.pageSize.getHeight()
    this.y = this.margin
  }

  // ── Primitives ────────────────────────────────────────────────────────────

  newPage(): this {
    this.doc.addPage()
    this.y = this.margin
    return this
  }

  spaceY(dy: number): this {
    this.y += dy
    return this
  }

  checkPageBreak(needed: number): this {
    if (this.y + needed > this.pageH - this.margin) {
      this.newPage()
    }
    return this
  }

  drawText(
    text: string,
    opts: {
      x?: number
      size?: number
      bold?: boolean
      color?: string
      align?: 'left' | 'center' | 'right'
    } = {}
  ): this {
    const { x = this.margin, size = 10, bold = false, color = TEXT, align = 'left' } = opts
    this.doc.setFontSize(size)
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    this.doc.setTextColor(color)
    this.doc.text(text, align === 'center' ? this.pageW / 2 : x, this.y, { align })
    this.y += size * 0.4 + 2
    return this
  }

  drawLine(color: string = '#DDDDDD'): this {
    this.doc.setDrawColor(color)
    this.doc.setLineWidth(0.3)
    this.doc.line(this.margin, this.y, this.pageW - this.margin, this.y)
    this.y += 3
    return this
  }

  drawImage(imgData: string, opts: { maxW?: number; centered?: boolean } = {}): this {
    const { maxW = this.pageW - 2 * this.margin, centered = true } = opts
    const img = new Image()
    img.src = imgData
    const ratio = img.naturalHeight / img.naturalWidth
    const w = Math.min(maxW, this.pageW - 2 * this.margin)
    const h = w * ratio
    this.checkPageBreak(h + 4)
    const x = centered ? (this.pageW - w) / 2 : this.margin
    this.doc.addImage(imgData, 'PNG', x, this.y, w, h)
    this.y += h + 4
    return this
  }

  drawTable(headers: string[], rows: string[][]): this {
    autoTable(this.doc, {
      head: [headers],
      body: rows,
      startY: this.y,
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: PRIMARY,
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: TEXT },
      alternateRowStyles: { fillColor: '#F9F9F9' },
      didDrawPage: (data) => {
        this.y = data.cursor?.y ?? this.y
      },
    })
    this.y = (this.doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? this.y
    this.y += 4
    return this
  }

  drawHeader(title: string, subtitle?: string): this {
    // Orange header bar
    this.doc.setFillColor(PRIMARY)
    this.doc.rect(0, 0, this.pageW, 20, 'F')
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor('#FFFFFF')
    this.doc.text(title, this.margin, 13)
    if (subtitle) {
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(subtitle, this.pageW - this.margin, 13, { align: 'right' })
    }
    this.y = 28
    return this
  }

  download(fileName: string): void {
    this.doc.save(fileName)
  }

  getDataUri(): string {
    return this.doc.output('datauristring')
  }
}
