import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import './AdminPage.css';
import axios from "axios";
const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [editMode, setEditMode] = useState(false); // ใช้ในการสลับโหมดการแก้ไข
    const [currentBooking, setCurrentBooking] = useState({}); // เก็บข้อมูลของการจองที่เลือกแก้ไข

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
    };

    const handleEdit = (booking) => {
        setCurrentBooking(booking);
        setEditMode(true); // เปลี่ยนโหมดเป็นการแก้ไข
    };

    const handleDelete = async (id) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบการจองนี้?")) return;
    
        // ลบการจอง
        await deleteDoc(doc(db, "bookings", id));
    
        // แจ้งเตือน Line
        const text = `🚨 *แจ้งเตือนการลบการจอง* 🚨\n\nการจองที่ถูกลบจากระบบ:\n\n🆔 *ID การจอง:* ${id}\n\nโปรดตรวจสอบการเปลี่ยนแปลงในระบบ 🔍`;
    
        try {
            console.log("📤 กำลังส่งแจ้งเตือน LINE...");
            await axios.post("http://localhost:5000/send-line-notify", { message: text });
            console.log("✅ แจ้งเตือน LINE สำเร็จ!");
        } catch (error) {
            console.error("❌ แจ้งเตือนล้มเหลว:", error);
        }
    
        alert("✅ ลบการจองเรียบร้อยแล้ว");
        fetchBookings(); // ดึงข้อมูลการจองใหม่
    };
    
    const handleUpdate = async (e) => {
        e.preventDefault();
    
        const { id, name, phone, barber, date, time } = currentBooking;
    
        if (!name || !phone || !barber || !date || !time) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
    
        // อัปเดตข้อมูลการจอง
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, {
            name,
            phone,
            barber,
            date,
            time,
        });
    
        // แจ้งเตือน Line
        const text = `✏️ *แจ้งเตือนการแก้ไขการจอง* ✏️\n\n📌 *ลูกค้า:* ${name}\n📞 *เบอร์:* ${phone}\n💈 *ช่าง:* ${barber}\n📅 *วันที่:* ${date}\n🕒 *เวลา:* ${time}\n\nโปรดตรวจสอบการเปลี่ยนแปลง 🔍`;
    
        try {
            console.log("📤 กำลังส่งแจ้งเตือน LINE...");
            await axios.post("http://localhost:5000/send-line-notify", { message: text });
            console.log("✅ แจ้งเตือน LINE สำเร็จ!");
        } catch (error) {
            console.error("❌ แจ้งเตือนล้มเหลว:", error);
        }
    
        alert("✅ อัปเดตการจองเรียบร้อยแล้ว");
        setEditMode(false); // ปิดโหมดการแก้ไข
        fetchBookings(); // ดึงข้อมูลการจองใหม่
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentBooking((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const filteredBookings = bookings.filter((b) =>
        b.name.includes(search) || b.phone.includes(search) || b.barber.includes(search)
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">📋 รายการจองทั้งหมด</h1>
            <input
                type="text"
                placeholder="🔍 ค้นหาตามชื่อ, เบอร์โทร หรือช่าง"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 w-full mb-4"
            />

            {editMode && (
                <div className="mb-4 p-4 border border-gray-300 rounded bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4">✏️ แก้ไขการจอง</h2>
                    <form onSubmit={handleUpdate}>
                        <input
                            type="text"
                            name="name"
                            value={currentBooking.name || ""}
                            onChange={handleChange}
                            placeholder="ชื่อ"
                            className="border p-2 w-full mb-4"
                        />
                        <input
                            type="text"
                            name="phone"
                            value={currentBooking.phone || ""}
                            onChange={handleChange}
                            placeholder="เบอร์โทร"
                            className="border p-2 w-full mb-4"
                        />
                        <input
                            type="text"
                            name="barber"
                            value={currentBooking.barber || ""}
                            onChange={handleChange}
                            placeholder="ช่าง"
                            className="border p-2 w-full mb-4"
                        />
                        <input
                            type="date"
                            name="date"
                            value={currentBooking.date || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-4"
                        />
                        <input
                            type="time"
                            name="time"
                            value={currentBooking.time || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-4"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                            ✅ อัปเดต
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            ❌ ยกเลิก
                        </button>
                    </form>
                </div>
            )}

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ชื่อ</th>
                        <th className="border p-2">เบอร์โทร</th>
                        <th className="border p-2">ช่าง</th>
                        <th className="border p-2">วันที่</th>
                        <th className="border p-2">เวลา</th>
                        <th className="border p-2">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border">
                            <td className="p-2">{booking.name}</td>
                            <td className="p-2">{booking.phone}</td>
                            <td className="p-2">{booking.barber}</td>
                            <td className="p-2">{booking.date}</td>
                            <td className="p-2">{booking.time}</td>
                            <td className="p-2">
                                <button
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    onClick={() => handleEdit(booking)}
                                >
                                    ✏️ แก้ไข
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                                    onClick={() => handleDelete(booking.id)}
                                >
                                    ❌ ลบ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
