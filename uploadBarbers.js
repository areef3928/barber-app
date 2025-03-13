const admin = require("firebase-admin");

// เรียกใช้ Service Account Key
const serviceAccount = require("./serviceAccountKey.json");

// เริ่มต้น Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ข้อมูลช่างตัดผม
const barbers = {
  "Barber1": {
    "id": "Barber1",
    "name": "ช่างเอก",
    "experience": 10,
    "specialty": "ตัดผมชาย",
    "rating": 4.8,
    "contact": "081-234-5678",
    "availability": [
      "2025-02-10",
      "2025-02-11",
      "2025-02-12"
    ],
    "imageURL": ""
  },
  "Barber2": {
    "id": "Barber2",
    "name": "ช่างบอย",
    "experience": 8,
    "specialty": "ตัดผมแฟชั่น",
    "rating": 4.6,
    "contact": "082-345-6789",
    "availability": [
      "2025-02-10",
      "2025-02-13",
      "2025-02-14"
    ],
    "imageURL": ""
  }
};

// ฟังก์ชันอัปโหลดข้อมูลไปยัง Firestore
async function uploadBarbers() {
  const barbersRef = db.collection("Barber");
  
  for (const barberId in barbers) {
    await barbersRef.doc(barberId).set(barbers[barberId]);
    console.log(`อัปโหลดข้อมูลของ ${barbers[barberId].name} สำเร็จ`);
  }

  console.log("อัปโหลดข้อมูลทั้งหมดเรียบร้อยแล้ว!");
}

uploadBarbers();
