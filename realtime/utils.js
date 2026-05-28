const { get_conf } = require("../node_utils");
const conf = get_conf();

function get_url(socket, path) {
	if (!path) {
		path = "";
	}
	// Always use the local Gunicorn for auth validation.
	// The Origin header points to the public hostname (e.g. https://domain.com)
	// which the server often can't reach from inside (hairpin NAT, DNS, firewall).
	let port = conf.webserver_port || 8000;
	return `http://127.0.0.1:${port}${path}`;
}

module.exports = {
	get_url,
};
