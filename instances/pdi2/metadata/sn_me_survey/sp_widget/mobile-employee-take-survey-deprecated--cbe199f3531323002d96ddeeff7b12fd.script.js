(function() {
	var page_id = options.id || $sp.getParameter('id');
	var typeId = options.type_id || $sp.getParameter('type_id');
	var surveyId = options.instance_id || $sp.getParameter('instance_id');
	var triggerId = options.instance_id || $sp.getParameter('sysparm_trigger_id') || "";
	var triggerTable = options.instance_id || $sp.getParameter('sysparm_trigger_table') || "";
	var kiosk = options.instance_id || $sp.getParameter('sysparm_kiosk') || false;
	var pickedLanguageId = $sp.getParameter('sysparm_lang') || "";
	if (kiosk && !(triggerTable && triggerId)) {
		gs.addErrorMessage(gs.getMessage("Something went wrong. Please try again later."));
		return false;
	}
	var refreshInterval = options.refresh_interval || $sp.getParameter('sysparm_refresh_interval');
	if (refreshInterval && typeId) {
		refreshInterval = parseInt(refreshInterval, 10);
		if(!isNaN(refreshInterval))
			data.refreshInterval = refreshInterval;
	}
	data.triggerTable = triggerTable;	
	data.triggerId = triggerId;
	data.pickedLanguageId = pickedLanguageId;
	data.showLanguagePicker = "false";
	var showLangProperty = gs.getProperty("show_lang_picker_for_publicsurveys");

	var sp = new sn_portal_surveys.SPSurveyAPI();
	if (page_id == 'public_survey') {
		if (!!typeId && sp.isSurveyPublic(typeId) && showLangProperty == "true") {
			// If it is a public survey and user is not logged in and show language picker property is marked
			// Check if picked language equals to session language
			// If not same, change session language
			data.showLanguagePicker = "true";
			var session = gs.getSession();
			var sessionLang = session.getLanguage();
			if (data.pickedLanguageId && sessionLang !== data.pickedLanguageId) {
				var amtUtil = new global.AssessmentUtils();
				var isSuccess = amtUtil.setSessionLanguage(data.pickedLanguageId);
				if (!isSuccess) {
					gs.addErrorMessage(gs.getMessage("Language doesn't exist."));
					return false;
				}
				// After changing session language, we need to refresh page again to see the system has been entriely translated.
				data.redirectTarget = "?id=public_survey&type_id="+typeId+"&sysparm_lang="+data.pickedLanguageId+(surveyId ? "&instance_id="+surveyId : "");
			} else
				data.sessionLanguage = sessionLang;
		} else {
			if (!!typeId && (!sp.isSurveyPublic(typeId) || gs.isLoggedIn()))
				data.redirectTarget = "?id=take_survey&type_id=" + typeId;
			else if (!!surveyId && (!sp.isSurveyInstancePublic(surveyId) || gs.isLoggedIn()))
				data.redirectTarget = "?id=take_survey&instance_id=" + surveyId;
		}
	}
	
	sp.loadSurvey(typeId, surveyId, data);
})();
