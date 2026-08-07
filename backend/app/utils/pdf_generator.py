import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_invoice(order_data: dict) -> bytes:
    """Generates a PDF invoice for an order."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#FF6B00'),
        spaceAfter=10
    )
    normal_style = styles['Normal']
    bold_style = ParagraphStyle('BoldStyle', parent=normal_style, fontName='Helvetica-Bold')

    # Title Banner
    story.append(Paragraph("<b>QUICKBITE INVOICE</b>", header_style))
    story.append(Paragraph(f"<b>Order ID:</b> #{order_data.get('id', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Date:</b> {order_data.get('created_at', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Customer:</b> {order_data.get('customer_name', 'Customer')}", normal_style))
    story.append(Paragraph(f"<b>Delivery Address:</b> {order_data.get('delivery_address', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Payment Method:</b> {order_data.get('payment_method', 'Demo Payment').upper()}", normal_style))
    story.append(Paragraph(f"<b>Order Status:</b> {order_data.get('status', 'PENDING').upper()}", normal_style))
    story.append(Spacer(1, 15))

    # Items Table Header
    table_data = [["Item", "Quantity", "Unit Price", "Total"]]
    for item in order_data.get("items", []):
        table_data.append([
            item.get("name", "Food Item"),
            str(item.get("quantity", 1)),
            f"₹{item.get('price', 0):.2f}",
            f"₹{item.get('price', 0) * item.get('quantity', 1):.2f}"
        ])

    table_data.append(["", "", "Subtotal:", f"₹{order_data.get('subtotal', 0):.2f}"])
    table_data.append(["", "", "GST (5%):", f"₹{order_data.get('gst', 0):.2f}"])
    table_data.append(["", "", "Delivery Charge:", f"₹{order_data.get('delivery_charge', 0):.2f}"])
    if order_data.get("discount", 0) > 0:
        table_data.append(["", "", "Discount:", f"-₹{order_data.get('discount', 0):.2f}"])
    table_data.append(["", "", "Grand Total:", f"₹{order_data.get('grand_total', 0):.2f}"])

    t = Table(table_data, colWidths=[240, 70, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('FONTNAME', (-2, -5), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (-2, -1), (-1, -1), colors.HexColor('#FF6B00')),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(Paragraph("Thank you for ordering with QuickBite!", ParagraphStyle('FooterStyle', alignment=1, textColor=colors.gray)))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
