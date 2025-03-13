import json
import firebase_admin
from firebase_admin import credentials, firestore

# 1️⃣ โหลด Firebase Service Account Key
cred = credentials.Certificate("serviceAccountKey.json")  # ใช้ชื่อไฟล์ที่โหลดมา
firebase_admin.initialize_app(cred)

# 2️⃣ เชื่อมต่อ Firestore
db = firestore.client()

# 3️⃣ โหลดไฟล์ JSON
with open("BarberDatabase.json", "r", encoding="utf-8") as f:
    barbers = json.load(f)

# 4️⃣ เพิ่มข้อมูลลง Firestore
for barber_id, barber_data in barbers.items():
    db.collection("barbers").document(barber_id).set(barber_data)
    print(f"อัปโหลด {barber_data['name']} สำเร็จ!")

print("🔥 อัปโหลดข้อมูลทั้งหมดเรียบร้อยแล้ว!")
