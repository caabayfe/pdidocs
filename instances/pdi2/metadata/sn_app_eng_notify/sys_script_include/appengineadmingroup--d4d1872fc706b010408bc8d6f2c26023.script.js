var AppEngineAdminGroup = {
	getEmail: function () {
		var grUserGroup = new GlideRecord("sys_user_group");
		if (grUserGroup.get("477a05d153013010b846ddeeff7b1225")) {
			return grUserGroup.getDisplayValue("email");
		}
		
		return null;
	}
};
