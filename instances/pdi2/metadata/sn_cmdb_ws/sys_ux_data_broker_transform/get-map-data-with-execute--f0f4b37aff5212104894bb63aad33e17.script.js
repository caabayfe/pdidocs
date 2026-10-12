function transform(input) {
    var unifiedMapHelper = new UnifiedMapHelper();
    var sysid = input.sysid.trim();
    var result = {
        sysid: sysid,
        levels: input.levels,
        appId: input.appId,
        errors: [],
        messages: [],
        rawData: {}
    };

    try {
		var response = unifiedMapHelper.getMap({ 
			ciSysId: sysid, 
			level: input.levels, 
			appId: input.appId,
			configIdentifierId: input.configIdentifierId
		});
		if (response.success) {
			var gr = new GlideRecord("cmdb_ci");
			gr.get(sysid);
			response.result.sysClassPath = gr.sys_class_path.getDisplayValue();
			result.rawData = response.result;
			result.messages = response.messages;
		} else {
			gs.error('CMDB Workspace - Unified Map - Error encountered fetching server data calling script include UnifiedMapHelper().getMap(' + sysid + ', ' + levels + '). ' + 
				response.error.code + ': ' + response.error.message);
			result.errors.push({
				code: response.error.code,
				message: response.error.message,
				uiMessage: response.error.uiMessage
			});
		}
    } catch (error) {
        result.errors.push(error.toString());
    }
    return result;
}
