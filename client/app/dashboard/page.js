import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Flex, Text, Button } from "@radix-ui/themes";
import LiferayContent from "../components/LiferayContent";

export default function Dashboard() {
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch("http://localhost:5000/api/protected", {
					credentials: "include", // Gửi cookie
				});
				const data = await res.json();
				if (res.ok) {
					setUserData(data);
				} else {
					router.push("/login");
				}
			} catch (err) {
				router.push("/login");
			}
		};
		checkAuth();
	}, []);

	const handleLogout = () => {
		document.cookie = "access_token=; Max-Age=0; path=/";
		document.cookie = "refresh_token=; Max-Age=0; path=/";
		router.push("/login");
	};

	return (
		<Flex
			direction="column"
			gap="3"
			style={{ maxWidth: 800, margin: "auto", padding: "20px" }}
		>
			<h1>Dashboard</h1>
			{userData ? (
				<>
					<Text>
						Chào mừng đến với dashboard! Dữ liệu: {JSON.stringify(userData)}
					</Text>
					<LiferayContent />
					<Button onClick={handleLogout}>Đăng xuất</Button>
				</>
			) : (
				<Text>Đang tải...</Text>
			)}
			{error && <Text color="red">{error}</Text>}
		</Flex>
	);
}
