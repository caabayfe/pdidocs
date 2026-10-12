(function executeCondition(userGr, taskGr) {
	var roleSQ = userGr.addJoinQuery("sys_user_has_role", "sys_id", "user");
    roleSQ.addCondition("role.name", "!=", "snc_internal"); // Exclude users with no role or only snc_internal role 
})(userGr, taskGr);
