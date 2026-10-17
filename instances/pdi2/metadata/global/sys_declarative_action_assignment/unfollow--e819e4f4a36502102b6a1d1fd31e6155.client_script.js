function onClick() {
	if (g_form.isUserModified()) {
		getMessage("Record has unsaved changes. Please save before unfollowing.", undefined, function(m) {
			g_form.addInfoMessage(m);
		});
		return;
	}

	var tableName = g_form.getTableName();
	var recordId = g_form.getSysId();
	var newFollowState;

	var requestBody = {
		sysparm_sysid: recordId,
		sysparm_table: tableName,
		sysparm_userid: g_user.userID,
		sysparm_operation: "delete",
	};

	fetch('/api/now/follow_notifications/action', {
		method: 'POST',
		body: JSON.stringify(requestBody),
		headers: {
			"X-UserToken": globalThis.window.g_ck,
			"Accept": "application/json",
			"Content-Type": "application/json"
		}
	}).then(function(response) {
		if (response.status === 200) {
			getMessage("Unfollowing Record", undefined, function(m) {
				g_form.addInfoMessage(m);
				setTimeout(function () {
					location.reload();
				}, 1500);
			});
		}
	});
}
