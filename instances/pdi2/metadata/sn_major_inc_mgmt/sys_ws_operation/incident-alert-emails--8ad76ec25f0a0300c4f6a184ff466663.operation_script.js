(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

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
			sys_customer_update: true
		};

		var obj = {};

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

	var emails = [];
	var incidentAlertSysId = request.pathParams.alert_id;
	var incidentAlertTasks = [];

	var incidentAlertGr = new GlideRecord('incident_alert');
	if(!incidentAlertGr.get(incidentAlertSysId))
		return new sn_ws_err.NotFoundError("Requested Incident Alert not found");

	var alertTaskGr = new GlideRecord('incident_alert_task');
	alertTaskGr.addQuery('incident_alert', incidentAlertSysId);
	alertTaskGr.setLimit(50);
	alertTaskGr.query();
	while(alertTaskGr.next()) {
		incidentAlertTasks.push(alertTaskGr.getUniqueValue());
	}

	var emailGr = new GlideRecord('sys_email');
	emailGr.addQuery('instance', "IN", incidentAlertTasks.join(","));
	/*Adding a setLimit for 250, since currently Activity List only gets 250 records.
	Reference: com.glide.ui.ng.streams.NGListHistoryRenderUtil.jsFunction_getFormStreamData(String, String, String)(Line#53)*/
	emailGr.setLimit(250);
	emailGr.orderByDesc('sys_created_on');
	if (incidentAlertGr.sys_created_on && !incidentAlertGr.sys_created_on.nil())
		emailGr.addQuery('sys_created_on', '>=', incidentAlertGr.getValue('sys_created_on'));
	emailGr.query();
	while(emailGr.next()) {
		var jsEmail = toJS(emailGr);
		if (jsEmail)
			emails.push(jsEmail);
	}

    return emails;

})(request, response);
