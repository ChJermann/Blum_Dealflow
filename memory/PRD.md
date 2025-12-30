# Blum Verwaltungs- und Treuhand AG - Deal Management App

## Problem Statement
Web application for managing company (AG) acquisitions and sales with automated document generation.

## User Personas
- **Admin User**: Full access to create deals, manage templates, generate documents
- **Regular User**: View deals, generate documents

## Core Requirements (Static)
1. Deal Management (Ankauf/Verkauf)
2. Automatic number series (YYYY-NNN format)
3. Multi-party support (multiple sellers/buyers)
4. DOCX document generation
5. AI Chatbot (OpenAI GPT)
6. JWT Authentication
7. German UI

## What's Been Implemented (December 2025)

### Backend (FastAPI + MongoDB)
- [x] User authentication (register, login, JWT)
- [x] Deal CRUD operations with status workflow
- [x] Automatic number series (2025-001, 2025-002, etc.)
- [x] Template management (6 default templates seeded)
- [x] Document generation (DOCX with placeholders)
- [x] Attachment upload/management
- [x] Deal validation API
- [x] OpenAI Chatbot integration
- [x] Statistics API

### Frontend (React + Tailwind + Shadcn)
- [x] Login/Register page with parallax background
- [x] Dashboard with stats and recent deals
- [x] 5-step Deal creation wizard
- [x] Deal detail page with tabs
- [x] Sidebar navigation
- [x] Chatbot widget (floating button)
- [x] German localization
- [x] Blum brand colors (bronze #AC7E49)

### Templates (Seeded)
1. Kaufvertrag
2. Quittung
3. Mandatsvertrag
4. Auftragsbestätigung
5. Übergabebestätigung
6. Checkliste Abschluss

## Prioritized Backlog

### P0 (Critical)
- [x] Deal creation flow
- [x] Document generation
- [x] Authentication

### P1 (High)
- [ ] PDF export (convert DOCX to PDF)
- [ ] Custom template upload (DOCX)
- [ ] Template placeholder mapping UI
- [ ] Admin role protection for template management

### P2 (Medium)
- [ ] Deal edit functionality (dedicated page)
- [ ] ZIP download with all documents
- [ ] Attachment type categorization UI
- [ ] FAQ/Knowledge base for chatbot
- [ ] Email notifications

### P3 (Low)
- [ ] User management for admin
- [ ] Number series configuration (per deal type)
- [ ] Audit log/history improvements
- [ ] Print-friendly document views

## Tech Stack
- Backend: FastAPI, MongoDB, python-docx, emergentintegrations (OpenAI)
- Frontend: React, Tailwind CSS, Shadcn/UI, Axios
- Authentication: JWT (bcrypt)

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET/POST /api/deals
- GET/PUT/DELETE /api/deals/{id}
- PATCH /api/deals/{id}/status
- GET /api/deals/{id}/validate
- POST /api/deals/{id}/documents/generate/{template_id}
- GET /api/deals/{id}/documents
- GET /api/documents/{id}/download
- POST /api/deals/{id}/attachments
- GET /api/templates
- POST /api/chat
- GET /api/stats
