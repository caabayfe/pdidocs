var result = {};
var agentType = {};
var aggregation = {
    count: 0,
    ua_defn_agg: [],
};
var TABLES = {
    "INCIDENT": "incident",
    "USER_CRITERIA": "user_criteria",
    "GROUP_MEMBER": "sys_user_grmember",
    "USER_HAS_ROLE": "sys_user_has_role",
    "APPLICABILITY": "sys_ux_applicability",
    "APPLICABILITY_M2M_SCREEN": "sys_ux_applicability_m2m_screen",
    "USER_CRITERIA_INCLUSION": "sys_ux_criteria_m2m_inclusion",
    "USER_CRITERIA_EXCLUSION": "sys_ux_criteria_m2m_exclusion"
};

var COLUMNS = {
    "RESOLVED_BY": "resolved_by",
    "SYS_ID": "sys_id",
    "APPLICABILITY": "applicability",
    "SCREEN": "screen"
};

var SERVICE_DESK_GROUP = "d625dccec0a8016700a222a0f7900d06";
var SERVICE_DESK_LANDING_PAGE = "b034cf7877410110c05d885d9f5a9912";
var ITIL_SYS_ID = "282bf1fac6112285017366cb5f867469";
var INCIDENT_WRITE_SYS_ID = "260c203a870033000e56d61e36cb0bbc";
var SERVICE_DESK_AGENT_SYS_ID = "42248b8287bb02100645ddbabbbb3532";

var resolvedUsersByRole = getResolvedUsersByRole();
var serviceDeskUsers = resolvedUsersByRole["serviceDeskUsers"];
var incidentWriteITILUsers = resolvedUsersByRole["itilUsers"];
var userCriteriaEnabled = gs.getProperty('glide.ux.user_criteria_enabled', false);
if (userCriteriaEnabled == "true") {
    var userCriteriaUsers = getFilteredUsersByUserCriteria();
    setAnswer(userCriteriaUsers);
} else {
    var stdUserType = getServiceDeskGroupUsers(incidentWriteITILUsers);
    incidentWriteITILUsers.forEach(function (user) { stdUserType[user] = stdUserType[user] || "Tier2" });
    setAnswer(stdUserType);
}

function setAnswer(userAgentType) {
    if (Object.keys(userAgentType).length) {
        serviceDeskUsers.forEach(function (user) { userAgentType[user] = userAgentType[user] || "Tier1" });
    }
    result["Tier1"] = getTierCount(userAgentType, "Tier1");
    result["Tier2"] = getTierCount(userAgentType, "Tier2");
    return result;
}

function getTierCount(users, tier) {
    if(users && Object.keys(users).length == 0) return 0;
    var count = 0;
    var usersString = (tier) ? users && Object.keys(users).filter(function (key) { return users[key] === tier; }).join(",") : users.join(",");
    var inc = new GlideAggregate(TABLES.INCIDENT);
    inc.addEncodedQuery('resolved_atONYesterday@javascript:gs.beginningOfYesterday()@javascript:gs.endOfYesterday()^resolved_byISNOTEMPTY');
    inc.addAggregate('COUNT', COLUMNS.RESOLVED_BY);
    inc.addQuery(COLUMNS.RESOLVED_BY, "IN", usersString);
    inc.query();
    while (inc.next()) {
        count += parseInt(inc.getAggregate('COUNT', COLUMNS.RESOLVED_BY));
    }
    return count;
}

function getServiceDeskGroupUsers(users) {
    var userObj = {};
    var grUserRole = new GlideRecord(TABLES.GROUP_MEMBER);
    grUserRole.addQuery('user', 'IN', users.join(','));
    grUserRole.addQuery('group', SERVICE_DESK_GROUP);
    grUserRole.query();
    while(grUserRole.next()) {
        userObj[grUserRole.getValue("user")] = "Tier1";
    }
    return userObj;
}

function getResolvedUsersByRole() {
    var grIncident = new GlideAggregate(TABLES.INCIDENT);
    grIncident.addEncodedQuery('resolved_atONYesterday@javascript:gs.beginningOfYesterday()@javascript:gs.endOfYesterday()^resolved_byISNOTEMPTY');
	grIncident.addNotNullQuery('resolved_by');
    grIncident.groupBy('resolved_by');
    grIncident.query();

    var resolvedUsers = [];
    while (grIncident.next()) {
        var resolvedUser = grIncident.getValue("resolved_by");
        if (resolvedUser) resolvedUsers.push(resolvedUser);
    }
    var itilUsers = [];
    var serviceDeskUsers = [];

    var grUserRole = new GlideRecord(TABLES.USER_HAS_ROLE);
    grUserRole.addQuery('user', 'IN', resolvedUsers.join(','));
    grUserRole.addQuery('role.name', 'IN', 'itil,sn_service_desk_agent,sn_incident_write');
    grUserRole.query();

    var userRoleMap = {};
    while (grUserRole.next()) {
        var userSysId = grUserRole.getValue("user");
        var role = grUserRole.getValue("role");
        if (role == SERVICE_DESK_AGENT_SYS_ID) {
            userRoleMap[userSysId] = role;
        } else if (!userRoleMap[userSysId]) {
            userRoleMap[userSysId] = role;
        }
    }
    
    for(var user in userRoleMap) {
        if(userRoleMap[user] == SERVICE_DESK_AGENT_SYS_ID) {
            serviceDeskUsers.push(user);
        } else {
            itilUsers.push(user);
        }
    }
    
    return {
        "serviceDeskUsers": serviceDeskUsers,
        "itilUsers": itilUsers
    };
}

function getFilteredUsersByUserCriteria() {
    var grAppM2M = new GlideRecord(TABLES.APPLICABILITY_M2M_SCREEN);
    grAppM2M.addActiveQuery();
    grAppM2M.addQuery('screen', SERVICE_DESK_LANDING_PAGE);
    grAppM2M.query();

    var applicabilitySysIds = [];
    while (grAppM2M.next()) {
        applicabilitySysIds.push(grAppM2M.getValue("applicability"));
    }

    var grApp = new GlideRecord(TABLES.APPLICABILITY);
    grApp.addActiveQuery();
    grApp.addQuery(COLUMNS.SYS_ID, 'IN', applicabilitySysIds.join(','));
    grApp.query();

    var filteredApplicabilities = [];
    while (grApp.next()) {
		var sysId = grApp.getValue("sys_id");
        if (!gs.nil(grApp.getValue("role_names"))) {
            var roleNames = grApp.getValue("role_names").split(",");
            if (roleNames.includes('itil') || roleNames.includes('sn_incident_write') || roleNames.includes("sn_service_desk_agent"))
                filteredApplicabilities.push(sysId);
        } else {
            var roles = grApp.getValue("roles").split(",");
            if (!filteredApplicabilities.includes(sysId) && (roles.includes(ITIL_SYS_ID) || roles.includes(INCIDENT_WRITE_SYS_ID) || roles.includes(SERVICE_DESK_AGENT_SYS_ID)))
                filteredApplicabilities.push(sysId);
        }
    }

    var inclusionCriteria = [];
    var exclusionCriteria = [];
	var grCriteriaInc = new GlideRecord(TABLES.USER_CRITERIA_INCLUSION);
	grCriteriaInc.addActiveQuery();
	grCriteriaInc.addQuery(COLUMNS.APPLICABILITY, 'IN', filteredApplicabilities.join(","));
	grCriteriaInc.query();

	while (grCriteriaInc.next()) {
		inclusionCriteria.push(grCriteriaInc.getValue("user_criteria"));
	}

	var grCriteriaExc = new GlideRecord(TABLES.USER_CRITERIA_EXCLUSION);
	grCriteriaExc.addActiveQuery();
	grCriteriaExc.addQuery(COLUMNS.APPLICABILITY, 'IN', filteredApplicabilities.join(","));
	grCriteriaExc.query();

	while (grCriteriaExc.next()) {
		exclusionCriteria.push(grCriteriaExc.getValue("user_criteria"));
	}

	for(var j=0; j < incidentWriteITILUsers.length; j++) {
		var userId = incidentWriteITILUsers[j];
		if(inclusionCriteria && sn_uc.UserCriteriaLoader.userMatches(userId, inclusionCriteria) && (exclusionCriteria.length == 0 || !sn_uc.UserCriteriaLoader.userMatches(userId, exclusionCriteria))) {
			agentType[userId] = "Tier1";
		} else {
			if(agentType && !agentType[userId]) agentType[userId] = "Tier2";
		}
	}
    return agentType;
}

aggregation.ua_defn_agg.push({
    sys_domain: "sn_sow_inc",
    group_by: "Tier",
    agg_type: "count",
    agg_col: "Tier",
    group1: "Tier 1",
    agg_val: result["Tier1"],
});

aggregation.ua_defn_agg.push({
    sys_domain: "sn_sow_inc",
    group_by: "Tier",
    agg_type: "count",
    agg_col: "Tier",
    group1: "Tier 2",
    agg_val: result["Tier2"],
});

aggregation.count = result["Tier1"] + result["Tier2"];

answer = JSON.stringify(aggregation);
