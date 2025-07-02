import { useTokenRefresh } from "../utils/useTokenRefresh";
import { Flex } from "@radix-ui/themes";

export default function Layout({ children }) {
	useTokenRefresh();
	return <Flex direction="column">{children}</Flex>;
}
