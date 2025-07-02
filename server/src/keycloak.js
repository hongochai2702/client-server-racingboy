const Keycloak = require("keycloak-connect");
const session = require("express-session");
const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak(
	{
		store: memoryStore,
	},
	{
		realm: "my-realm",
		"auth-server-url": "http://localhost:8080",
		"ssl-required": "external",
		resource: "backend-app",
		"confidential-port": 0,
		"bearer-only": true,
	}
);

module.exports = keycloak;
