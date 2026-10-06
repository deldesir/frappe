// IIAB sub-path: the desk is served under a prefix (e.g. `/erp`). The router spells the URLs it
// builds under that prefix itself (see `_subpath_prefix`, `make_url`, `desk_path`); this is the
// safety net for everything else, so the prefix cannot fall out of the address bar, a link, a
// new window or a request through code that spells a bare root path: an upstream feature that
// writes `history.replaceState(…, "/desk/x")`, a desktop icon whose stored route is `/app/build`,
// a `fetch("/api/method/…")` that never went through `frappe.request`. Every spelling is done
// once, at the edge, and a path already under the prefix is left alone.
(function () {
	const prefix = frappe.router && frappe.router._subpath_prefix;
	if (!prefix) return;

	// Root paths that belong to this site. Assets and public files are served at the root as
	// well, so they are not touched; everything here answers only under the prefix.
	const ROOTS = [
		"/desk",
		"/app",
		"/apps",
		"/api/",
		"/private/files/",
		"/printview",
		"/login",
		"/me",
		"/update-password",
		"/website_script.js",
	];

	function spell(url) {
		if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return url;
		if (url === prefix || url.startsWith(prefix + "/") || url.startsWith(prefix + "?")) return url;
		for (const root of ROOTS) {
			if (url === root || url.startsWith(root + "/") || url.startsWith(root + "?") || url.startsWith(root + "#")) {
				return prefix + url;
			}
			if (root.endsWith("/") && url.startsWith(root)) return prefix + url;
		}
		return url;
	}
	frappe.router.spell_under_prefix = spell;

	// 1. The address bar.
	for (const method of ["pushState", "replaceState"]) {
		const original = history[method].bind(history);
		history[method] = function (state, title, url) {
			return original(state, title, spell(url));
		};
	}

	// 2. New windows and tabs.
	const open = window.open.bind(window);
	window.open = function (url, ...rest) {
		return open(spell(url), ...rest);
	};

	// 3. Requests that bypass `frappe.request`.
	const fetch_ = window.fetch.bind(window);
	window.fetch = function (input, ...rest) {
		return fetch_(typeof input === "string" ? spell(input) : input, ...rest);
	};
	const xhr_open = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		return xhr_open.call(this, method, typeof url === "string" ? spell(url) : url, ...rest);
	};

	// 4. Links, as they are rendered and whenever an href changes. An `<a>` that already carries
	// the prefix is left alone, so this never loops.
	function fix(a) {
		const href = a.getAttribute("href");
		const spelled = spell(href);
		if (spelled !== href) a.setAttribute("href", spelled);
	}
	function scan(node) {
		if (node.nodeType !== 1) return;
		if (node.matches("a[href]")) fix(node);
		node.querySelectorAll("a[href]").forEach(fix);
	}
	new MutationObserver((mutations) => {
		for (const m of mutations) {
			if (m.type === "attributes") fix(m.target);
			else m.addedNodes.forEach(scan);
		}
	}).observe(document.documentElement, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["href"],
	});
	scan(document.documentElement);
})();
