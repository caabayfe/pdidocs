/**
 * Called with the following values:
 *
 * type - coverage, roster, time_off
 * member - id of selected member (if type = coverage or time_off)
 * group - id of group owning rota
 * coverage_on = id of covered roster (if type = coverage)
 * roster - id of selected roster (if type = roster) -- NB. actually the rota being added to!
 * start_date_time
 * end_date_time
 */

var scheduleId = '';
var query = '';

var ROSTER_ALL = '(all)';
var ROTA_PREFIX = 'R:';
var ROSTER_UNAVAILABLE = '(unavailable)';

// begin a new span record
var spanGR = new GlideRecord('roster_schedule_span');
spanGR.initialize();

var insertOk;

if (type === 'coverage')
	insertOk = redirectToOnCallCoverage();
else if (type === 'roster')
	insertOk = redirectToRoster();
else if (type === 'time_off')
	insertOk = redirectToTimeOff();

if (insertOk)
    response.sendRedirect(sanitizeUrl(goto_url));
else {
	var url = "on_call_add_item.do?" +
		"&sysparm_group=" + encodeArg(group) +
		"&sysparm_type=" + encodeArg(type) +
		"&sysparm_start=" + encodeArg(start_date_time) +
		"&sysparm_end=" + encodeArg(end_date_time) +
		"&sysparm_member=" + encodeArg(member) +
		"&sysparm_coverage_on=" + encodeArg(coverage_on) +
		"&sysparm_roster=" + encodeArg(roster) +
		"&sysparm_goto_url=" + encodeArg(goto_url) +
		"&sysparm_target_field" + encodeArg(target_field);
	response.sendRedirect(url);
}

function sanitizeUrl(url) {
    if (!GlideSecurityUtils.isURLWhiteListed(url))
        url = GlideSecurityUtils.enforceRelativeURL(url);

    if (!JSUtil.nil(url))
        return url;
    else
        return gs.getSession().getStack().pop();
}


function insertScheduleSpan(scheduleId) {
	// if we are attached to a schedule, complete the span record, insert it
	if (scheduleId) {
		/* get schedule record */
		var scheduleGR = new GlideRecord('cmn_schedule');
		if (scheduleGR.get(scheduleId)) {
			var start_sdt = GDTToSDT(start_date_time);
			var end_sdt = GDTToSDT(end_date_time);

			spanGR.schedule = scheduleId;
			spanGR.setValue("start_date_time", start_sdt.getValue());
			spanGR.setValue("end_date_time", end_sdt.getValue());
			return spanGR.insert();
		}
	}
	return false;
}

function encodeArg(myArg) {
	return Packages.java.net.URLEncoder.encode(myArg, "UTF-8");
}

function redirectToOnCallCoverage() {
	// get the schedule for this member - create one if needed
	var gr = new GlideRecord('sys_user');
	if (!gr.get(member)) {
		gs.addErrorMessage(gs.getMessage("Selected member not found - cannot continue"));
		return;
	}

	if (coverage_on.indexOf(ROSTER_UNAVAILABLE) === 0) {
		gs.addErrorMessage(gs.getMessage("No schedules cover that time-slot. Specify extra times for a Shift first"));
		return;
	}
	scheduleId = gr.schedule + '';
	// Create a new schedule for this user
	if (!scheduleId)
		scheduleId = createSchedule(gr);

	var rosterList = [];
	if (coverage_on.indexOf(ROSTER_ALL) === -1 || coverage_on.indexOf(ROTA_PREFIX) === 0)
		rosterList.push(coverage_on);
	else
		rosterList = coverage_on.substring(ROSTER_ALL.length).split(','); // can/will result in an empty last entry

	var i;
	for (i = 0; i < rosterList.length; i++) {
		if (rosterList[i] !== "") {
			var grr;
			var label = '';
			if (rosterList[i].indexOf(ROTA_PREFIX) === -1) {
				grr = new GlideRecord('cmn_rota_roster');
				if (!grr.get(rosterList[i])) {
					gs.addErrorMessage(gs.getMessage("Selected roster to cover for not found - cannot continue"));
					return;
				}
				spanGR.roster = rosterList[i];
				label = grr.name + ' ';
			}
			else {
				// actually a rota
				grr = new GlideRecord('cmn_rota');
				if (!grr.get(rosterList[i].substring(ROTA_PREFIX.length))) {
					gs.addErrorMessage(gs.getMessage("Selected rota to cover for not found - cannot continue"));
					return;
				}
				label = grr.name + ' ';
			}
			spanGR.name = gs.getMessage("{0} ({1}Coverage)", [gr.name, label]);
			spanGR.show_as = "on_call";
			spanGR.type = "on_call";
			spanGR.group = group;

			if (!insertScheduleSpan(scheduleId))
				return false;
			spanGR.initialize(); // ready for next one
		}
	}
	return true;
}

function redirectToTimeOff() {
	// get the schedule for this member - create one if needed
	var gr = new GlideRecord('sys_user');
	if (!gr.get(member)) {
		gs.addErrorMessage(gs.getMessage("Selected member not found - cannot continue"));
		return;
	}

	scheduleId = gr.schedule + '';
	// Create a new schedule for this user
	if (!scheduleId)
		scheduleId = createSchedule(gr);

	spanGR.name = gs.getMessage("{0} (Time off)", gr.name);
	spanGR.show_as = "busy";
	spanGR.type = "time_off";
	spanGR.group = group;

	return insertScheduleSpan(scheduleId);
}

function redirectToRoster() {
	// get the schedule for this rota - create one if needed
	var gr = new GlideRecord('cmn_rota');
	if (!gr.get(roster)) {
		gs.addErrorMessage(gs.getMessage("Selected rota not found - cannot continue"));
		return;
	}

	scheduleId = gr.schedule + '';
	// Create a new schedule for this rota
	if (!scheduleId)
		scheduleId = createSchedule(gr);

	spanGR.name = gr.name;
	spanGR.group = group;
	spanGR.show_as = "on_call";
	spanGR.type = "on_call";
	return insertScheduleSpan(scheduleId);
}

// Create a new schedule and attach it to the passed in document
function createSchedule(gr) {
	// determine user's time zone so we can set the user's schedule to that time zone
	var u = GlideUser.getUserByID(gr.sys_id);
	var tz = u.getTZ();

	var schedGR = new GlideRecord("cmn_schedule");
	schedGR.initialize();
	schedGR.time_zone = tz;
	schedGR.name = gr.getDisplayValue();
	schedGR.document = gr.getTableName();
	schedGR.document_key = gr.getUniqueValue();
	if (gr.getTableName() === 'cmn_rota')
		schedGR.type = 'roster'; // a rota's schedule
	var id = schedGR.insert();
	gr.schedule = id;
	gr.update();

	return id;
}

// Convert GlideDateTime to ScheduleDateTime.
function GDTToSDT(gdt) {
	var inputTZ = gs.getSession().getTimeZoneName();
	var sdt =  new GlideScheduleDateTime(gdt);
	sdt.setTimeZone(inputTZ);  // start with user's time zone
	sdt.setTimeZone("Etc/UTC");
	return sdt;
}
