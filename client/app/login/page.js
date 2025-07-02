import { useState } from "react";
import { useRouter } from "next/router";
import { Flex, TextField, Button, Text } from "@radix-ui/themes";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch("http://localhost:5000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // Gửi cookie
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (res.ok) {
				router.push("/dashboard"); // Chuyển hướng đến dashboard
			} else {
				setError(data.message || "Đăng nhập thất bại");
			}
		} catch (err) {
			setError("Có lỗi xảy ra");
		}
	};

	return (
		<Flex
			direction="column"
			gap="3"
			style={{ maxWidth: 400, margin: "auto", padding: "20px" }}
		>
			<h1>Đăng nhập</h1>
			<form onSubmit={handleSubmit}>
				<TextField.Root>
					<TextField.Input
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</TextField.Root>
				<TextField.Root>
					<TextField.Input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</TextField.Root>
				<Button type="submit" style={{ marginTop: "10px" }}>
					Đăng nhập
				</Button>
			</form>
			{error && <Text color="red">{error}</Text>}
		</Flex>
	);
}
