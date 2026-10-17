function getRoleForDistinctUser() {
	var distinctUsers = new GlideAggregate("sys_user_has_role");
	distinctUsers.addAggregate("count(distinct", "user");
	distinctUsers.addQuery("role", "3be5d3d1b7103300dff9fa13ee11a987");
	distinctUsers.addQuery("user.active", true);
	distinctUsers.groupBy("role");
	distinctUsers.query();
	if (distinctUsers.next())
		return parseInt(distinctUsers.getAggregate("count(distinct", "user"));

	return 0;
}

answer = getRoleForDistinctUser();
