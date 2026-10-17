var DeviceTypeChoiceListBuilder = Class.create();
DeviceTypeChoiceListBuilder.prototype = {
    initialize: function() {
    },

	getDeviceTypeChoiceList: function() {
		var choiceList = new GlideChoiceList();

		var legacyTypes = [
			{value: "mweb",label:"Web Client"},
			{value: "android",label:"Android Device"},
			{value: "ios",label:"iOS"},
			{value: "slack",label:"Slack (Deprecated)"},
			{value: "teams",label:"Microsoft Teams (Deprecated)"},
			{value: "facebook",label:"Facebook (Deprecated)"},
			{value: "messenger",label:"Facebook Messenger (Deprecated)"},
			{value: "nowassistpanel",label:"Now Assist Panel"}
		];
		// record map of legacy item to see if we can collapse if channel created with same name
		var legacyTracingMap = {};
		// add the legacy types
		for (var legacyIndex = 0; legacyIndex < legacyTypes.length; ++legacyIndex) {
			var legacyItem = legacyTypes[legacyIndex];
			choiceList.add(legacyItem.value, gs.getMessage(legacyItem.label));
			legacyTracingMap[legacyItem.value] = true;
		}
		// now add new dynamic types
		var gr = new GlideRecord('sys_cs_channel'); //Indicate the table to query from
		gr.query(); //Execute the query
		while (gr.next()) { //While the recordset contains records, iterate through them
			var name = gr.getValue("name");
			var label = gr.getDisplayValue();
			if (!legacyTracingMap[name] && name != 'Now Assist Panel') { 
				//Now Assist check is a temporary fix to not show 'Now Assist Panel' twice in the list of DeviceType filter values in sys_cs_conversation. 
				choiceList.add(name, gs.getMessage(label));
			}
		}
		// return static and dynamic list of old and new
		return choiceList;
	},

    type: 'DeviceTypeChoiceListBuilder'
};
