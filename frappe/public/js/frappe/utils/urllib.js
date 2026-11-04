frappe.urllib = {
	// get argument from url
	get_arg: function (name) {
		name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null) return "";
		else return decodeURIComponent(results[1]);
	},

	// returns url dictionary
	get_dict: function () {
		var d = {};
		var t = window.location.href.split("?")[1];
		if (!t) return d;

		if (t.indexOf("#") != -1) t = t.split("#")[0];
		if (!t) return d;

		t = t.split("&");
		for (var i = 0; i < t.length; i++) {
			var a = t[i].split("=");
			d[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
		}
		return d;
	},

	// returns the base url with http + domain + path (-index.cgi or # or ?)
	get_base_url: function () {
		// var url= (frappe.base_url || window.location.href).split('#')[0].split('?')[0].split('desk')[0];
		var url = frappe.base_url || window.location.origin;
		if (url.substr(url.length - 1, 1) == "/") url = url.substr(0, url.length - 1);
		return url;
	},

	// returns absolute url
	get_full_url: function (url) {
		if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
			return url;
		}
		return url.substr(0, 1) === "/"
			? frappe.urllib.get_base_url() + url
			: frappe.urllib.get_base_url() + "/" + url;
	},
};

window.open_url_post = function open_url_post(URL, PARAMS, new_window) {
	// call a url as POST
	// Under a sub-path a root-relative URL needs the prefix, as frappe.call adds it; and a
	// `cmd` posted to the site root (the report exports) goes to its REST path instead,
	// which a prefixed site routes and which the root no longer accepts.
	const _sp = (frappe.router && frappe.router._subpath_prefix) || "";
	if (PARAMS && PARAMS.cmd && (URL === "/" || URL === frappe.request.url)) {
		URL = _sp + "/api/method/" + PARAMS.cmd;
		PARAMS = Object.assign({}, PARAMS);
		delete PARAMS.cmd;
	} else if (_sp && typeof URL === "string" && URL.startsWith("/") && !URL.startsWith(_sp + "/")) {
		URL = _sp + URL;
	}
	var temp = document.createElement("form");
	temp.action = URL;
	temp.method = "POST";
	temp.style.display = "none";
	if (new_window) {
		temp.target = "_blank";
	}
	PARAMS["csrf_token"] = frappe.csrf_token;
	for (var x in PARAMS) {
		var opt = document.createElement("textarea");
		opt.name = x;
		var val = PARAMS[x];
		if (typeof val != "string") val = JSON.stringify(val);
		opt.value = val;
		temp.appendChild(opt);
	}
	document.body.appendChild(temp);
	temp.submit();
	return temp;
};

window.get_url_arg = frappe.urllib.get_arg;
window.get_url_dict = frappe.urllib.get_dict;
