// returns array of all the configured CI properties as objects. These are for the extended properties on the Node Map page.
function transform(input) {
	var result = {
		errors: [],
		sysid: '',
		"class": '',
		extended_properties: ''
	};
	
	try {
		var sysid = input.sysid;
		var cls = input.cls;
		var configIdentifierId = input.configIdentifierId;
		var appId = input.appId;

		if (!sysid || !sysid.length) {
			result.errors.push('sysid is missing');
		}
		if (!cls || !cls.length || !cls[0]) {
			result.errors.push('class is missing');
		}
		if (!appId || !appId.length) {
			result.errors.push('appId is missing');
		}
		
		if (!result.errors.length) {
			result.sysid = sysid;
			result['class'] = cls;
			result.appId = appId;
			result.configIdentifierId = configIdentifierId;

			var response = new UnifiedMapHelper().getCiDetails({
				ciSysId: sysid,
				ciClass: cls,
				configIdentifierId: configIdentifierId,
				appId: appId
			});
			if (response.success) {
				result.raw = response.result;
				result.extended_properties = Object.keys(response.result).map(function(o) {
					var res = response.result[o];
					var value = {};
					if(Object.keys(res.highlightedStyle).length > 0) {
						value = {
							"type": "highlighted-value",
							"label": res.value,
							"color": res.highlightedStyle.colorName,
							"showIcon": res.highlightedStyle.showIcon,
							"icon": res.highlightedStyle.iconName,
							"variant": res.highlightedStyle.variantName
						};
					}
					else {
						value  = {
							"type":  "string",
							"value": res.value
						};
					}
					return {
						"label": res.label,
						"value": value
					};
				});
			} else {
				result.errors.push(response.error);
			}
		}
		
	} catch (error) {
		result.errors.push(response.error);
	}
	
	return result;
}
