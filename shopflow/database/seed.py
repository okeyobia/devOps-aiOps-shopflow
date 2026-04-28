import httpx
import time
import sys

PRODUCT_SERVICE_URL = "http://product-service:3003"

PRODUCTS = [
    {
        "name": "Classic White Linen Shirt",
        "description": "Breathable linen shirt perfect for warm days. Relaxed fit with a button-down collar.",
        "price": 49.99,
        "category": "Men's Clothing",
        "stock": 80,
        "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400",
    },
    {
        "name": "Slim Fit Chino Pants",
        "description": "Versatile slim fit chinos made from stretch cotton. Available in multiple colors.",
        "price": 64.99,
        "category": "Men's Clothing",
        "stock": 60,
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400",
    },
    {
        "name": "Merino Wool Crew Neck",
        "description": "Lightweight merino wool sweater. Naturally temperature-regulating and odor-resistant.",
        "price": 89.99,
        "category": "Men's Clothing",
        "stock": 45,
        "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    },
    {
        "name": "Floral Wrap Dress",
        "description": "Elegant wrap dress with a vibrant floral print. Flattering for all body types.",
        "price": 74.99,
        "category": "Women's Clothing",
        "stock": 55,
        "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    },
    {
        "name": "High-Waist Denim Jeans",
        "description": "Classic high-waist jeans with a straight leg cut. Made from premium stretch denim.",
        "price": 79.99,
        "category": "Women's Clothing",
        "stock": 70,
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
    },
    {
        "name": "Oversized Knit Cardigan",
        "description": "Cozy oversized cardigan in a chunky knit. Perfect for layering in autumn.",
        "price": 94.99,
        "category": "Women's Clothing",
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
    },
    {
        "name": "Silk Slip Midi Skirt",
        "description": "Luxurious silk slip skirt with a bias cut. Falls beautifully at midi length.",
        "price": 119.99,
        "category": "Women's Clothing",
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400",
    },
    {
        "name": "Leather Tote Bag",
        "description": "Spacious genuine leather tote with interior pockets. Fits a 15-inch laptop.",
        "price": 149.99,
        "category": "Bags",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    },
    {
        "name": "Canvas Crossbody Bag",
        "description": "Lightweight canvas crossbody with an adjustable strap. Great for everyday use.",
        "price": 39.99,
        "category": "Bags",
        "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    },
    {
        "name": "Minimalist Leather Sneakers",
        "description": "Clean, minimalist leather sneakers with a cushioned sole. Pairs with everything.",
        "price": 109.99,
        "category": "Shoes",
        "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    },
    {
        "name": "Block Heel Ankle Boots",
        "description": "Chic ankle boots with a stable block heel. Genuine suede upper.",
        "price": 134.99,
        "category": "Shoes",
        "stock": 28,
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    },
    {
        "name": "Polarised Aviator Sunglasses",
        "description": "Classic aviator frames with UV400 polarised lenses. Lightweight metal frame.",
        "price": 54.99,
        "category": "Accessories",
        "stock": 65,
        "image_url": "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400",
    },
    {
        "name": "Woven Leather Belt",
        "description": "Handcrafted woven leather belt with a brushed silver buckle. Unisex design.",
        "price": 34.99,
        "category": "Accessories",
        "stock": 90,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=400",
    },
    {
        "name": "Cashmere Beanie Hat",
        "description": "Ultra-soft cashmere beanie in a ribbed knit. Keeps you warm without the bulk.",
        "price": 44.99,
        "category": "Accessories",
        "stock": 55,
        "image_url": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400",
    },
    {
        "name": "Linen Wide-Leg Trousers",
        "description": "Breezy wide-leg trousers in lightweight linen. Elastic waistband for comfort.",
        "price": 69.99,
        "category": "Women's Clothing",
        "stock": 48,
        "image_url": "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400",
    },
]


def wait_for_service(url: str, retries: int = 15, delay: int = 4):
    for attempt in range(retries):
        try:
            resp = httpx.get(f"{url}/products/health", timeout=5)
            if resp.status_code == 200:
                print(f"Product service is ready.")
                return True
        except Exception:
            pass
        print(f"Waiting for product service... ({attempt + 1}/{retries})")
        time.sleep(delay)
    return False


def check_already_seeded(url: str) -> bool:
    try:
        resp = httpx.get(f"{url}/products/?limit=1", timeout=5)
        data = resp.json()
        return isinstance(data, list) and len(data) > 0
    except Exception:
        return False


def seed():
    if not wait_for_service(PRODUCT_SERVICE_URL):
        print("Product service did not become ready. Exiting.")
        sys.exit(1)

    if check_already_seeded(PRODUCT_SERVICE_URL):
        print("Products already seeded. Skipping.")
        return

    print(f"Seeding {len(PRODUCTS)} products...")
    for product in PRODUCTS:
        try:
            resp = httpx.post(f"{PRODUCT_SERVICE_URL}/products/", json=product, timeout=10)
            resp.raise_for_status()
            print(f"  ✓ {product['name']}")
        except Exception as e:
            print(f"  ✗ {product['name']}: {e}")

    print("Seeding complete.")


if __name__ == "__main__":
    seed()
