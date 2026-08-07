from pydantic import BaseModel
from typing import List, Dict, Any

class AnalyticsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_restaurants: int
    total_menu_items: int
    monthly_sales: List[Dict[str, Any]]
    top_selling_items: List[Dict[str, Any]]
    recent_orders: List[Dict[str, Any]]
