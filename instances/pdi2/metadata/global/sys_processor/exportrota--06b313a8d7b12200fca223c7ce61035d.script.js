var rotaSysId = g_request.getParameter('sysparm_sys_id');
var groupSysId = g_request.getParameter('sysparm_group_id');
var scheduleSysId = g_request.getParameter('sysparm_schedule_id');
var scheduleBasedOnSysId = g_request.getParameter('sysparm_schedule_based_id');
var extra = g_request.getParameter('sysparm_extra');

var exporter = new ExportWithRelatedLists('cmn_rota', rotaSysId);
var usersSysIds = getGroupUsers(groupSysId);
var userSchedules = getUserSchedule(usersSysIds);
exporter.addQuerySet('sys_user', 'sys_idIN' + usersSysIds);
exporter.addQuerySet('cmn_schedule', 'sys_idIN' + userSchedules);
exporter.addQuerySet('cmn_schedule_span', 'sys_idIN' + getScheduleSpan(userSchedules));
exporter.addQuerySet('sys_user_has_role', 'sys_idIN' + getUserHasRoles(usersSysIds));
exporter.addQuerySet('sys_user_group', 'sys_id=' + groupSysId);
exporter.addQuerySet('sys_user_grmember', 'sys_idIN' + getUserGroup(groupSysId, usersSysIds));
exporter.addRelatedList('cmn_rota_roster', 'rota');
exporter.addQuerySet('cmn_schedule', 'sys_id=' + scheduleSysId);
exporter.addQuerySet('cmn_schedule', 'sys_id=' + scheduleBasedOnSysId);
exporter.addQuerySet('cmn_schedule_span', 'sys_idIN' + getScheduleSpan(scheduleSysId));
var memberSysIds = getMembers(rotaSysId);
exporter.addQuerySet('cmn_rota_member', 'sys_idIN' + memberSysIds);
var rotationScheduleSysIds = getRotationSchedule(memberSysIds);
exporter.addQuerySet('cmn_schedule', 'sys_idIN' + rotationScheduleSysIds);
exporter.addQuerySet('cmn_schedule_span', 'sys_idIN' + getScheduleSpan(rotationScheduleSysIds));

if (extra != null)
	exporter.addQuerySet('roster_schedule_span', 'sys_idIN' + getRosterScheduleSpans(groupSysId));

exporter.exportRecords(g_response);

// Get Rotation Schedule
function getRotationSchedule(memberSysIds) {
	var gr = new GlideRecord('cmn_rota_member');
	gr.addQuery('sys_id', 'IN', memberSysIds);
	gr.query();
	var rotationSchedules = [];
	while (gr.next())
		rotationSchedules.push(gr.rotation_schedule.sys_id + '');
	return rotationSchedules.join(',');
}

// Get Schedule Entry / Rotation Schedule Entry
function getScheduleSpan(scheduleSysId, type) {
	var gr = new GlideRecord('cmn_schedule_span');
	gr.addQuery('schedule', 'IN', scheduleSysId);
	gr.addQuery('sys_class_name', 'cmn_schedule_span');
	gr.query();
	var scheduleSysIds = [];
	while (gr.next())
		scheduleSysIds.push(gr.getUniqueValue());
	return scheduleSysIds.join(',');
}

// Get Rota Members
function getMembers(rotaId) {
	var grRosters = new GlideRecord('cmn_rota_roster');
	grRosters.addQuery('rota', rotaId);
	grRosters.query();
	var rosterIds = [];
	while (grRosters.next())
		rosterIds.push(grRosters.getUniqueValue());

	var gr = new GlideRecord('cmn_rota_member');
	gr.addQuery('roster', 'IN', rosterIds.join(','));
	gr.query();
	var members = [];
	while (gr.next())
		members.push(gr.getUniqueValue());
	return members.join(',');
}

// Get group users including its manager
function getGroupUsers(sysId) {
	var grGroup = new GlideRecord('sys_user_group');
	var managerSysId = '';
	if (grGroup.get(groupSysId))
		managerSysId = grGroup.manager + '';
	var users = [];
	if (managerSysId != '')
		users.push(managerSysId);
	var gr = new GlideRecord('sys_user_grmember');
	gr.addQuery('group', sysId);
	gr.query();
	while (gr.next())
		users.push(gr.user.sys_id + '');
	return users.join(',');
}

//Get User Schedules
function getUserSchedule(usersSysIds) {
	var userSchedules = [];
	var groupUsers = getGroupUsers(groupSysId);
	var userGR = new GlideRecord('sys_user');
	userGR.addQuery('sys_id', 'IN', groupUsers);
	userGR.query();
	while(userGR.next()){
		var scheduleSysId = userGR.getValue('schedule');
		if(gs.nil(scheduleSysId))
			continue;
		userSchedules.push(scheduleSysId + '');
	}
	return userSchedules.join(',');
}

// Get user-role relationships
function getUserHasRoles(userSysIds) {
	var gr = new GlideRecord('sys_user_has_role');
	gr.addQuery('user', 'IN', userSysIds);
	gr.query();
	var rolesSysIds = [];
	while (gr.next())
		rolesSysIds.push(gr.getUniqueValue());
	return rolesSysIds.join(',');
}

// Get user-group relationship
function getUserGroup(groupSysId, userSysIds) {
	var gr = new GlideRecord('sys_user_grmember');
	gr.addQuery('group', groupSysId);
	gr.addQuery('user', 'IN', userSysIds);
	gr.query();
	var userGroupSysIds = [];
	while (gr.next())
		userGroupSysIds.push(gr.getUniqueValue());
	return userGroupSysIds.join(',');
}

function getRosterScheduleSpans(groupSysId) {
	var gr = new GlideRecord('roster_schedule_span');
	gr.addQuery('group', groupSysId);
	gr.query();
	var rosterScheduleSysIds = [];
	while (gr.next())
		rosterScheduleSysIds.push(gr.getUniqueValue());
	return rosterScheduleSysIds.join(',');
}
