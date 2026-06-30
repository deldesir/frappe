const { get_conf } = require("../node_utils");
const conf = get_conf();

function get_hostname(url) {
	if (!url) return undefined;
	if (url.indexOf("://") > -1) {
		url = url.split("/")[2];
	}
	return url.match(/:/g) ? url.slice(0, url.indexOf(":")) : url;
}

function get_url(socket, path) {
	if (!path) {
		path = "";
	}
	if (conf.webserver_host && conf.webserver_port) {
		let base = conf.webserver_host;
		if (base.indexOf("://") === -1) {
			base = `http://${base}`;
		}
		const url = new URL(base);
		if (!url.port) {
			url.port = conf.webserver_port;
		}
		return url.origin + path;
	}
	// IIAB: never fall back to the public Origin header — the server often can't
	// reach the public hostname from inside (hairpin NAT, DNS, firewall). Default
	// to the local Gunicorn instead of the origin.
	let port = conf.webserver_port || 8000;
	return `http://127.0.0.1:${port}${path}`;
}

module.exports = {
	get_hostname,
	get_url,
};
