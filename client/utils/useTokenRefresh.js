import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export function useTokenRefresh() {
	const router = useRouter();

	useEffect(() => {
		const interval = setInterval(async () => {
			try {
				const res = await axios.post(
					"http://localhost:5000/api/refresh",
					{},
					{ withCredentials: true }
				);
				if (!res.data.message.includes("thành công")) {
					router.push("/login");
				}
			} catch (err) {
				router.push("/login");
			}
		}, 10 * 60 * 1000); // Làm mới mỗi 10 phút (trước khi access_token hết hạn)
		return () => clearInterval(interval);
	}, []);
}
