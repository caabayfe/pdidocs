function script({ api, event, helpers, imports }) {
	//fetchExtPropsCompleted script in (CI) Properties Controller; fired after getExtendedProps data broker returns
	const { logErrorToConsole } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	var output = api.data.get_extended_properties.output;

	var extPropsPostFetch = {
		init: function () {
			this.errorCheck();
			this.processExtProps();
		},

		errorCheck: function () {
			if (output.errors.length) {
				logErrorToConsole([
					"Failed to fetch extended CI properties for " +
						'ciSysid="' + output.sysid + '" ' +
						'ciClass="' + output.class + '" ' +
						'configIdentifierId="' + output.configIdentifierId + '" ' +
						'appId="' + output.appId + '" ' +
						"and returned the following errors: ",
					...output.errors.map((o) => o.code + " - " + o.message),
				]);
			}
		},

		processExtProps: function () {
			//save the extended props for the incoming CI to internal cache for reuse
			let cache = api.state.cache;
			//Sort by label
			if (output.extended_properties) {
				output.extended_properties.sort((val1, val2) =>
					val1.label.localeCompare(val2.label)
				);
				if (!cache[output.sysid]) {
					cache[output.sysid] = {};
				}
				cache[output.sysid].extended_properties = output.extended_properties;
				api.setState("cache", cache);

				//also set the state that the component is binded to
				api.setState("ciExtendedProperties", output.extended_properties); //this is served up in the exact format needed by the component so no extra processing is needed

				//clear the broker inputs (used for next lookup to know when we have both broker inputs)
				let extPropsBrokerInputs = api.state.extPropsBrokerInputs;
				extPropsBrokerInputs.ciSysid = null;
				extPropsBrokerInputs.ciClass = null;
				api.setState("extPropsBrokerInputs", extPropsBrokerInputs); //this shouldn't trigger the broker
			}
		},
	};

	extPropsPostFetch.init();
}
