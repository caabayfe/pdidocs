(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	// Simple toJS function
	var workbenchUtils = new global.MIMWorkbenchUtil();
	var maxLength = 5;
	function toJS(gr, requiredFields) {
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
			sys_customer_update: true
		};

		var obj = {};

		var el = gr.getElements();
		for (var i=0; i < el.length; i++) {
			var elem = el[i];
			var elName = elem.getName()+"";
			
			if ((!elem.canRead() || exclude[elName]) || (requiredFields && requiredFields.indexOf(elName) == -1))
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


	// Validation of call
	var incidentSysId = request.pathParams.incidentSysId;
	if (!incidentSysId)
		return new sn_ws_err.BadRequestError("Incident id not provided");

	var incidentGr = new GlideRecord('incident');
	if (!incidentGr.get(incidentSysId))
		return new sn_ws_err.NotFoundError("Requested Incident not found");

	//Set up lookup based in incident data
	var incidentSysIds = [incidentSysId];
	var affectedCIIds = [];
	if (!incidentGr.cmdb_ci.nil() && incidentGr.cmdb_ci.getRefRecord().canRead())
		affectedCIIds.push(incidentGr.cmdb_ci+"");

	var serviceIds = [];
	//Building Response object
		var respData = {
		affected_ci: {
			"count": 0,
			"data": [],
			"link": {
				"list": "/task_ci_list.do?sysparm_nameofstack=mim_wb_affected_ci&sysparm_query=task%3D" + incidentSysId,
				"edit": "/sys_m2m_template.do?sys_is_list=true&sys_is_related_list=true&sys_target=task_ci"+
						"&sysparm_checked_items=&sysparm_collection=incident&sysparm_collectionID=" + incidentSysId +
						"&sysparm_collection_key=task&sysparm_collection_label=Affected+CIs"+
						"&sysparm_collection_related_field=ci_item&sysparm_collection_related_file=cmdb_ci"+
						"&sysparm_collection_relationship=&sysparm_fixed_query=&sysparm_group_sort=&sysparm_list_css="+
						"&sysparm_m2m_ref=task_ci&sysparm_query=&sysparm_stack=no&sysparm_target=&sysparm_view="
			},
			can_add: workbenchUtils.canCreate('task_ci') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('cmdb_ci'),
			display_fields: ['name', 'support_group', 'owned_by', 'sys_id'],
			record_url: "/cmdb_ci.do?sysparm_query=sys_id={sys_id}"
		},
		impacted_service: {
			"count": 0,
			"data": [],
			"link": {
				"list": "/task_cmdb_ci_service_list.do?sysparm_nameofstack=mim_wb_impacted_service&sysparm_query=task%3D" + incidentSysId,
				"edit": "/sys_m2m_template.do?sys_is_list=true&sys_is_related_list=true&sys_target=task_cmdb_ci_service" +
						"&sysparm_checked_items=&sysparm_collection=incident&sysparm_collectionID=" + incidentSysId +
						"&sysparm_collection_key=task&sysparm_collection_label=Impacted+Services" +
						"&sysparm_collection_related_field=cmdb_ci_service&sysparm_collection_related_file=cmdb_ci" +
						"&sysparm_collection_relationship=&sysparm_fixed_query=&sysparm_group_sort=&sysparm_list_css=" +
						"&sysparm_m2m_ref=task_cmdb_ci_service&sysparm_query=&sysparm_stack=no&sysparm_target=&sysparm_view="
			},
			can_add: workbenchUtils.canCreate('task_cmdb_ci_service') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('cmdb_ci'),
			display_fields: ['name', 'business_criticality', 'owned_by', 'sys_id'],
			record_url: "/cmdb_ci.do?sysparm_query=sys_id={sys_id}" 
		},
		incident_task: {
			"count": 0,
			"data": [],
			"link": {
				"list": "/incident_task_list.do?sysparm_nameofstack=mim_wb_incident_task&sysparm_query=incident%3D" + incidentSysId
			},
			can_create: workbenchUtils.canCreate('incident_task'),
			labels: workbenchUtils.getTableFieldsMap('incident_task'),
			display_fields: ['number', 'short_description', 'assigned_to', 'sys_id'],
			record_url: "/incident_task.do?sysparm_query=sys_id={sys_id}"
		},
		outage: {
			"count": 0,
			"data": [],
			"link": {
				"list": "/task_outage_list.do?sysparm_nameofstack=mim_wb_outage&sysparm_query=task%3D" + incidentSysId
			},
			can_create: workbenchUtils.canCreate('task_outage') && workbenchUtils.canCreate('cmdb_ci_outage'),
			labels: workbenchUtils.getTableFieldsMap('cmdb_ci_outage'),
			display_fields: ['cmdb_ci', 'type', 'begin', 'end', 'sys_id'],
			record_url: "/cmdb_ci_outage.do?sysparm_query=sys_id={sys_id}"
		},
		affected_location: {
			"count": 0,
			"data": [],
			"link": {
				"list": "/task_location_list.do?sysparm_nameofstack=mim_wb_affected_location&sysparm_query=task%3D" + incidentSysId
			},
			can_add: workbenchUtils.canCreate('task_location') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('cmn_location'),
			display_fields: ['name', 'city', 'country', 'sys_id'],
			record_url: "/cmn_location.do?sysparm_query=sys_id={sys_id}"
		}
	};
	
	// Don't show child incident cards, if feature is not enabled.
	if (incidentGr.isValidField("parent_incident")) {
		respData.child_incident = {
			"count": 0,
			"data": [],
			"link": {
				"list": "/incident_list.do?sysparm_nameofstack=mim_wb_incident&sysparm_view=major_incident_workbench_child_incident_list&sysparm_view_forced=true&sysparm_query=parent_incident%3D" + incidentSysId,
				"edit": "/sys_m2m_template.do?sys_is_list=true&sys_is_related_list=true&sys_target=incident" +
						"&sysparm_checked_items=&sysparm_collection=incident&sysparm_collectionID=" + incidentSysId +
						"&sysparm_collection_key=parent_incident&sysparm_collection_label=Child+Incidents" +
						"&sysparm_collection_related_field=&sysparm_collection_related_file=incident" +
						"&sysparm_collection_relationship=&sysparm_fixed_query=&sysparm_form_type=o2m&sysparm_group_sort=&sysparm_list_css=" +
						"&sysparm_m2m_ref=incident&sysparm_query=&sysparm_stack=no&sysparm_target=&sysparm_view="
			},
			can_add: workbenchUtils.canWrite('incident'),
			can_create: workbenchUtils.canCreate('incident') && gs.hasRole('itil,sn_incident_write') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('incident'),
			display_fields: ['number', 'short_description', 'caller_id', 'sys_id'],
			record_url: "/incident.do?sysparm_query=sys_id={sys_id}"
		};

		// Get all the child incidents
		var childIncidentGr = new GlideRecord("incident");
		childIncidentGr.addQuery("parent_incident", incidentSysId);
		childIncidentGr.orderByDesc("sys_created_on");
		childIncidentGr.query();

		respData.child_incident.count = childIncidentGr.getRowCount();
		var i = 1;
		while (childIncidentGr.next() && i <= maxLength) {
			var jsInc = toJS(childIncidentGr, respData.child_incident.display_fields);
			if (jsInc) {
				respData.child_incident.data.push(jsInc);
				i++;
			}
		}
	}

	// Get all the incident tasks
	var incidentTaskGr = new GlideRecord("incident_task");
	incidentTaskGr.addQuery("incident", incidentSysId);
	incidentTaskGr.orderByDesc("sys_created_on");
	incidentTaskGr.query();

	respData.incident_task.count = incidentTaskGr.getRowCount();
	i = 1;
	while (incidentTaskGr.next() && i <= maxLength) {
		var jsIncTask = toJS(incidentTaskGr, respData.incident_task.display_fields);
		if (jsIncTask) {
			respData.incident_task.data.push(jsIncTask);
			i++;
		}
	}

	// Get all the cmdb_ci outages
	var cmdbCIOutageGr = new GlideRecord('cmdb_ci_outage');
	cmdbCIOutageGr.addEncodedQuery('JOINcmdb_ci_outage.sys_id=task_outage.outage!task=' + incidentSysId);
	cmdbCIOutageGr.query();
	respData.outage.count = cmdbCIOutageGr.getRowCount();
	i = 1;
	
	while(cmdbCIOutageGr.next() && i <= maxLength) {
		var jsOutage = toJS(cmdbCIOutageGr, respData.outage.display_fields);
		if (jsOutage) {
			respData.outage.data.push(jsOutage);
			i++;
		}
	}

	// Get all the affected locations
	var taskLocationGr = new GlideRecord("task_location");
	taskLocationGr.addQuery("task", incidentSysId);
	taskLocationGr.orderByDesc("sys_created_on");
	taskLocationGr.query();

	respData.affected_location.count = taskLocationGr.getRowCount();
	i = 1;
	while (taskLocationGr.next() && i <= maxLength && taskLocationGr.canRead()) {
		var locationGr = new GlideRecord('cmn_location');
		if (locationGr.get(taskLocationGr.location + '')) {
			var jsAffectedLocation = toJS(locationGr, respData.affected_location.display_fields);
			if (jsAffectedLocation) {
				respData.affected_location.data.push(jsAffectedLocation);
				i++;
			}
		}
	}

	var ciRefs = {};
	var CIOutages = {};
	var outType = {
		"outage": 0,
		"degradation": 1,
		"planned": 2
	};

	/*Affected CIS's*/
	var cmdbCIOutageGr = new GlideRecord('cmdb_ci_outage');
	var now = new GlideDateTime().getValue();
	cmdbCIOutageGr.addQuery('task_number', "IN", incidentSysIds.join(","));
	cmdbCIOutageGr.addQuery("begin", "<=", now);
	var qc = cmdbCIOutageGr.addNullQuery('end');
	qc.addOrCondition("end", ">=", now);
	cmdbCIOutageGr.addEncodedQuery('JOINcmdb_ci_outage.cmdb_ci=task_ci.ci_item!task=' + incidentSysIds.join(','));
	cmdbCIOutageGr.setLimit(maxLength - affectedCIIds.length);
	cmdbCIOutageGr.query();
	while(cmdbCIOutageGr.next() && cmdbCIOutageGr.cmdb_ci.getRefRecord().canRead()) {
		if (affectedCIIds.indexOf(cmdbCIOutageGr.cmdb_ci + '') == -1) {
			affectedCIIds.push(cmdbCIOutageGr.cmdb_ci + '');
			if (!CIOutages[cmdbCIOutageGr.cmdb_ci + ""]) {
				CIOutages[cmdbCIOutageGr.cmdb_ci + ""] = toJS(cmdbCIOutageGr);
			}
			if (affectedCIIds.length == maxLength) {
				break;
			}
		}
	}
	if (affectedCIIds.length < maxLength) {
		var taskCIGr = new GlideRecord('task_ci');
		taskCIGr.addQuery('ci_item','NOT IN', affectedCIIds.join(","));
		taskCIGr.addQuery('task', 'IN', incidentSysIds.join(","));
		taskCIGr.setLimit(maxLength - affectedCIIds.length);
		taskCIGr.query();
		while(taskCIGr.next() && taskCIGr.canRead()) {
				affectedCIIds.push(taskCIGr.ci_item + '');
				if (affectedCIIds.length == maxLength) {
					break;
				}
		}
	}
	var ciGr = new GlideRecord("cmdb_ci");
	ciGr.addQuery("sys_id", "IN", affectedCIIds.join(","));
	ciGr.query();
	while (ciGr.next()) {
		var jsCI = toJS(ciGr, respData.affected_ci.display_fields);
		if (jsCI)
			respData.affected_ci.data.push(jsCI);
		if (CIOutages[ciGr.getUniqueValue()+""])
			jsCI.current_outage = CIOutages[ciGr.getUniqueValue()+""];
		ciRefs[ciGr.getUniqueValue()+""] = jsCI;
	}

	var totalAffectedCIsGr = new GlideAggregate('task_ci');
	totalAffectedCIsGr.addQuery('task', 'IN', incidentSysIds.join(","));
	totalAffectedCIsGr.addAggregate('COUNT');
	totalAffectedCIsGr.query();
	respData.affected_ci.count = 0;
	if (totalAffectedCIsGr.next())
		respData.affected_ci.count = parseInt(totalAffectedCIsGr.getAggregate('COUNT'));
	
	if (respData.affected_ci.data.length < maxLength && respData.affected_ci.count != respData.affected_ci.data.length) {
		//duplicate Affected CI's
		var taskCIGr1 = new GlideAggregate('task_ci');
		taskCIGr1.addQuery('task', 'IN',incidentSysIds.join(","));
		taskCIGr1.addAggregate('COUNT');  
		taskCIGr1.groupBy('ci_item');
		taskCIGr1.query();
		while(taskCIGr1.next() && taskCIGr1.canRead()) {
			var count = parseInt(taskCIGr1.getAggregate('COUNT'));
			if (count > 1) {
				for (var j = 1; j < count; j++) {
					var jsCI1 = ciRefs[taskCIGr1.ci_item + ""];
					if (jsCI1)
						respData.affected_ci.data.push(jsCI1);
					if (respData.affected_ci.data.length == maxLength)
						break;
				}
			}
			if (respData.affected_ci.data.length == maxLength)
				break;
		}
	}
	/*Impacted services*/
	var cmdbCIOutageGr1 = new GlideRecord('cmdb_ci_outage');
	cmdbCIOutageGr1.addQuery("begin", "<=", now);
	cmdbCIOutageGr1.addQuery('task_number', "IN", incidentSysIds.join(","));
	var qc1 = cmdbCIOutageGr1.addNullQuery('end');
	qc1.addOrCondition("end", ">=", now);
	cmdbCIOutageGr1.addEncodedQuery('JOINcmdb_ci_outage.cmdb_ci=task_cmdb_ci_service.cmdb_ci_service!task=' + incidentSysIds.join(","));
	cmdbCIOutageGr1.setLimit(maxLength - serviceIds.length);
	cmdbCIOutageGr1.query();
	while(cmdbCIOutageGr1.next() && cmdbCIOutageGr1.cmdb_ci.getRefRecord().canRead()) {
		if (serviceIds.indexOf(cmdbCIOutageGr1.cmdb_ci + '') == -1) {
			serviceIds.push(cmdbCIOutageGr1.cmdb_ci + '');
			if (!CIOutages[cmdbCIOutageGr1.cmdb_ci + ""]) {
				CIOutages[cmdbCIOutageGr1.cmdb_ci + ""] = toJS(cmdbCIOutageGr1);
			}
			if (serviceIds.length == maxLength) {
				break;
			}
		}
	}
	if (serviceIds.length < maxLength) {
		var taskCISerGr = new GlideRecord('task_cmdb_ci_service');
		taskCISerGr.addQuery('cmdb_ci_service','NOT IN', serviceIds.join(","));
		taskCISerGr.addQuery('task', 'IN', incidentSysIds.join(","));
		taskCISerGr.setLimit(maxLength - serviceIds.length);
		taskCISerGr.query();
		while(taskCISerGr.next() && taskCISerGr.canRead()) {
				serviceIds.push(taskCISerGr.cmdb_ci_service + '');
				if (serviceIds.length == maxLength) {
					break;
				}
		}
	}
	var ciServGr = new GlideRecord("cmdb_ci");
	ciServGr.addQuery("sys_id", "IN", serviceIds.join(","));
	ciServGr.query();
	while (ciServGr.next()) {
		var jsSerCI = toJS(ciServGr, respData.impacted_service.display_fields);
		if (jsSerCI)
			respData.impacted_service.data.push(jsSerCI);
		if (CIOutages[ciServGr.getUniqueValue()+""])
			jsSerCI.current_outage = CIOutages[ciServGr.getUniqueValue()+""];
		ciRefs[ciServGr.getUniqueValue()+""] = jsSerCI;
	}
	var totalImpactedServicesGr = new GlideAggregate('task_cmdb_ci_service');
	totalImpactedServicesGr.addAggregate('COUNT');
	totalImpactedServicesGr.addQuery('task', 'IN', incidentSysIds.join(","));
	totalImpactedServicesGr.query();
	respData.impacted_service.count = 0;
	if (totalImpactedServicesGr.next())
		respData.impacted_service.count = parseInt(totalImpactedServicesGr.getAggregate('COUNT'));

	if (respData.impacted_service.data.length < maxLength && respData.impacted_service.count != respData.impacted_service.data.length) {
		//duplicate impacted service's
		var taskCISerGr1 = new GlideAggregate('task_cmdb_ci_service');
		taskCISerGr1.addQuery('task', 'IN',incidentSysIds.join(","));
		taskCISerGr1.addAggregate('COUNT');  
		taskCISerGr1.groupBy('cmdb_ci_service');
		taskCISerGr1.query();
		while(taskCISerGr1.next() && taskCISerGr1.canRead()) {
			var count1 = parseInt(taskCISerGr1.getAggregate('COUNT'));
			if (count1 > 1) {
				for (var k = 1; k < count1; k++) {
					var jsSerCI1 = ciRefs[taskCISerGr1.cmdb_ci_service + ""];
					if (jsSerCI1)
						respData.impacted_service.data.push(jsSerCI1);
					if (respData.impacted_service.data.length == maxLength)
						break;
				}
			}
			if (respData.impacted_service.data.length == maxLength)
				break;
		}
	}
	// And now order all the CI stuff based on the outage.
	function orderByOutage(ciA, ciB) {
		// If there is an outage
		if (ciA.current_outage && !ciB.current_outage)
			return -1;
		if (!ciA.current_outage && ciB.current_outage)
			return 1;
		if (!ciA.current_outage && !ciB.current_outage)
			return 0;

		// Type of outage
		if (outType[ciA.current_outage.type.value] < outType[ciB.current_outage.type.value])
			return -1;
		if (outType[ciA.current_outage.type.value] > outType[ciB.current_outage.type.value])
			return 1;

		// Outage begin
		var ciABegin = new GlideDateTime(ciA.current_outage.begin.value);
		var ciBBegin = new GlideDateTime(ciB.current_outage.begin.value);

		if (ciABegin.getNumericValue() > ciBBegin.getNumericValue())
			return -1;
		if (ciABegin.getNumericValue() < ciBBegin.getNumericValue())
			return 1;

		// Both equal
		return 0;
	}

	respData.affected_ci.data.sort(orderByOutage);
	respData.impacted_service.data.sort(orderByOutage);

	// Get all the related alerts
	if (GlidePluginManager().isActive('com.glideapp.itom.snac')) {
		respData.alerts = {
			"count": 0,
			"data": [],
			"link": {
				"list": "/em_alert_list.do?sysparm_nameofstack=mim_wb_em_alert&sysparm_query=sys_idIN"
			},
			labels: workbenchUtils.getTableFieldsMap('em_alert'),
			display_fields: ['number', 'cmdb_ci', 'description', 'state', 'sys_id'],
			record_url: "/em_alert.do?sysparm_query=sys_id={sys_id}"
		};

		var alertSysIds = new MajorIncidentEvtMgmtUtils().getRelatedAlerts(incidentSysId);
		var allAlerts = alertSysIds.split(",");
		
		if (alertSysIds) {
			respData.alerts.count = allAlerts.length;
			respData.alerts.link.list += "javascript: new sn_major_inc_mgmt.MajorIncidentEvtMgmtUtils().getRelatedAlerts(\"" + incidentSysId + "\")";
			var n = 0;
			i=1;
			while (n < allAlerts.length && i++ <= maxLength) {
				var alertGr = new GlideRecord('em_alert');
				alertGr.get(allAlerts[n++]);
				var jsAlert = toJS(alertGr, respData.alerts.display_fields);
 				if (jsAlert)
					respData.alerts.data.push(jsAlert);
			}
		}
	}
	
	// Post Incident Report related lists
	if(workbenchUtils.getResolvedIncidentStates().indexOf(incidentGr.state.toString()) != -1 && (incidentGr.major_incident_state.toString() == 'accepted')) {
		respData.related_records = {
			display_fields: ['number', 'short_description', 'assigned_to', 'sys_id'],
			problem_id: {
				labels: workbenchUtils.getTableFieldsMap('problem'),
				record_url: "/problem.do?sysparm_query=sys_id={sys_id}"
			},
			rfc: {
				labels: workbenchUtils.getTableFieldsMap('change_request'),
				record_url: "/change_request.do?sysparm_query=sys_id={sys_id}"
			},
			caused_by: {
				labels: workbenchUtils.getTableFieldsMap('change_request'),
				record_url: "/change_request.do?sysparm_query=sys_id={sys_id}"
			}
		};
		respData.related_problem = {
			"count": 0,
			"data": [],
			"link": {
				"list": "problem_list.do?sysparm_nameofstack=mim_wb_problem&sysparm_query=parent%3D" + incidentSysId
			},
			can_add: workbenchUtils.canCreate('problem') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('problem'),
			display_fields: ['number', 'short_description', 'assigned_to', 'sys_id'],
			record_url: "/problem.do?sysparm_query=sys_id={sys_id}"
		};
		respData.related_change_request = {
			"count": 0,
			"data": [],
			"link": {
				"list": "change_request_list.do?sysparm_nameofstack=mim_wb_change_request&sysparm_query=parent%3D" + incidentSysId
			},
			can_add: workbenchUtils.canCreate('change_request') && workbenchUtils.isActive(incidentGr),
			labels: workbenchUtils.getTableFieldsMap('change_request'),
			display_fields: ['number', 'short_description', 'assigned_to', 'sys_id'],
			record_url: "/change_request.do?sysparm_query=sys_id={sys_id}"
		};
		// Get all the related records
		if (incidentGr.problem_id + '') {
			var prbGr = new GlideRecord('problem');
			if (prbGr.get(incidentGr.problem_id + '')) {
				var jsPrb = toJS(prbGr, respData.related_records.display_fields);
				if (jsPrb)
					respData.related_records.problem_id.data = jsPrb;
			}
		}
		if (incidentGr.rfc + '') {
			var chgGr = new GlideRecord('change_request');
			if (chgGr.get(incidentGr.rfc + '')) {
				var jsChg = toJS(chgGr, respData.related_records.display_fields);
				if (jsChg)
					respData.related_records.rfc.data = jsChg;
			}
		}
		if (incidentGr.caused_by + '') {
			var chgGr1 = new GlideRecord('change_request');
			if (chgGr1.get(incidentGr.caused_by + '')) {
				var jsChg1 = toJS(chgGr1, respData.related_records.display_fields);
				if (jsChg1)
					respData.related_records.caused_by.data = jsChg1;
			}
		}
		// Get all the related problems
		var problemGr = new GlideRecord("problem");
		problemGr.addQuery("parent", incidentSysId);
		problemGr.orderByDesc("sys_created_on");
		problemGr.query();

		respData.related_problem.count = problemGr.getRowCount();
		i = 1;
		while (problemGr.next()) {
			var jsProblem = toJS(problemGr, respData.related_problem.display_fields);
			if (jsProblem) {
				respData.related_problem.data.push(jsProblem);
				i++;
			}
		}

		// Get all the related change requests
		var changeRequestGr = new GlideRecord("change_request");
		changeRequestGr.addQuery("parent", incidentSysId);
		changeRequestGr.orderByDesc("sys_created_on");
		changeRequestGr.query();

		respData.related_change_request.count = changeRequestGr.getRowCount();
		i = 1;
		while (changeRequestGr.next()) {
			var jsCr = toJS(changeRequestGr, respData.related_change_request.display_fields);
			if (jsCr) {
				respData.related_change_request.data.push(jsCr);
				i++;
			}
		}

		if(GlidePluginManager().isActive('com.sn_cim')) {
			respData.related_sn_cim_register = {
				"count": 0,
				"data": [],
				"link": {
					"list": "sn_cim_inbound_m2m_list.do?sysparm_nameofstack=mim_wb_cim_register&sysparm_query=source_table%3Dincident%5Esource_id%3D" + incidentSysId
				},
				can_add: workbenchUtils.canCreate('sn_cim_inbound_m2m') && workbenchUtils.isActive(incidentGr),
				labels: workbenchUtils.getTableFieldsMap('sn_cim_register'),
				display_fields: ['number', 'short_description', 'cim_estimate', 'assigned_to', 'sys_id'],
				record_url: "/sn_cim_register.do?sysparm_query=sys_id={sys_id}"
			};
			// Get all the related CIM records
			var cimGr = new GlideRecord("sn_cim_register");
			var cimInboundJoinGr = cimGr.addJoinQuery("sn_cim_inbound_m2m", "sys_id","cim_register");
			cimInboundJoinGr.addCondition("source_id", incidentSysId);
			cimGr.orderByDesc("sys_created_on");
			cimGr.query();

			respData.related_sn_cim_register.count = cimGr.getRowCount();
			i = 1;
			while (cimGr.next()) {
				var jsCim = toJS(cimGr, respData.related_sn_cim_register.display_fields);
				if (jsCim) {
					respData.related_sn_cim_register.data.push(jsCim);
					i++;
				}
			}
		}
	}

	respData.refresh_services_allowed = new global.CIUtils().canShowRefreshServicesUIAction(incidentGr.sys_class_name.toString());

	return respData;

})(request, response);
