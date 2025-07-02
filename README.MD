# Hệ thống Xác thực với Keycloak, Backend Node.js và Frontend Next.js

Hệ thống này tích hợp xác thực với **Keycloak**, một Backend sử dụng **Node.js/Express** để quản lý token và gọi API Liferay Headless, và một Frontend được xây dựng bằng **Next.js** với giao diện sử dụng **Radix-UI**. Frontend bao gồm các trang đăng nhập, dashboard, và trang công cộng, đồng thời hiển thị nội dung HTML từ Liferay Headless API.

## Mục lục
- [Yêu cầu](#yêu-cầu)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt](#cài-đặt)
  - [1. Cài đặt Keycloak](#1-cài-đặt-keycloak)
  - [2. Cài đặt Backend](#2-cài-đặt-backend)
  - [3. Cài đặt Frontend](#3-cài-đặt-frontend)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API và Luồng xác thực](#api-và-luồng-xác-thực)
- [Tích hợp Liferay Headless API](#tích-hợp-liferay-headless-api)
- [Bảo mật](#bảo-mật)
- [Góp ý](#góp-ý)

## Yêu cầu
- **Docker**: Để chạy Keycloak.
- **Node.js**: Phiên bản 16 hoặc cao hơn.
- **npm**: Để cài đặt các phụ thuộc.
- **Keycloak**: Phiên bản mới nhất (quay.io/keycloak/keycloak:latest).
- **Liferay Instance**: Một instance Liferay với Headless API được kích hoạt (thay URL trong backend nếu cần).

## Cấu trúc dự án
```
project/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── pages/
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   └── _app.js
│   ├── components/
│   │   ├── Layout.js
│   │   └── LiferayContent.js
│   ├── utils/
│   │   └── useTokenRefresh.js
│   └── package.json
├── README.md
```

- **backend**: Xử lý xác thực với Keycloak, lưu trữ token trong cookie HTTP Only, và gọi Liferay API.
- **frontend**: Next.js ứng dụng với các trang đăng nhập, dashboard, và công cộng; sử dụng Radix-UI và DOMPurify để hiển thị nội dung HTML từ Liferay.
- **utils**: Hook để tự động làm mới token.

## Cài đặt

### 1. Cài đặt Keycloak
1. Chạy Keycloak bằng Docker:
   ```bash
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```
2. Truy cập `http://localhost:8080` và đăng nhập với tài khoản `admin/admin`.
3. Tạo Realm:
   - Tên: `my-realm`.
4. Tạo Client:
   - **Backend Client**:
     - Client ID: `backend-app`.
     - Access Type: `confidential`.
     - Lưu Client Secret từ tab Credentials.
   - **Frontend Client**:
     - Client ID: `frontend-app`.
     - Access Type: `public`.
     - Valid Redirect URIs: `http://localhost:3000/*`.
5. Tạo User:
   - Thêm user với username và password để thử nghiệm.

### 2. Cài đặt Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt phụ thuộc:
   ```bash
   npm install express axios cookie-parser cors
   ```
3. Cập nhật `server.js`:
   - Thay `<your-client-secret>` bằng Client Secret từ Keycloak.
   - Thay URL Liferay (`https://your-liferay-instance.com`) bằng URL thực tế của instance Liferay.
4. Chạy backend:
   ```bash
   node server.js
   ```

### 3. Cài đặt Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt phụ thuộc:
   ```bash
   npm install axios @radix-ui/themes @radix-ui/react-dialog dompurify
   ```
3. Chạy frontend:
   ```bash
   npm run dev
   ```

## Chạy ứng dụng
1. **Khởi động Keycloak**: Đảm bảo Keycloak đang chạy tại `http://localhost:8080`.
2. **Khởi động Backend**: Chạy `node server.js` trong thư mục backend (cổng 5000).
3. **Khởi động Frontend**: Chạy `npm run dev` trong thư mục frontend (cổng 3000).
4. Truy cập:
   - Trang công cộng: `http://localhost:3000`
   - Trang đăng nhập: `http://localhost:3000/login`
   - Trang dashboard: `http://localhost:3000/dashboard` (yêu cầu đăng nhập)

## API và Luồng xác thực
- **Luồng xác thực**:
  1. Người dùng nhập username/password trên trang đăng nhập.
  2. FE gửi yêu cầu POST đến `/api/login` của BE.
  3. BE gọi Keycloak để lấy `access_token` và `refresh_token`, lưu vào cookie HTTP Only.
  4. FE tự động làm mới token mỗi 10 phút qua API `/api/refresh`.
  5. Các yêu cầu bảo mật (như `/api/protected` hoặc `/api/liferay-data`) sử dụng cookie `access_token`.

- **API chính**:
  - `POST /api/login`: Xác thực và lưu token vào cookie.
  - `POST /api/refresh`: Làm mới `access_token` bằng `refresh_token`.
  - `GET /api/protected`: Tuyến đường bảo mật, yêu cầu `access_token`.
  - `GET /api/liferay-data`: Lấy dữ liệu từ Liferay Headless API.

## Tích hợp Liferay Headless API
- **API Endpoint**: Sử dụng endpoint như `https://your-liferay-instance.com/o/headless-delivery/v1.0/sites/{siteId}/blog-postings` để lấy dữ liệu JSON.
- **Xử lý HTML**: Thuộc tính `bodyHtml` từ Liferay được làm sạch bằng `DOMPurify` trước khi hiển thị trên FE để tránh tấn công XSS.
- **Xác thực**: Sử dụng `access_token` từ Keycloak (giả sử Liferay tích hợp với Keycloak). Nếu Liferay yêu cầu xác thực riêng, cấu hình lại trong `server.js`.

## Bảo mật
- **Cookie HTTP Only**: `access_token` và `refresh_token` được lưu trong cookie với `httpOnly: true`, `sameSite: 'strict'`, và `secure: true` (trong production).
- **Làm sạch HTML**: Sử dụng `DOMPurify` để làm sạch `bodyHtml` từ Liferay.
- **CORS**: Backend cho phép yêu cầu từ `http://localhost:3000` với `credentials: true`.
- **HTTPS**: Bật `secure: true` cho cookie trong môi trường production.

## Góp ý
Nếu bạn cần thêm tính năng, tùy chỉnh giao diện, hoặc gặp vấn đề khi triển khai, hãy mở issue hoặc liên hệ để được hỗ trợ.