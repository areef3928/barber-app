import json

# ข้อมูลช่างตัดผม
barbers = [
    {
        "id": "Barber1",
        "name": "ช่างเอก",
        "experience": 10,  # ปีประสบการณ์
        "specialty": "ตัดผมชาย",
        "rating": 4.8,
        "contact": "081-234-5678",
        "availability": ["2025-02-10", "2025-02-11", "2025-02-12"],
        "imageURL": ""
    },
    {
        "id": "Barber2",
        "name": "ช่างบอย",
        "experience": 8,
        "specialty": "ตัดผมแฟชั่น",
        "rating": 4.6,
        "contact": "082-345-6789",
        "availability": ["2025-02-10", "2025-02-13", "2025-02-14"],
        "imageURL": ""
    }
]

# แปลงข้อมูลเป็น JSON
json_data = {barber["id"]: barber for barber in barbers}

# บันทึกลงไฟล์
with open("BarberDatabase.json", "w", encoding="utf-8") as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)

print("ไฟล์ JSON ถูกสร้างแล้ว!")
