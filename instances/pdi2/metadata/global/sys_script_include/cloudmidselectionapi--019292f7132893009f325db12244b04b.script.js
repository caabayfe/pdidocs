var CloudMidSelectionApi = Class.create();
CloudMidSelectionApi.prototype = {
	initialize: function () { },

	/**
	 * Select a single mid for cloud
	 * @param {string} app Application calling this API (e.g. ServiceMapping)
	 * @param {string} provider provider. This won't be respected if ldc is passed in. Example here is AWS.
	 * @param {string} logicalDataCenter Logical data center.
	 * @param {string} context Extra context that callers needs to pass through that will be available at the MID selection override.
	 * @returns {string} MID server name
	 */
	selectMid: function (app, provider, logicalDataCenter, context) {

		const capabilities = this.getMidCapabilities(provider, logicalDataCenter, context);

		if (!gs.nil(context) && typeof context == 'string') {
			//Set app name for Datacenter Discovery
			const contextJson = JSON.parse(context);
			const capiInterface = contextJson.capi_interface_name;
			const capiMethodName = contextJson.capi_method_name;
			if ((capiInterface && capiInterface == "Compute Interface") && (capiMethodName && capiMethodName == "ListDatacenters")) {
				app = '';
			}
		}

		// Now we have everything set up - call the mid selector API to select one mid
		const midSelector = new SNC.MidSelector();
		return midSelector.selectMid(app, null, capabilities, context);
	},

	/**
	 * @param {string} provider provider. This won't be respected if logicalDataCenter is passed in. Example here is AWS.
	 * @param {string} logicalDataCenter
	 * @param {string} context Extra context that callers needs to pass through that will be available at the MID selection override.
	 * @returns {MidCapability[]}
	 */
	getMidCapabilities: function (provider, logicalDataCenter, context) {
		/** @type {MidCapability[]} */
		const DEFAULT_CLOUD_CAPABILITIES = [
			{ capability: 'Cloud Management' }
		];

		// If logicalDataCenter is not specified - it is by provider (e.g. Ansible/Puppet)
		// If logicalDataCenter is specified we can get provider from logicalDataCenter
		if (gs.nil(logicalDataCenter)) {
			if (gs.nil(provider)) {
				throw 'Logical datacenter or provider has to be specified for cloud MID selection';
			}
			return DEFAULT_CLOUD_CAPABILITIES.concat([{ capability: provider }]);
		}

		if (provider == 'Terraform') {
			return DEFAULT_CLOUD_CAPABILITIES.concat([{ capability: 'Terraform' }]);
		}

		const dcType = this._getDatacenterType(logicalDataCenter, context);

		// get the provider (cloudType) and add it as a capability
		const glideUtil = new GlideRecordUtil();
		const capiRec = glideUtil.getGlideRecordByAttribute('sn_capi_provider', 'datacenter_class', dcType);
		if (!capiRec.next()) {
			throw 'Provider not found for datacenterType ' + dcType + '!';
		}

		const cloudType = capiRec.getValue('name');
		if (gs.nil(cloudType)) {
			throw 'Provider name is empty for datacenterType ' + dcType + '!';
		}

		return DEFAULT_CLOUD_CAPABILITIES.concat([{
			capability: cloudType,
			value: logicalDataCenter
		}]);
	},

	/**
	 * Extract datacenter type from service account or logical datacenter
	 * @param {string} logicalDataCenter
	 * @param {string} context
	 * @returns {string} datacenter type
	 * @private
	 */
	_getDatacenterType: function (logicalDataCenter, context) {
	 const glideUtil = new GlideRecordUtil();

	 //Try to figure out dcType from service account
	 if (!gs.nil(context) && typeof context == 'string') {
	  const contextObj = JSON.parse(context);
	  const cloudServiceAccountId = contextObj.service_account_id;

	  if (!gs.nil(cloudServiceAccountId)) {
	   const servAcc = glideUtil.getGlideRecordByAttribute('cmdb_ci_cloud_service_account', 'account_id', cloudServiceAccountId);
	   if (servAcc.next()) {
	    return servAcc.getValue('datacenter_type');
	   }
	  }
	 }

	 const ldcRec = glideUtil.getGlideRecordByAttribute('cmdb_ci_logical_datacenter', 'region', logicalDataCenter);
	 if (!ldcRec.next()) {
	  throw `Logical datacenter ${logicalDataCenter} could not be found!`;
	 }

	 return ldcRec.getValue('sys_class_name');
	},

	type: 'CloudMidSelectionApi'
};

//#region type definitions
/**
 * @typedef {object} MidCapability
 * @property {string} capability
 * @property {string} [value]
 */
//#endregion type definitions
