(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// Simple toJS function
	function toJS(gr) {
		if (typeof gr === "undefined")
			return;

		if (!gr.canRead())
			return;

		// Always exclude meta fields
		var exclude = {
			sys_scope: true,
			sys_replace_on_upgrade: true,
			sys_policy: true,
			sys_package: true,
			sys_customer_update: true,
			sys_domain: true,
			sys_domain_path: true,
			user_password: true
		};

		var obj = {
			can_write: gr.canWrite()
		};

		var el = gr.getElements();
		for (var i=0; i < el.length; i++) {
			var elem = el[i];
			var elName = elem.getName()+"";

			if (!elem.canRead() || exclude[elName])
				continue;

			obj[elName] = {};
			obj[elName].display_value = elem.getDisplayValue();
			obj[elName].value = elem.toString();

			var fieldType = elem.getED().getInternalType();
			if (fieldType == "glide_date_time" || fieldType == "glide_date" || fieldType == "glide_time")
				obj[elName].tz_name = gs.getSession().getTimeZoneName();
		}

		return obj;
	}

	// Unique value function for use with arr.reduce
	function reduceUniqueValues (a,b){
		if (a.indexOf(b) < 0)
			a.push(b);
		return a;
	}

	// Validation of call
	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId)
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var incidentGr = new GlideRecord('incident');
	if (!incidentGr.get(incidentSysId))
		return new sn_ws_err.NotFoundError("Requested Incident not found");

	var respData = {
		incident_alert: [],
		user: {},
		group: {}
	};
	var iamIds = [];
	var iamRefs = {}; // This object is only for internal use for quick reference later on.

	var iamGr = new GlideRecord("incident_alert");
	iamGr.addQuery("source_incident", incidentSysId);
	iamGr.addActiveQuery();
	iamGr.orderBy("order");
	iamGr.query();

	while (iamGr.next()) {
		var jsIAM = toJS(iamGr);
		if (jsIAM) {
			jsIAM.contact = [];
			jsIAM.ia_tasks = [];
			respData.incident_alert.push(jsIAM);
			iamIds.push(iamGr.getUniqueValue()+"");
			iamRefs[iamGr.getUniqueValue()+""] = jsIAM;
		}
	}

	var userIds = [];
	var groupIds = [];
	var paGrp = {};
	// Get Associated Conference Calls if notify is installed
	var confGr = new GlideRecord("notify_conference_call");
	if (confGr.isValid()) {
		confGr.addQuery("source", "IN", iamIds.join(","));
		confGr.addActiveQuery();
		confGr.query();

		var confRefs = {};
		var confIds = [];

		while (confGr.next()) {
			if (!iamRefs[confGr.source+""])
				continue;

			var jsConf = toJS(confGr);
			if (!jsConf)
				continue;

			confRefs[confGr.getUniqueValue()+""] = jsConf;
			confIds.push(confGr.getUniqueValue()+"");

			if (!iamRefs[confGr.source+""].notify_conference_call)
				iamRefs[confGr.source+""].notify_conference_call = [];

			iamRefs[confGr.source+""].notify_conference_call.push(jsConf);
		}

		// Got all the conferences, no all the participants
		var participantGr = new GlideRecord("notify_participant");
		participantGr.addActiveQuery();
		participantGr.addQuery("notify_conference_call", "IN", confIds.join(","));
		participantGr.orderBy("sys_created_on");
		participantGr.query();

		while (participantGr.next()) {
			if (!confRefs[participantGr.notify_conference_call+"" ])
				continue;

			var jsParticipant = toJS(participantGr);
			if (!jsParticipant)
				continue;

			if (!confRefs[participantGr.notify_conference_call+""].notify_participant)
				confRefs[participantGr.notify_conference_call+""].notify_participant = [];

			if (!confRefs[participantGr.notify_conference_call+""].user_participant)
				confRefs[participantGr.notify_conference_call+""].user_participant = [];

			confRefs[participantGr.notify_conference_call+""].user_participant.push(jsParticipant.user.value);
			confRefs[participantGr.notify_conference_call+"" ].notify_participant.push(jsParticipant);
			userIds.push(jsParticipant.user.value);
			if (!gs.nil(participantGr.group + "")) {
				groupIds.push(participantGr.group + "");
				paGrp[participantGr.user + ""] = participantGr.group + "";
			}
		}
	}

	var contGr = new GlideRecord("contact");
	contGr.addQuery("document", "IN", iamIds.join(","));
	contGr.query();

	while (contGr.next()) {
		if (!iamRefs[contGr.document+""])
			continue;

		var jsContact = toJS(contGr);
		if (!jsContact)
			continue;

		iamRefs[contGr.document+""].contact.push(jsContact);

		if (!contGr.group.nil())
			groupIds.push(contGr.group + "");

		if (!contGr.user.nil())
			userIds.push(contGr.user+"");
	}
	var grpGr = new GlideAggregate("sys_user_grmember");
	grpGr.addQuery("user", "IN", userIds);
	grpGr.addQuery("group.active", true);
	grpGr.groupBy("group");
	grpGr.query();
	while (grpGr.next())
		groupIds.push(grpGr.getValue("group"));

	var userGroupRef = {};
	if (groupIds.length > 0) {
		groupIds = groupIds.reduce(reduceUniqueValues, []);
		var userGroupGr = new GlideRecord("sys_user_grmember");
		userGroupGr.addQuery("group", "IN", groupIds.join(","));
		userGroupGr.query();

		while (userGroupGr.next()) {
			if (!userGroupRef[userGroupGr.group+""])
				userGroupRef[userGroupGr.group+""] = [];

			if (paGrp[userGroupGr.user+""] + "" == "undefined" || paGrp[userGroupGr.user + ""] == userGroupGr.group + "")
				userGroupRef[userGroupGr.group + ""].push(userGroupGr.user + "");

			userIds.push(userGroupGr.user + "");
		}
	}

	if (groupIds.length > 0) {
		var groupGr = new GlideRecord("sys_user_group");
		groupGr.addQuery("sys_id", "IN", groupIds.join(","));
		groupGr.query();

		while (groupGr.next()) {
			var jsGroup = toJS(groupGr);
			if (!jsGroup)
				continue;

			if (userGroupRef[groupGr.getUniqueValue()+""])
				jsGroup.user = userGroupRef[groupGr.getUniqueValue()+""];

			respData.group[groupGr.getUniqueValue()+""] = jsGroup;
		}
	}

	if (userIds.length > 0) {
		userIds = userIds.reduce(reduceUniqueValues, []);
		var userGr = new GlideRecord("sys_user");
		userGr.addQuery("sys_id", "IN", userIds.join(","));
		userGr.query();

		var mwu = new global.MIMWorkbenchUtil();
		while (userGr.next()) {
			var jsUser = toJS(userGr);
			if (!jsUser)
				continue;

			jsUser.live_profile = mwu.getUserProfile(userGr);
			respData.user[userGr.getUniqueValue()+""] = jsUser;
		}
	}

	//Spin over each IAM, add in user_contact structure for list of all user ids available for that IA
	respData.incident_alert.forEach(function(ia) {
		ia.user_contact = [];
		ia.contact.forEach(function(contact) {
			if (contact.user.value && respData.user[contact.user.value])
				ia.user_contact.push(contact.user.value);

			if (contact.group.value && respData.group[contact.group.value])
				ia.user_contact = ia.user_contact.concat(respData.group[contact.group.value].users);
		});

		ia.user_contact = ia.user_contact.reduce(reduceUniqueValues, []);
	});

	var iaTaskGr = new GlideRecord("incident_alert_task");
	iaTaskGr.addQuery("incident_alert", "IN", iamIds.join(","));
	iaTaskGr.orderBy('order');
	iaTaskGr.query();
	while (iaTaskGr.next()) {
		var jsIaTask = toJS(iaTaskGr);
		if (jsIaTask) {
			iamRefs[iaTaskGr.incident_alert + ""].ia_tasks.push(jsIaTask);
		}
	}


	return respData;
})(request, response);
