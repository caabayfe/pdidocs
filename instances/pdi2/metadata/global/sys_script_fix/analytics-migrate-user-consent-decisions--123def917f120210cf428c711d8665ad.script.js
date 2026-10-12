gs.info("Analytics User Consent Decisions Migration Started");
var startTime = new GlideDateTime();
gs.info("Start Time: " + startTime);

// Query old consent records ordered by username
var sourceConsentGR = new GlideRecord('m2m_user_consent_info');
sourceConsentGR.orderBy('username');
sourceConsentGR.query();

var userConsentDecisionMap = new Packages.java.util.HashMap();
var usernameList = [];
var maxtime;
var prevUserName = null;

while (sourceConsentGR.next()) {
    var currUserName = sourceConsentGR.username.toString();

    if (currUserName !== prevUserName) {
        // Assign current values to previous record.
        maxtime = sourceConsentGR.getValue('consented_date');
        
        // Save user's first decision that is found
        var newUserDecision = {};
        newUserDecision.user_name = sourceConsentGR.username.toString();
        newUserDecision.region = sourceConsentGR.region.toString();
        newUserDecision.user_consent_decision = sourceConsentGR.getValue('user_consented_to_tracking_usage');
        newUserDecision.user_consented_date = sourceConsentGR.getValue('consented_date');
        userConsentDecisionMap.put(sourceConsentGR.username.toString(), newUserDecision);

        // Add to list of names as this is the first appearance of this username
        usernameList.push(sourceConsentGR.username.toString());
    } else {
        var currUserConsentDate = sourceConsentGR.getValue('consented_date').toString();

        // Use most recent entry available for the user
        if (new GlideDateTime(currUserConsentDate).after(new GlideDateTime(maxtime))) {
            maxtime = currUserConsentDate;

            var replaceUserDecision = {};
            replaceUserDecision.user_name = sourceConsentGR.username.toString();
            replaceUserDecision.region = sourceConsentGR.region.toString();
            replaceUserDecision.user_consent_decision = sourceConsentGR.getValue('user_consented_to_tracking_usage');
            replaceUserDecision.user_consented_date = currUserConsentDate;
            userConsentDecisionMap.put(sourceConsentGR.username.toString(), replaceUserDecision);
        }
    }

    // Assign current name for next iteration.
    prevUserName = currUserName;
}

// Create set of usernames  which are already migrated OR  given consent i.e user are present in sys_analytics_user_consent_decision table
var migratedUsers = new Packages.java.util.HashSet();
var consentDecisionGR = new GlideRecord('sys_analytics_user_consent_decision');
    consentDecisionGR.query();
    while (consentDecisionGR.next()) {
            var userName = consentDecisionGR.user.user_name.toString();
    		migratedUsers.add(userName);
    }


// Skip insertion logic if there are no records to migrate
if (usernameList.length > 0) {
    var sysUserGR = new GlideRecord('sys_user');
    sysUserGR.addQuery('user_name', 'IN', usernameList);
    sysUserGR.query();

    var migratedUsersCount = 0;
    var targetConsentDecisionGR = new GlideRecord('sys_analytics_user_consent_decision');
    targetConsentDecisionGR.setWorkflow(false);
    targetConsentDecisionGR.initialize();

    while (sysUserGR.next()) {
        var userName = sysUserGR.user_name.toString();
        var userConsentDecisionForInsert = userConsentDecisionMap.get(userName);

        if(userConsentDecisionForInsert != null && !migratedUsers.contains(userName)) {
          targetConsentDecisionGR.user = sysUserGR.sys_id;
          targetConsentDecisionGR.analytics_consent_policy = getPolicy(userConsentDecisionForInsert.region);
          targetConsentDecisionGR.decision = getDecision(userConsentDecisionForInsert.user_consent_decision);
          targetConsentDecisionGR.date = userConsentDecisionForInsert.user_consented_date;
          targetConsentDecisionGR.migrated_consent_date = userConsentDecisionForInsert.user_consented_date;
          targetConsentDecisionGR.insertLazy();
          migratedUsersCount++;
        }
    }

    gs.info("Analytics User Consent Decisions Migration: If not already migrated, " + migratedUsersCount + " users would be migrated shortly in the background");
}

var endTime = new GlideDateTime();
gs.info("End Time: " + endTime);
gs.info("Time Taken: " + gs.dateDiff(startTime, endTime, true));
gs.info("Analytics User Consent Decisions Migration Ended");


function getPolicy(region) {
    if (region === "EU") {
        return "87f9b519773311105679bcc8ca5a9922"; // Explicit Opt In
    } else if (region === "US") {
        return "ef0bb519773311105679bcc8ca5a99ad"; // No Consent Required
    } else {
        return "562bf159773311105679bcc8ca5a9983"; // Notice
    }
}


function getDecision(consentNeeded) {
    return consentNeeded === "Y";
}
