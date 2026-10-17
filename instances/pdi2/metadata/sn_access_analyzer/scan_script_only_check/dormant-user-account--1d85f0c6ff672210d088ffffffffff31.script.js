(function(engine) {
	var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();
    var remediation = "";
    var grUser = new GlideRecord("sys_user");
    grUser.addEncodedQuery("last_loginISEMPTY^ORlast_login<javascript:gs.beginningOfLast6Months()^active=true");
    grUser.query();
    while (grUser.next()) {
		var userLink = accessAuditorUtil.getRecordLink(grUser, grUser.getDisplayValue("name"));
        var baseMsg = "Active user with no activity in the past 180 days is considered a dormant user. " + userLink + " ";

        if (grUser.last_login) {
            remediation = baseMsg + "has not logged into the system since " + grUser.getDisplayValue("last_login") + ".";
        } else {
            remediation = baseMsg + "has never logged into the system.";
        }

        engine.finding.setCurrentSource(grUser);
        engine.finding.setValue("finding_details", remediation);
        engine.finding.increment();
    }
})(engine);
