(function executeQuery(v_table, v_query) {
    var groupId = v_query.getParameter('group');

    if (groupId) {
        var isValidSysId = groupId.match(/^[0-9a-fA-F]{32}$/) == null ? false : true;
		
        if (isValidSysId) {
            var onCallHours = new OnCallReportingUtils().getOnCallHours(groupId);
            for (var i = 0; i < onCallHours.length; i++) {
                var onCallHour = onCallHours[i];
                v_table.addRow(onCallHour);
            }
        }
    }

})(v_table, v_query);
