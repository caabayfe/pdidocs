var AdminConsoleAjaxUtility = Class.create();

AdminConsoleAjaxUtility.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getIARTargetTable: function() {
        var answer = '';
        var value = this.getParameter('sysparm_value');
        var gr = new GlideRecord('sys_cs_auto_resolution_configuration');
        if (gr.canRead() && gr.get(value)) {
            answer = gr.target_table_name;
        }
        return answer;
    },

	getIARfields: function() {
		var result = {};
		var value = this.getParameter('sysparm_value');
		var gr = new GlideRecord('sys_cs_auto_resolution_configuration');
		if (gr.canRead() && gr.get(value)) {
			result.target_table_name = String(gr.target_table_name);
			result.condition = String(gr.condition);
		}
		return JSON.stringify(result);
	},

	isResponseChannelActiveForConfig: function() {
		var channelList = {};
		var tableName = this.getParameter('sysparm_tableName');
		var configSysId = '';

		var autoResConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
		autoResConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME, tableName);
		autoResConfigGr.query();
		
		if (autoResConfigGr.canRead() && autoResConfigGr.next()) {
			configSysId = autoResConfigGr.getUniqueValue();
		}
		else {
			gs.error('isResponseChannelActiveForConfig: Not a valid IAR table name ' +  tableName);
			return channelList;
		}

		var respChannelGr = new GlideRecord('sys_cs_auto_resolution_response_channel');
		respChannelGr.addQuery('configuration', configSysId);
		respChannelGr.query();

		if (respChannelGr.canRead()) {
			while (respChannelGr.next()){
				channelList[respChannelGr.getValue('response_channel')] = respChannelGr.getValue('active') === "1";
			}
		}
		
		return JSON.stringify(channelList);
	},

    sysPropertyWithCategoryChatMessages: function() {
        var sys_prop_arr = [];
        var m2m = new GlideRecord('sys_properties_category_m2m');
        m2m.addQuery('category.name', 'Chat System Messages');
        m2m.query();

        while (m2m.next() && m2m.canRead()) {
            sys_prop_arr.push(m2m.property + "");
        }

        return sys_prop_arr;
    }

});
