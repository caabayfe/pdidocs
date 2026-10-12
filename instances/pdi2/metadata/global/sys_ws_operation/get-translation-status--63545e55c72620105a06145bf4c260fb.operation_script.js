(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var sysCsTopicId = request.pathParams.topicId;
	response.setContentType('application/json');
	if (!sysCsTopicId) {
		response.setStatus(400);
		response.setBody({ errorMessage: 'No input topic id provided' });
		return;
	}

	try {
		var result = [];
		var artifactName = "va_topic";
		var lfApi = new global.LocalizationFrameworkAPIV2();
		var lfInsight = new global.LFGenerateLocalizationInsights();
		var requestTranslationResult = lfApi.canRequestTranslations(artifactName);
		var translationStatusResult = lfApi.getArtifactsTranslationStatus(artifactName, [sysCsTopicId]);
		var requestedItemDetailsResult = lfApi.getRequestedItemDetails([sysCsTopicId]);
		var insights_status = {
		  '1': 'completely translated',
		  '3': 'partially translated',
		  '4': 'not translated'
		};

		var languages = Object.keys(requestTranslationResult);
		for (index = 0; index < languages.length; index++) {
			var language = languages[index];
			var canRequest = requestTranslationResult[language] ? requestTranslationResult[language].isEnabled : false;
			var statusKey = translationStatusResult[sysCsTopicId] && translationStatusResult[sysCsTopicId][language] ? lfInsight._calculateStatus(translationStatusResult[sysCsTopicId][language].translationPercentage)  : "not translated";
			var status = insights_status[statusKey] || "not translated";
			var taskExists = requestedItemDetailsResult[sysCsTopicId] && requestedItemDetailsResult[sysCsTopicId][language] ? requestedItemDetailsResult[sysCsTopicId][language].exists : false;
			var taskId = "";
			var taskLink = "";
			if (taskExists) {
				var taskIsClosed = requestedItemDetailsResult[sysCsTopicId][language].details.isClosed || false;
				taskLink = taskIsClosed ? "" : requestedItemDetailsResult[sysCsTopicId][language].details.link;
				taskId = taskIsClosed ? "" : requestedItemDetailsResult[sysCsTopicId][language].details.sysId;
			}

			result.push({
				language: language,
				canRequest: canRequest,
				taskId: taskId,
				taskLink: taskLink,
				status: taskId !== "" ? "in progress" : status
			});
		}

		response.setStatus(200);
		response.setBody(result);

	} catch (e) {
		response.setStatus(500);
		response.setBody({ errorMessage: e.message });
	}

})(request, response);
