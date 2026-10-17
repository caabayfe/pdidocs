getSchedule();

/**
 * Inserts records into the v_user_rotation schedule for the selected date range
 * and displays the list of records
 */
function getSchedule(gUser) {
	var timeZone = gs.getSession().getTimeZoneName();
	var dates = getDates();
	if (!gUser)
		gUser = gs.getUser();

	var userId = gUser.getID() + "";

	gs.include("OnCallRotationPersonal");
	var rotation = new OnCallRotationPersonal();
	//Remove old report data and repopulate the table
	deleteExistingRecords(userId);

	var myGroups = gUser.getMyGroups();
	//renderCatchAlls(myGroups, period);
	var it = myGroups.iterator();
	while (it.hasNext()) {
		var nextGroup = it.next() + "";
		var spans = rotation.onCallSpansDuringPeriod(nextGroup, dates.start, dates.end);
		var shiftSpans = [];
		var memberSpans = [];
		spans.forEach(function(span) {
			if (span.type == "rota") shiftSpans.push(span);
			else memberSpans.push(span);
		});
		saveMyRotationSpans(memberSpans, userId);
		handleCatchAll(nextGroup, dates.start, dates.end, userId, shiftSpans);
	}
	response.sendRedirect('v_user_rotation_list.do?sysparm_fixed_query=user%3D' + userId + '^ORDERBYstart_date_time');
}

/**
 * Iterates over array of spans and
 * saves the items matching current user
 *
 */
function saveMyRotationSpans(/*JS array*/ spans, userId) {
	var gr = new GlideRecord('v_user_rotation');

	var groupedSpans = {};
	spans.forEach(function(span) {
		var key = (span.rota_id || "") + (span.roster_id || "") + (span.user_id || "");
		if (!groupedSpans.hasOwnProperty(key))
			groupedSpans[key] = [];
		groupedSpans[key].push(span);
	});

	Object.keys(groupedSpans).forEach(function(key) {
		var span = groupedSpans[key][0];
		if (span.user_id !== userId) return;

		groupedSpans[key].forEach(function(span, idx) {
			gr.initialize();
			gr.current_user_id = userId;
			gr.roster = span.roster_id;
			gr.rota = span.rota_id;
			gr.user = span.user_id;
			gr.start_date_time = span.start;
			gr.end_date_time = span.end;
			gr.type = 'rotation';
			//Insert record and lookup any related child items
			saveMyBackupSpans(groupedSpans, groupedSpans[key], gr.insert(), userId, idx);
		});
	});

}

/**
 * Iterates over a list of schedule items,
 * compares them to given parent record and
 * saves the items as children of the parent record
 * taking into account the rotation type
 */
function saveMyBackupSpans(/*JSON*/ groupedSpans, /*JS array*/parent, /*string*/ parent_id, userId, idx) {
	var rotaId = parent[idx].rota_id;
	var onCall = new OnCallRotation();
	var escalationType = onCall.getEscalationType(rotaId);
	var lastOrder;
	if(escalationType == 'member'){
		var membersGR = new GlideRecord('cmn_rota_member');
		var gdt = new GlideDateTime();
		var roster = new GlideRecord('cmn_rota_roster');
		roster.addActiveQuery();
		roster.addQuery('rota', rotaId);
		roster.query();
		roster.next();
		var fromDate = new GlideDateTime(parent[idx].start);
		var toDate = new GlideDateTime(parent[idx].end);
		membersGR.addEncodedQuery("from=NULL^ORfrom<=" + fromDate.getDate().getValue());
		membersGR.addEncodedQuery("to=NULL^ORto>=" + toDate.getDate().getValue());
		membersGR.addQuery("roster", roster.sys_id);
		membersGR.orderBy('order');
		membersGR.query();
		membersGR.saveLocation();

		var membersLength = membersGR.getRowCount();
		while(membersGR.hasNext() && membersGR.member != parent[idx].user_id){
			membersGR.next();
		}
		var index = 0;
		var done = false;
		while (!done) {
			if (!membersGR.next()) {
				// end of list - start back at the beginning
				membersGR.restoreLocation(true);
				membersGR.next();
			}
			// Make sure we are not done now
			// Also break the loop if the user providing coverage is not a rota member
			if (membersGR.member == parent[idx].user_id || index == membersLength) {
				// We have wrapped all the way around
				done = true;
			} else {
				//Insert the backup record
				var order = index + 1;
				var gr = new GlideRecord('v_alternate_rotation');
				gr.initialize();
				gr.parent_rotation = parent_id;
				gr.current_user_id = userId;
				gr.roster = roster.sys_id;
				gr.order = order;
				gr.rota = parent[idx].rota_id;
				gr.user = membersGR.member;
				gr.insert();
				lastOrder = order;
				index++;
			}
		}

	}
	if(escalationType == 'roster'){
		//Iterate over the complete list schedule items
		var span = parent[idx];

		Object.keys(groupedSpans).forEach(function(key) {
			//Check for possible parent - child relationship based on time spans
			//If there is overlap it means that another member has duty at the same time = backup
			groupedSpans[key].forEach(function(item) {
				var overlaps = this.spansOverlap([span], [item]);
				if (item.user_id != span.user_id && item.rota_id == span.rota_id && item.roster_id !== span.roster_id && overlaps){
					var gr = new GlideRecord('v_alternate_rotation');
					gr.initialize();
					gr.parent_rotation = parent_id;
					gr.current_user_id = userId;
					gr.roster = item.roster_id;
					gr.order = item.order;
					//save last order for catch all record
					lastOrder = gr.order;
					gr.rota = item.rota_id;
					gr.user = item.user_id;
					gr.type = "rotation";
					gr.insert();
				}
			});

		});
	}
}



/**
 * Clean up virtual tables before
 * populating the new data.
 *
 */
function deleteExistingRecords(userId) {
	var v_user = new GlideRecord('v_user_rotation');
	v_user.initialize();
	v_user.addQuery('current_user_id', userId);
	v_user.deleteMultiple();

	var v_alt = new GlideRecord('v_alternate_rotation');
	v_alt.initialize();
	v_alt.addQuery('current_user_id', userId);
	v_alt.deleteMultiple();
}


/**
 * Get the date start and end dates for the users's requested rotation records
 * based on the schedule range value
 *
 */
function getDates() {
	var startDateTime;
	var endDateTime;

	switch(schedule_range) {
		case "today":
		startDateTime = new GlideDateTime(gs.daysAgoStart(0));
		endDateTime = new GlideDateTime(gs.daysAgoEnd(0));
		break;
		case "tomorrow":
		startDateTime = new GlideDateTime(gs.daysAgoStart(-1));
		endDateTime = new GlideDateTime(gs.daysAgoEnd(-1));
		break;
		case "this_week":
		startDateTime = new GlideDateTime(gs.beginningOfThisWeek());
		endDateTime = new GlideDateTime(gs.endOfThisWeek());
		break;
		case "next_week":
		startDateTime = new GlideDateTime(gs.beginningOfNextWeek());
		endDateTime = new GlideDateTime(gs.endOfNextWeek());
		break;
		case "this_month":
		startDateTime = new GlideDateTime(gs.beginningOfThisMonth());
		endDateTime = new GlideDateTime(gs.endOfThisMonth());
		break;
		case "next_month":
		startDateTime = new GlideDateTime(gs.beginningOfNextMonth());
		endDateTime = new GlideDateTime(gs.endOfNextMonth());
		break;
		case "this_quarter":
		startDateTime = new GlideDateTime(gs.beginningOfThisQuarter());
		endDateTime = new GlideDateTime(gs.endOfThisQuarter());
		break;
		case "next_quarter":
		startDateTime = new GlideDateTime(gs.quartersAgoStart(-1));
		endDateTime = new GlideDateTime(gs.quartersAgoEnd(-1));
		break;
		case "date_range":
		startDateTime = new GlideDateTime();
        startDateTime.setDisplayValue(start_date);
		endDateTime = new GlideDateTime();
        endDateTime.setDisplayValue(end_date);
        if (start_date === end_date) {
            endDateTime.addDays(1);
            endDateTime.add(-1);
        }
		break;
		default:
		startDateTime = new GlideDateTime(gs.daysAgoStart(0));
		endDateTime = new GlideDateTime(gs.daysAgoEnd(0));
	}

	return {start : startDateTime, end : endDateTime};
}

/**
 * Process all rotas associated to the given group
 *
 */
function handleCatchAll(group, startDate, endDate, userId, spans) {
	var rotas = new GlideRecord("cmn_rota");
	rotas.addActiveQuery();
	rotas.addQuery("group", group);
	rotas.query();
	
	// Go over each rota and save the catch all based on the selected catch all type
	while(rotas.next()){
		rotaSpans = spans.filter(function(span) {
			return span.rota_id == rotas.getUniqueValue();
		});
		if(rotas.catch_all == "individual" && rotas.catch_all_member == userId)
			saveCatchAll(rotas, "individual", startDate, endDate, userId, rotaSpans);

		else if(rotas.catch_all == "group_manager" && rotas.group.manager == userId)
			saveCatchAll(rotas, "group_manager", startDate, endDate, userId, rotaSpans);

		else if(rotas.catch_all == "all"){
			var members = new GlideRecord("cmn_rota_member");
			members.addQuery("roster", rotas.catch_all_roster);
			members.addQuery("member", userId);
			members.query();

			if(members.getRowCount() > 0)
				saveCatchAll(rotas, "all", startDate, endDate, userId, rotaSpans);
		}
	}

}

/**
 * Save the catch all record for a given rota
 * based on the given start and end dates
 *
 */
function saveCatchAll(rota, catchAllType, startDate, endDate, userId, spans) {

		var catchAll = new GlideRecord('v_user_rotation');

		spans.forEach(function(span) {

			catchAll.current_user_id = userId;
			catchAll.user = userId;
			catchAll.rota = span.rota_id;
			catchAll.start_date_time = span.start;
			catchAll.end_date_time = span.end;
			catchAll.type = catchAllType;
			catchAll.insert();
		});
	
		return;
}

function spansOverlap(spans1, spans2) {
	for (var i = 0; i< spans1.length; i++) {
		for (var j = 0; j< spans2.length; j++) {
			if(Math.max(spans1[i].startNumeric, spans2[j].startNumeric) <= Math.min(spans1[i].endNumeric, spans2[j].endNumeric)) {
				return true;
			}
		}
	}
	return false;
}
