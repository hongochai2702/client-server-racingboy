import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import { Text } from "@radix-ui/themes";

export default function LiferayContent() {
	const [content, setContent] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("http://localhost:5000/api/liferay-data", {
					withCredentials: true, // Gửi cookie
				});
				const bodyHtml = res.data.items?.[0]?.content?.bodyHtml || ""; // Giả sử API trả về cấu trúc này
				setContent(DOMPurify.sanitize(bodyHtml));
			} catch (err) {
				setError("Không thể tải dữ liệu từ Liferay");
			}
		};
		fetchData();
	}, []);

	return (
		<div>
			{content ? (
				<div dangerouslySetInnerHTML={{ __html: content }} />
			) : (
				<Text>Đang tải nội dung...</Text>
			)}
			{error && <Text color="red">{error}</Text>}
		</div>
	);
}
