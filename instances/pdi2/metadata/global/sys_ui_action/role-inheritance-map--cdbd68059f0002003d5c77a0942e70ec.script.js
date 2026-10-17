function showRoleInheritanceMap() {
	var sysId = typeof rowSysId == 'undefined' ? gel('sys_uniqueValue').value : rowSysId;
	var url = "/inherited_role_map.do?sysparm_attributes=sysId=" + sysId;
	g_navigation.open(url);
}
