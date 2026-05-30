frappe.logout = function () {
	frappe.call({
		method: "logout",
		callback: function (r) {
			if (r.exc) {
				return;
			}
			window.location.href = ((frappe.router && frappe.router._subpath_prefix) || "") + "/login";
		},
	});
};
