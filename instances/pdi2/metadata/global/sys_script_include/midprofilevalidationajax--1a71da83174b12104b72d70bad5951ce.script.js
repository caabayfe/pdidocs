var MIDProfileValidationAjax = Class.create();

MIDProfileValidationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/**
	 * verifies all the mids against a profile have matching configurations
	 * 
	 * @param sysparm_profile_number				string value of profile number
	 * @param sysparm_mid_ids						string with ',' seperated mid ids
	 * @param trigger_profile_validation_requests 	boolean with true means wrapper verification ecc request for up MID
	 * 												will be created
	 * 
	 * @returns a json converted validation result
	 */
	ajaxFunction_verifyProfile: function() {
		var profile_number = this.getParameter('sysparm_profile_number');
		var mid_ids = this.getParameter('sysparm_mid_ids');
		var trigger_profile_validation_requests = this.getParameter('trigger_profile_validation_requests');

		if (!mid_ids) {
			mid_ids = [];
		} else {
			var ids = new String(mid_ids);
			if (ids.length == 0)
				mid_ids = [];
			else
				mid_ids = ids.split(',');
		}
		return JSON.stringify(new MIDProfileManagement().verifyProfile(profile_number, mid_ids, trigger_profile_validation_requests));
	},

	/***
	 * Creates the ecc requests for verification of wrapper configs on mid
	 *
	 * @param sysparm_mid_ids		the ',' sepertaed list of mid server sys ids
	 */
	ajaxFunction_verifyWrapper: function() {
		var mid_ids = this.getParameter('sysparm_mid_ids');

		if(!mid_ids)
			mid_ids = [];
		else{
			var ids = new String(mid_ids);
			if (ids.length == 0)
				mid_ids = [];
			else
				mid_ids = ids.split(',');
		}
		return new MIDWrapperConfigOperations().performWrapperVerification(mid_ids, true);
	},

	/**
	 * creates wrapper verification ecc request for all the UP mid servers for the provided profile
	 *
	 * @param sysparm_profile_number 	the number of profile
	 * @returns a json data strcture containing the request status for all mids
	 */
	ajaxFunction_verifyWrapperForProfile() {
		var profile_number = this.getParameter('sysparm_profile_number');
		var mid_sys_ids = new MIDProfileManagement().getMIDSysIDList(profile_number);
		return new MIDWrapperConfigOperations().performWrapperVerification(mid_sys_ids, true);
	},

	/**
	 * verifies the state of request for the ecc output records ids and returns results if available
	 *
	 * @param ecc_request_ids a ',' seperated list of all the ecc request sys_ids
	 * @returns a json data with results for only the requests for which a state is available
	 */
	ajaxFunction_getProfileEccVerificationResults() {
		var ecc_request_ids = this.getParameter('ecc_request_ids');
		var ecc_request_ids_list = ecc_request_ids.split(',');
		// return new MIDWrapperConfigOperations().getVerificationECCResults(ecc_request_ids_list, true);
		var res = new MIDWrapperConfigOperations().getVerificationECCResults(ecc_request_ids_list, false);
		return JSON.stringify(res);
	},

    type: 'MIDProfileValidationAjax'
});
