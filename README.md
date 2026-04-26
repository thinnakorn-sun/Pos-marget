# POS Marget

ระบบ Point of Sale แบบ monorepo แยก `frontend` (Next.js) และ `backend` (NestJS)

## Tech Stack

- Frontend: Next.js, React, TypeScript, Zustand
- Backend: NestJS, TypeScript, Prisma
- Database/Auth/Storage: Supabase
- Package management: npm workspaces

## Project Structure

```text
.
├── frontend/                     # Next.js app
│   ├── app/                      # Route segments
│   ├── lib/
│   │   ├── demo/mock-db.ts       # Demo/mock data (ห้ามแก้ข้อมูลโชว์)
│   │   └── services/             # Domain services + API client
│   └── store/                    # Zustand stores
├── backend/                      # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── users/
│   │   └── ...
│   └── prisma/
└── README.md                     # เอกสารหลักของทั้งโปรเจกต์
```

## Modular Architecture (Current)

- Frontend แยกชั้นเป็น:
  - `core API client` (`frontend/lib/services/core/api-client.ts`)
  - `domain services` (`auth.service.ts`, `user.service.ts`, `product.service.ts`, `sales.service.ts`)
  - `stores` รับผิดชอบ state orchestration
- Backend แยกตาม domain module (`auth`, `products`, `sales`, `users`, `categories`, `upload`)
- Auth backend เพิ่ม DTO/type ชัดเจนและลด logic ซ้ำใน service

รายละเอียดการวิเคราะห์เชิงสถาปัตย์: ดู `ARCHITECTURE_REVIEW.md`

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. ติดตั้ง dependencies ทั้ง workspace

```bash
npm install
```

2. สร้างไฟล์ env ที่ต้องใช้

- Frontend: `frontend/.env.local` (อ้างอิงจาก `frontend/.env.example`)
- Backend: `backend/.env` (กำหนดค่า Supabase/Database ตามที่ระบบใช้งาน)

## Run (Development)

รันทั้ง frontend + backend พร้อมกันจาก root:

```bash
npm run dev
```

หรือรันแยก:

```bash
npm run dev:frontend
npm run dev:backend
```

ค่า default ที่ใช้งาน:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## Workspace Scripts

Root `package.json`:

- `npm run dev` - รัน frontend + backend พร้อมกัน
- `npm run dev:frontend` - รันเฉพาะ frontend
- `npm run dev:backend` - รันเฉพาะ backend
- `npm run install:all` - ติดตั้ง dependencies ราย workspace

## Mock / Demo Data Policy

- ข้อมูล demo/mocked สำหรับโชว์ถูกเก็บใน `frontend/lib/demo/mock-db.ts`
- ให้ถือเป็น **showcase seed data** และไม่ควรแก้ไขโดยไม่จำเป็น
- สามารถสลับพฤติกรรม demo auth ได้ด้วย `NEXT_PUBLIC_DEMO_AUTH`

## Security & .gitignore

โปรเจกต์ตั้งค่า `.gitignore` ครอบคลุมไฟล์สำคัญแล้ว:

- `.env`, `.env.*` (ยกเว้นไฟล์ตัวอย่างเช่น `.env.example`)
- ไฟล์ build/output เช่น `.next`, `dist`, `coverage`
- log และ temp files ทั่วไป

คำแนะนำ: หากเคยมี env/keys หลุดเข้า git มาก่อน ให้พิจารณา rotate keys ที่ยังใช้งานจริง

## Deployment

- มีไฟล์ `render.yaml` สำหรับ deployment บน Render
- ปรับค่า environment variables ในแพลตฟอร์มปลายทางให้ครบก่อน deploy

## Notes

- README นี้เป็นเอกสารหลักแบบ single source of truth สำหรับทั้งโปรเจกต์
- `backend/README.md` ที่เป็น template ของ NestJS ยังอยู่ได้ แต่ให้ยึดไฟล์นี้เป็นหลัก
