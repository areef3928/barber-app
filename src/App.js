import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig"; // นำเข้า Firebase config
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { query, where } from "firebase/firestore";
import './App.css';  // ตรวจสอบว่ามีบรรทัดนี้อยู่
import axios from "axios";

const BookingPage = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [barber, setBarber] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);
  const [editId, setEditId] = useState(null);
  const barbers = ["ช่างยี", "ช่างกีม", "ช่างยูนุห"];

  useEffect(() => {
    const savedPhone = localStorage.getItem("userPhone");
    if (savedPhone) {
      setPhone(savedPhone);
      fetchBookings(savedPhone);
    }
  }, []);

  const fetchBookings = async (userPhone) => {
    if (!userPhone) return;
    const q = query(collection(db, "bookings"), where("phone", "==", userPhone));
    const querySnapshot = await getDocs(q);
    setBookings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleBooking = async () => {
    if (!name || !phone || !barber || !date || !time) {
        alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    const selectedTime = new Date(`${date}T${time}`);
    const q = query(collection(db, "bookings"), where("barber", "==", barber), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    let isOverlap = false;

    querySnapshot.forEach((doc) => {
        const bookedTime = new Date(`${doc.data().date}T${doc.data().time}`);
        const timeDiff = Math.abs((selectedTime - bookedTime) / (1000 * 60));
        if (timeDiff < 40) isOverlap = true;
    });

    if (isOverlap && !editId) {
        alert("⛔ เวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาอื่น");
        return;
    }

    if (editId) {
        await handleUpdate(editId);
    } else {
        await addDoc(collection(db, "bookings"), { name, phone, barber, date, time });

        const adminDashboardURL = "http://localhost:5000/admin";
        const text = `🔔 *แจ้งเตือนการจองใหม่* 🔔\n\n📌 *ลูกค้า:* ${name}\n📞 *เบอร์:* ${phone}\n💈 *ช่าง:* ${barber}\n📅 *วันที่:* ${date}\n🕒 *เวลา:* ${time}\n\nโปรดตรวจสอบการจองในระบบ 🔍\n📍 ดูรายละเอียดทั้งหมดที่นี่: 
${adminDashboardURL}`;

        try {
            console.log("📤 กำลังส่งแจ้งเตือน LINE...");
            await axios.post("http://localhost:5000/send-line-notify", { message: text });
            console.log("✅ แจ้งเตือน LINE สำเร็จ!");
        } catch (error) {
            console.error("❌ แจ้งเตือนล้มเหลว:", error);
        }

        alert("✅ การจองของคุณถูกบันทึกแล้ว");
    }

    fetchBookings(phone);
    setName("");
    setPhone("");
    setBarber("");
    setDate("");
    setTime("");
    setEditId(null);
};

const handleUpdate = async (id) => {
    const selectedTime = new Date(`${date}T${time}`);

    const q = query(
        collection(db, "bookings"),
        where("barber", "==", barber),
        where("date", "==", date)
    );

    const querySnapshot = await getDocs(q);
    let isOverlap = false;

    querySnapshot.forEach((doc) => {
        if (doc.id !== id) {
            const bookedTime = new Date(`${doc.data().date}T${doc.data().time}`);
            const timeDiff = Math.abs((selectedTime - bookedTime) / (1000 * 60));

            if (timeDiff < 40) {
                isOverlap = true;
            }
        }
    });

    if (isOverlap) {
        alert("⛔ ไม่สามารถแก้ไขการจองได้ เพราะเวลาชนกับการจองอื่น");
        return;
    }

    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, { name, phone, barber, date, time });
    const adminDashboardURL = "http://localhost:5000/admin";
    const text = `✏️ *แจ้งเตือนการแก้ไขการจอง* ✏️\n\n📌 *ลูกค้า:* ${name}\n📞 *เบอร์:* ${phone}\n💈 *ช่าง:* ${barber}\n📅 *วันที่:* ${date}\n🕒 *เวลา:* ${time}\n\nโปรดตรวจสอบการเปลี่ยนแปลง 🔍\n📍 ดูรายละเอียดทั้งหมดที่นี่: 
${adminDashboardURL}`;

    try {
        console.log("📤 กำลังส่งแจ้งเตือน LINE...");
        await axios.post("http://localhost:5000/send-line-notify", { message: text });
        console.log("✅ แจ้งเตือน LINE สำเร็จ!");
    } catch (error) {
        console.error("❌ แจ้งเตือนล้มเหลว:", error);
    }

    alert("✏️ การจองของคุณถูกแก้ไขแล้ว");
    setEditId(null);
    fetchBookings(phone);
};
  
  

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "bookings", id));
    
    // อัปเดตรายการจองโดยกรอง ID ที่ถูกลบออก
    setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
  
    alert("❌ การจองของคุณถูกยกเลิกแล้ว เวลานี้สามารถจองได้อีกครั้ง");
  };
  

  const handleEdit = (b) => {
    setName(b.name);
    setPhone(b.phone);
    setBarber(b.barber);
    setDate(b.date);
    setTime(b.time);
    setEditId(b.id);
  };

  return (
    <div className="container">
      <h1>
      <img src="/Barber.jpeg" className="logo" alt="" />

        จองคิวตัดผม
      </h1>

      <div className="form-container">
        <input 
          type="text" 
          placeholder="ชื่อของลูกค้า" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="input-field"
        />

        <input 
          type="text" 
          placeholder="📞 เบอร์โทร" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="input-field"
        />

        <select 
          value={barber} 
          onChange={(e) => setBarber(e.target.value)} 
          className="input-field"
        >
          <option value="">✂️ เลือกช่าง</option>
          {barbers.map((b, index) => <option key={index} value={b}>{b}</option>)}
        </select>

        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="input-field"
        />

        <input 
          type="time" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
          className="input-field"
        />

        <button 
          onClick={handleBooking} 
          className="submit-button"
        >
          ✅ {editId ? "บันทึกการแก้ไข" : "ยืนยันการจอง"}
        </button>
      </div>
      
      <br />
<input 
  type="text" 
  placeholder="📞 กรอกเบอร์โทรเพื่อดูรายการจอง" 
  value={phone} 
  onChange={(e) => {
    const input = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
    if (input.length <= 10) {
      setPhone(input);
    }
  }}  
  className="input-field"
/>
<br /><br />
<button 
  onClick={() => {
    if (!phone || phone.length < 9) {
      alert("⚠️ กรุณากรอกเบอร์โทรที่ถูกต้อง");
      return;
    }
    localStorage.setItem("userPhone", phone);
    fetchBookings(phone);
  }} 
  className="submit-button"
>
  🔍 ค้นหารายการจอง
</button>
      <h2>📜 รายการจอง</h2>

      <div className="booking-list">
        {bookings.length === 0 ? (
          <p className="no-booking-text">ยังไม่มีการจอง</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="booking-item">
              <div>
                <p>{b.name} - {b.phone} - {b.barber}</p>
                <p>{b.date} | {b.time}</p>
              </div>
              <div className="booking-actions">
                <button 
                  onClick={() => handleEdit(b)} 
                  className="edit-button"
                >
                  ✏️ แก้ไข
                </button>
                <button 
                  onClick={() => handleDelete(b.id)} 
                  className="delete-button"
                >
                  ❌ ยกเลิกการจอง
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingPage;
