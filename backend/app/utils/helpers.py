import io
import base64
from typing import Dict, Any, List
from bson import ObjectId

def format_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Formats MongoDB document converting _id to id string."""
    if not doc:
        return doc
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res["_id"])
        del res["_id"]
    return res

def format_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [format_doc(d) for d in docs]

def paginate_data(items: List[Any], page: int = 1, limit: int = 10) -> Dict[str, Any]:
    total = len(items)
    pages = (total + limit - 1) // limit if limit > 0 else 1
    start = (page - 1) * limit
    end = start + limit
    paginated_items = items[start:end]
    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

def generate_qr_code_svg(order_id: str, grand_total: float, customer_name: str) -> str:
    """Generates an inline SVG payload representing an Order Verification QR Code."""
    text_content = f"QUICKBITE|ORDER:{order_id}|AMT:{grand_total}|USER:{customer_name}"
    # Simple clean SVG QR Code mock representation
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160">
        <rect width="100" height="100" fill="#FFFFFF"/>
        <rect x="5" y="5" width="30" height="30" fill="#111827"/>
        <rect x="10" y="10" width="20" height="20" fill="#FFFFFF"/>
        <rect x="15" y="15" width="10" height="10" fill="#FF6B00"/>
        
        <rect x="65" y="5" width="30" height="30" fill="#111827"/>
        <rect x="70" y="10" width="20" height="20" fill="#FFFFFF"/>
        <rect x="75" y="15" width="10" height="10" fill="#FF6B00"/>
        
        <rect x="5" y="65" width="30" height="30" fill="#111827"/>
        <rect x="10" y="70" width="20" height="20" fill="#FFFFFF"/>
        <rect x="15" y="75" width="10" height="10" fill="#FF6B00"/>
        
        <rect x="40" y="40" width="20" height="20" fill="#FF6B00"/>
        <rect x="45" y="10" width="10" height="20" fill="#111827"/>
        <rect x="70" y="45" width="20" height="10" fill="#111827"/>
        <rect x="45" y="70" width="15" height="15" fill="#111827"/>
        <rect x="70" y="70" width="20" height="20" fill="#111827"/>
    </svg>'''
    encoded = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{encoded}"
