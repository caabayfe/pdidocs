(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {
		hasCompanyCode: false,
		isPartOfActivePipeline: false,
	};

	try {		
		var vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();

		var currentInstanceInfo = new sn_pipeline.PipelineConfigChecks().getCurrentInstanceInfo(DeploymentPipelineConstants.APPLICATION_DEPLOYMENT);

		result['hasCompanyCode'] = !!vendorInfo.key;
		result['isPartOfActivePipeline'] = currentInstanceInfo.hasGivenPipelineTypeConfiguredInController;
	} catch (exception) {
		throw new sn_ws_err.ServiceError()
			.setStatus(500)
			.setMessage(gs.getMessageLang('Unable to retrieve company code or pipeline details. {0}', 'en', exception.message))
			.setDetail(gs.getMessage('Unable to retrieve company code or pipeline details. {0}', exception.message));
	}
	response.setBody(result);
	response.setStatus(200);

})(request, response);
