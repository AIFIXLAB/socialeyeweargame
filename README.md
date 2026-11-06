# Social Eyewear Game

## ขึ้น Vercel
1. เข้า vercel.com > Add New > Project แล้วอัปโหลดโฟลเดอร์นี้ หรือ push ขึ้น GitHub แล้วเลือก repo
2. Framework Preset เลือก Other แล้วกด Deploy

## เปิดเซฟกลางและโหมดเล่นกับเพื่อน
3. ในโปรเจกต์ เปิดแท็บ Storage แล้วสร้างฐานข้อมูล Redis ของ Upstash จาก Marketplace และเชื่อมกับโปรเจกต์นี้
4. ตรวจใน Settings > Environment Variables ว่ามี KV_REST_API_URL และ KV_REST_API_TOKEN
   (หรือ UPSTASH_REDIS_REST_URL และ UPSTASH_REDIS_REST_TOKEN)
5. กด Redeploy เพื่อให้ค่าใหม่มีผล

ตรวจผล: เปิด /api/save?ping=1 ต้องได้ {"ok":true,"configured":true}
ในเกม กดตั้งค่า แล้วสถานะต้องขึ้นว่า "เซฟกลาง โหลดจากเครื่องไหนก็ได้"
ถ้ายังไม่ได้ทำข้อ 3-5 เกมยังเล่นได้ แต่เซฟจะอยู่ในเครื่องผู้เล่นเท่านั้น

## โหมด PARTY
เล่นได้เฉพาะบนเว็บ Vercel ที่ทำข้อ 3-5 แล้ว ใช้ Upstash แค่ตอนจับคู่ จากนั้นเครื่องจะต่อกันตรงผ่าน WebRTC
ทุกเครื่องควรอยู่ Wi-Fi เดียวกัน และเจ้าของห้องต้องเปิดเกมค้างไว้ตลอด

## ข้อควรรู้
รหัส 4 หลักไม่ใช่รหัสผ่าน มีเพียง 10,000 แบบ ใครเดาถูกก็โหลดและเซฟทับได้
