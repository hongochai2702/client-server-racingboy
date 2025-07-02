import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
	providers: [
		KeycloakProvider({
			clientId: "frontend-app",
			clientSecret: "",
			issuer: "http://localhost:8080/realms/my-realm",
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			return session;
		},
	},
});
