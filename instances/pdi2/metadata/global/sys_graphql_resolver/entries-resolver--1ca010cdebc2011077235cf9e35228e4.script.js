(function process( /*ResolverEnvironment*/ env) {

	var inputdata = env.getArguments().timelineinput;
    var table = inputdata.table;
    var sysId = inputdata.sysId;
    var fulfillerRole = inputdata.fulfillerRole;
    var callerField = inputdata.callerField;

	var timelineData = {};
	var fulfillers = [];
	var caller = {};

	var rsConfig = new global.RibbonDataUtil().getRSConfig(table);
	if (rsConfig == null) {
		return timelineData;
	}
	timelineData.resolutionShaperConfig = rsConfig;

	var timelineEntries = new global.RibbonDataUtil().getTimelineData(table, sysId).timelineEntries;
	var usersActiveOnRecord = new global.RibbonDataUtil().getTimelineData(table, sysId).usersActiveOnRecord;
	timelineData.entries = timelineEntries;

	if (!gs.nil(fulfillerRole) || gs.nil(callerField)) {
		// Add fulfiller role data
		var fulfillerRoles = [];
		fulfillerRoles.push("2831a114c611228501d4ea6c309d626d");
		if (!gs.nil(fulfillerRole))
			fulfillerRoles.push(fulfillerRole);
		if (timelineEntries.length > 0) {
			var userRoleRecord = new GlideRecord("sys_user_has_role");
			userRoleRecord.addQuery("user", usersActiveOnRecord);
			userRoleRecord.addQuery("role", fulfillerRoles);
			userRoleRecord.query();
			var userids = [];
			while (userRoleRecord.next()) {
				var user = {};
				user.id = userRoleRecord.user + '';
				if (userids.indexOf(user.id) < 0) {
					fulfillers.push(user);
					userids.push(user.id);
				}
			}	
		}
	} else if (!gs.nil(callerField)) {
		var record = new GlideRecord(table);
		if (record.canRead()) {
			record.get(sysId);
			caller.id = record.getValue(callerField);
		}
	}

	timelineData.caller = caller;
	timelineData.fulfillers = fulfillers;
	return timelineData;
})(env);
