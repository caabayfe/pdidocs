(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	response.setContentType('application/json');
	var artifactName = "va_topic";
	var data = request.body.data;
	var csTopicSysIds = data.topics;
	var languages = data.languages;
	if (!csTopicSysIds || !languages) {
		response.setStatus(400);
		response.setBody({ errorMessage: "Invalid request, missing required fields." });
		return;
	}

	try {
		var lfApi = new global.LocalizationFrameworkAPIV2();
		var result = lfApi.requestTranslations(artifactName, csTopicSysIds, languages);
		response.setStatus(200);
		response.setBody({ status: 'SUCCESS' });
	} catch (e) {
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
	}

})(request, response);
