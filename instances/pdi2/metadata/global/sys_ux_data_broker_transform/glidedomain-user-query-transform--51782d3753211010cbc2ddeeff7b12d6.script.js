function transform(input) {
	var envLogger = gs;

	function _safelyGet(obj, dotPath) {
		if (typeof(obj) !== "object" || typeof(dotPath) !== "string") {
			envLogger.error("User transform error: invalid input " + obj, dotPath);
			return null;
		}
		var foundProp = obj;
		var path = dotPath.split(".");
		for (var i = 0; i < path.length; i++) {
			if (!foundProp[path[i]])
				return null;

			foundProp = foundProp[path[i]];
		}
		return foundProp;
	}
	var result = {
		"sys_id": null,
		"userName": null,
		"fullName": null,
		"imageSrc": null,
		"presence": null,
		"timeZone": null
	};
	var userRecord = _safelyGet(input, "userRecord.data.GlideDomain_Query.userInfo");
	if (!userRecord) {
		result.error = "User transform error: invalid input param: " + JSON.stringify(input);
		return result;
	}
	result.sys_id = userRecord.sys_id;
	result.userName = userRecord.userName;
	result.fullName = userRecord.fullName;
	result.avatar = userRecord.avatar;
	result.avatarPath = userRecord.avatarPath;
	result.imageSrc = userRecord.avatarPath;
	result.initials = userRecord.initials;
	result.timeZone = userRecord.timeZone;
	function getPresenceRecord(_userRecord) {
		var presenceRecord = _safelyGet(_userRecord, "_query.GlideRecord_Query.sys_user_presence._results.0");
		if(presenceRecord && !gs.nil(presenceRecord.sys_updated_on.value)) {
			return presenceRecord;
		}
		gr = new GlideRecord('sys_user_presence');
		var presence = gr.get('user', _userRecord.sys_id);
		if(!presence) return null;
		return {
			sys_updated_on: {
				value: gr.sys_updated_on
			},
		};
	}

	var presenceRecord = getPresenceRecord(userRecord);
	if (presenceRecord && !gs.nil(presenceRecord.sys_updated_on.value)) {
		var t = new GlideDateTime(presenceRecord.sys_updated_on.value);
		var now = new GlideDateTime();
		var diff = GlideDateTime.subtract(t, now);
		var el = diff.getRaw().getTime() / 1000;
		var isPresent = el < 90;  // ninety second window
		result.presence = isPresent ? "available" : "offline";
	}
	return result;
}
