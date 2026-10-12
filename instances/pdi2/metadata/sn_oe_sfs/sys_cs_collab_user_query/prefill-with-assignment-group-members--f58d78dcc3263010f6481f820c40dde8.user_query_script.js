(function executeCondition(userGr, taskGr) {
    if (taskGr.assignment_group != "") {
        var grSQ = userGr.addJoinQuery("sys_user_grmember", "sys_id", "user");
        grSQ.addCondition("group", taskGr.assignment_group);
    } else {
		userGr.addQuery("sys_id", "-1"); // if no assignment_group is set, don't prefill
	}
})(userGr, taskGr);
