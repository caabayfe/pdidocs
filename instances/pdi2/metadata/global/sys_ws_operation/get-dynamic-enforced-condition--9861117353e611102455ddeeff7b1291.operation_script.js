(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = {};
    var helper = new CMDBDataManagerHelper();
    var policyTypeID = helper.getParamAsString('policy_type');
    var encodedQuery = helper.getParamAsString('encoded_query');

	var policyTypeGr = new GlideRecord('cmdb_policy_type');
	if(!policyTypeGr.get(policyTypeID)){
		return new sn_ws_err.BadRequestError('Unable to find policy type record matching policy_type parameter');
	}
	var policyType = policyTypeGr.getValue('name');

	//If the policy type is one that requires use of enforced conditions, 
	//  include its sys_id in the conditionalPolicies array below
	var ARCHIVE_ID = 'b82b20d00731201017b703767cd300e1';
	var DELETE_ID = '562bec900731201017b703767cd300e7';
	var RETIRE_ID = '66306fcb7352201026f6aa114df6a77c';
	var conditionalPolicies = [ARCHIVE_ID, DELETE_ID, RETIRE_ID];

	var enforcedCondition = "";

	if(conditionalPolicies.indexOf(policyTypeID) > -1){
		var classesFromQuery = [];
		var grCI = new GlideAggregate('cmdb_ci');
		grCI.addEncodedQuery(encodedQuery);
			grCI.groupBy('sys_class_name');
			grCI.query();
			while(grCI.next()) {
				classesFromQuery.push(grCI.getValue('sys_class_name'));
			}
		var tableString = classesFromQuery.join();

		enforcedCondition = sn_cmdb.CMDBRetirementScriptableApi.getFullEncodedQuery(tableString, policyTypeID);

		if(gs.nil(enforcedCondition) || "sys_class_nameISEMPTY^EQ" == enforcedCondition)
			return new sn_ws_err.BadRequestError('No retirement definitions for the impacted classes');
	}
	result.enforcedCondition = enforcedCondition;

	response.setStatus(200);
    response.setBody(result);

})(request, response);
