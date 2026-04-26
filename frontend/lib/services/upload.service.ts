import { API_URL } from "./core/api-client";

/**
 * อัปโหลดรูปสินค้าผ่าน Backend API (ใช้ Service Role เพื่อข้าม RLS)
 * @returns public URL ของรูปที่อัปโหลด
 */
export async function uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload/product-image`, {
        method: "POST",
        body: formData,
        // ไม่ใส่ Content-Type — browser จัดการ boundary ให้
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || "Upload failed");
    }

    const data = await res.json();
    return data.url;
}
