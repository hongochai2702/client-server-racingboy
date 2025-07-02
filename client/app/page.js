import { Flex, Text } from "@radix-ui/themes";

export default function Home() {
	return (
		<Flex
			direction="column"
			gap="3"
			style={{ maxWidth: 800, margin: "auto", padding: "20px" }}
		>
			<h1>Trang chủ</h1>
			<Text>Đây là trang công cộng, bất kỳ ai cũng có thể xem.</Text>
		</Flex>
	);
}
