function transform(input) {
	var wrapperFunction = function() {
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var dmConst = new sn_cmdb_ws.CMDBWsDMConstants();
		var policyTypeIdToEventInfoMap = {};
		var ICON_STAR_FILL = 'starFill';
		var ATTESTATION_ICON_COLOR = '#F0E000';
		var CERTIFICATION_ICON_COLOR = '#7EB165';

		var DEFAULT_TYPE_NAME = sn_i18n.Message.getMessage("sn_cmdb_ws", "Custom");
		policyTypeIdToEventInfoMap[dmConst.OOB_POLICY_TYPES.ATTESTATION.sys_id] = {'icon': ICON_STAR_FILL, 'color': ATTESTATION_ICON_COLOR, 'typeName': dmConst.OOB_POLICY_TYPES.ATTESTATION.name};
		policyTypeIdToEventInfoMap[dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id] = {'icon': ICON_STAR_FILL, 'color': CERTIFICATION_ICON_COLOR, 'typeName': dmConst.OOB_POLICY_TYPES.CERTIFICATION.name};

		var result = {};
		result.isEmpty = true;
		var startDate = new GlideDateTime();
		var endDate = new GlideDateTime();
		endDate.addYearsLocalTime(1);
		var formattedDisplayEndDate = new GlideDateTime();
		formattedDisplayEndDate.addMonthsLocalTime(3);
		result.startDate = startDate.getValue();
		result.endDate = endDate.getValue();
		result.formattedDisplayEndDate = formattedDisplayEndDate.getValue();
		result.timelineDataPointPayload = [];
		var scheduledPoliciesByType = proxy.getUpcomingSchedules(startDate, endDate);

		var types = Object.keys(scheduledPoliciesByType);
		for (var i = 0; i < types.length; i++) {
			var typeId = types[i];
			var scheduledPolicies = scheduledPoliciesByType[typeId];

			var dataPoint = {};
			var icon = policyTypeIdToEventInfoMap[typeId] ? policyTypeIdToEventInfoMap[typeId].icon : ICON_STAR_FILL;
			var color = policyTypeIdToEventInfoMap[typeId] ? policyTypeIdToEventInfoMap[typeId].color : ATTESTATION_ICON_COLOR;
			var typeName = policyTypeIdToEventInfoMap[typeId] ? policyTypeIdToEventInfoMap[typeId].typeName : DEFAULT_TYPE_NAME;
			dataPoint.icon = icon;
			dataPoint.color = color;
			dataPoint.isVisible = true;
			dataPoint.label = sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} Policy", {0: typeName});
			dataPoint.labelPlural = sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} Policies", {0: typeName});
			dataPoint.name = typeName;
			dataPoint.events = [];

			for (var j = 0; j < scheduledPolicies.length; j++) {
				var policy = scheduledPolicies[j];
				var event = {};
				event.description = policy.name;
				event.timestamp = policy.epoch;
				event.data = {'policyRuntimeId': policy.runtimeId, 'policyId': policy.id, 'policyName': policy.name, 'policyScheduledTime': policy.time};
				event.popover = {};
				event.popover.fields = [{'policyId': policy.id, 'policyName': policy.name, 'policyScheduledTime': policy.time}];
				dataPoint.events.push(event);
			}
			if (dataPoint.events.length > 0) {
				result.isEmpty = false;
			}
			result.timelineDataPointPayload.push(dataPoint);
		}
		return result;
	};
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Upcoming Scheduled Policies", wrapperFunction);
}
