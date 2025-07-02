const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// API đăng nhập
app.post("/api/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const response = await axios.post(
			"http://localhost:8080/realms/my-realm/protocol/openid-connect/token",
			new URLSearchParams({
				grant_type: "password",
				client_id: "backend-app",
				client_secret: "<your-client-secret>",
				username,
				password,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } }
		);

		// Lưu access_token vào cookie
		res.cookie("access_token", response.data.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000, // Hết hạn sau 15 phút
		});

		// Lưu refresh_token vào cookie riêng (nếu cần)
		res.cookie("refresh_token", response.data.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // Hết hạn sau 7 ngày
		});

		res.json({ message: "Đăng nhập thành công" });
	} catch (error) {
		res.status(401).json({ message: "Đăng nhập thất bại" });
	}
});

// API làm mới token
app.post("/api/refresh", async (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken)
		return res.status(401).json({ message: "Không có refresh token" });

	try {
		const response = await axios.post(
			"http://localhost:8080/realms/my-realm/protocol/openid-connect/token",
			new URLSearchParams({
				grant_type: "refresh_token",
				client_id: "backend-app",
				client_secret: "<your-client-secret>",
				refresh_token: refreshToken,
			}),
			{ headers: { "Content-Type": "application/x-www-form-urlencoded" } }
		);

		// Cập nhật access_token mới
		res.cookie("access_token", response.data.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Làm mới token thành công" });
	} catch (error) {
		res.status(401).json({ message: "Không thể làm mới token" });
	}
});

// API bảo mật (yêu cầu access_token)
app.get("/api/protected", async (req, res) => {
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json({ message: "Không có token" });

	try {
		// Giả sử kiểm tra token với Keycloak (hoặc dùng keycloak-connect)
		res.json({ message: "Dữ liệu bảo mật", user: "User Info" });
	} catch (error) {
		res.status(401).json({ message: "Token không hợp lệ" });
	}
});

// API gọi Liferay Headless
app.get("/api/liferay-data", async (req, res) => {
	const token = req.cookies.access_token;
	if (!token) return res.status(401).json({ message: "Không có token" });

	try {
		const response = await axios.get(
			"https://your-liferay-instance.com/o/headless-delivery/v1.0/sites/{siteId}/blog-postings",
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		res.json(response.data);
	} catch (error) {
		res.status(500).json({ message: "Không thể lấy dữ liệu từ Liferay" });
	}
});

app.listen(5000, () => console.log("Backend chạy trên cổng 5000"));
