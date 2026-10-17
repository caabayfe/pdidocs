// returns array of all the configured CI properties as objects. These are for related CIs to the dynamic CI Group.
function transform(input) {
	var result = {
		errors: [],
		sysid: '',
		"class": '',
		dynamic_ci_group_members: ''
	};
	
	try {
		var sysid = input.sysid;
		var cls = input.cls;
		var workspaceId = input.workspaceId;
		var configIdentifierId = input.configIdentifierId;
		if (!sysid || !sysid.length || !sysid[0]) {
			result.errors.push('sysid is missing');
		}
		if (!cls || !cls.length || !cls[0]) {
			result.errors.push('class is missing');
		}
		
		if (!workspaceId) {
			result.errors.push('Workspace App Id is missing');
		}

		if (!result.errors.length) {
			result.sysid = sysid;
			result['class'] = cls;
			var response = new UnifiedMapHelper().getDynamicCiGroupMembers({
				sysId: sysid, 
				cls: cls,
				workspaceId: workspaceId, 
				configIdentifierId: configIdentifierId
			});
			if (response.success) {
				result.dynamic_ci_group_members = response.result;
			} else {
				result.errors.push(response.error.message);
			}
		}
		
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
