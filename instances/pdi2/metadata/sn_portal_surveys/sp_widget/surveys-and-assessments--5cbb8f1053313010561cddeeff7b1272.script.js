(function() {
	var page_id = options.id || $sp.getParameter('id')  || "";
	var typeId = options.type_id || $sp.getParameter('type_id') || "";
	var instanceId = options.instance_id || $sp.getParameter('instance_id') || "";
	var triggerId = $sp.getParameter('sysparm_trigger_id') || "";
	var triggerTable = $sp.getParameter('sysparm_trigger_table') || "";
	var kiosk = $sp.getParameter('sysparm_kiosk') || false;
	var pickedLanguageId = $sp.getParameter('sysparm_lang') || "";
	var readOnlyForm = $sp.getParameter('readonly') == 'true';
	if (shouldRedirect(instanceId, typeId)) {
		redirectToOldWidget();
	} else {
		data.embeddedWidget = '';
	}
	if (input) {
		if (input.action == "check_string_validation") {
			data.stringValidationResponse = new global.SurveyUtilAjax().validateMultipleStringFields(input.string_qa_map);
		}
	
		if (input.action == "log_assessment") {
			var logMessage = input.assessmentDetails.type + " V2" + " : " + input.assessmentDetails.action_name;
			$sp.logStat(logMessage, input.assessmentDetails.table, input.assessmentDetails.id, input.assessmentDetails.name, $sp.getPortalRecord().getUniqueValue());
		}
		return;
	}
	
	if (kiosk && !(triggerTable && triggerId)) {
		gs.addErrorMessage(gs.getMessage("Something is not working. Please try again later."));
		return false;
	}
	var refreshInterval = options.refresh_interval || $sp.getParameter('sysparm_refresh_interval');
	if (refreshInterval && typeId) {
		refreshInterval = parseInt(refreshInterval, 10);
		if (!isNaN(refreshInterval))
			data.refreshInterval = refreshInterval;
	}
	data.pickedLanguageId = pickedLanguageId;
	data.show_language_picker = false;
	data.trigger_table = triggerTable;
	data.trigger_id = triggerId;
	data.show_close = (options.is_workspace == 'true');
	data.readonly_form = readOnlyForm ? "true": "false";
	var showLangProperty = gs.getProperty("show_lang_picker_for_publicsurveys");
	if (page_id == 'public_assessment' || page_id == 'public_survey') {
		if (!!typeId && isSurveyPublic(typeId) && showLangProperty == "true" && !gs.isLoggedIn()) {
			// If it is a public survey and user is not logged in and show language picker property is marked
			// Check if picked language equals to session language
			// If not same, change session language
			data.show_language_picker = true;
			var session = gs.getSession();
			var sessionLang = session.getLanguage();
			if (data.pickedLanguageId && sessionLang !== data.pickedLanguageId) {
				var amtUtil = new global.AssessmentUtils();
				var isSuccess = amtUtil.setSessionLanguage(data.pickedLanguageId);
				if (!isSuccess) {
					gs.addErrorMessage(gs.getMessage("This language doesn't exist."));
					return false;
				}
				// After changing session language, we need to refresh page again to see the system has been entriely translated.
				data.redirectTarget = "?id=public_assessment&type_id=" + typeId + "&sysparm_lang=" + data.pickedLanguageId + (instanceId ? "&instance_id="+ instanceId : "");
				return;
			}
			else
				data.sessionLanguage = sessionLang;
		} else {
			if (!!typeId && (!isSurveyPublic(typeId) || gs.isLoggedIn())) {
				var sysParam = "";
				sysParam += triggerTable ? "&sysparm_trigger_table=" + triggerTable : "";
				sysParam += triggerId ? "&sysparm_trigger_id=" + triggerId: "";
				data.redirectTarget = "?id=take_assessment&type_id=" + typeId + sysParam;
				return;
			}
			else if (!!instanceId && (!isSurveyInstancePublic(instanceId) || gs.isLoggedIn())) {
				data.redirectTarget = "?id=take_assessment&instance_id=" + instanceId;
				return;
			}
		}
	}
	try {
		data.assessment = $sp.getAssessmentRecord(instanceId, typeId, data);
	}
	catch (e) {
		gs.error(e);
		redirectToOldWidget();
		return;
	}
	data.assessment.is_page_public = page_id === 'public_survey' ||  page_id === 'public_assessment';
	data.assessment.actions_footer = $sp.getParameter('actions_footer') == 'true';
	data.assessment.enforce_none = ($sp.getParameter('pagination') == 'none');
	data.assessment.from_iframe = (options.is_workspace == 'true');
	var actions = $sp.getParameter('hide_actions') || "";
	actions = decodeURIComponent(actions);
	if (actions.length != 0) {
		actionTypes = actions.split(',');
		if (actionTypes.indexOf('cancel') != -1) data.assessment.hide_cancel = true;
		if (actionTypes.indexOf('save') != -1) data.assessment.hide_save = true;
	}	
	
	if (readOnlyForm) {
		data.assessment.readonly_form = readOnlyForm;
		for (var field in data.assessment._fields) {
			var _field = data.assessment._fields[field];
			_field.sys_readonly = true;
			if (_field.type == 'attachment') {
				var surveyUtil = new global.SurveyCoreUtils();
				_field.recordTableName = surveyUtil.getAttachmentTable(_field.sys_id).name;
				_field.recordSysId = (data.assessment.state == 'complete' ? surveyUtil.getMetricResultId(data.assessment.instance_id, _field.sys_id) : _field.sys_id);
			}
		}
		data.assessment.pagination = 'none';
		data.assessment.show_progress_bar = false;
		var asmtSignature = data.assessment.signature;
		if (asmtSignature) {
			asmtSignature.sys_readonly = true;
			asmtSignature.value = (asmtSignature.type == 'checkbox' && asmtSignature.signature_result == 'checked') ? true : asmtSignature.value;
		}
	}
	data.show_language_picker = data.show_language_picker && data.assessment.show_language_picker;
	var evaluationMethodDisplay = data.assessment.evaluation_method_display;
	if (evaluationMethodDisplay)
		evaluationMethodDisplay = evaluationMethodDisplay.toLowerCase();
	var msgParamArray = [evaluationMethodDisplay, data.assessment.instance_duedate];
	data.assessment.parameterizedMsgsMap = {
		"not_saved_msg": gs.getMessage("You have canceled the {0}. You can complete this {0} before {1}.", msgParamArray),
		"already_completed": gs.getMessage("You have already submitted this {0}.", evaluationMethodDisplay),
		"cancel_msg": gs.getMessage("This {0} has been canceled", evaluationMethodDisplay),
		"submitted_msg": gs.getMessage("Your response has been submitted. Thank you for taking this {0}!", evaluationMethodDisplay),
		"saved_msg": gs.getMessage('Your response has been saved. You can complete this {0} before {1}.', msgParamArray),
		"form_submit_failed_msg": gs.getMessage("Something is not working. Please try again later."),
		"cancel_modal_msg": gs.getMessage("Are you sure you want to cancel the {0}? This might not save your response.", evaluationMethodDisplay),
		"cancel_header": gs.getMessage("Cancel {0}", evaluationMethodDisplay),
		"close_btn_msg": gs.getMessage("Close {0}", evaluationMethodDisplay)
	};
	if (data.assessment.signature) {
		data.assessment.signature.msgs = {
			username: gs.getMessage("Username"),
			password: gs.getMessage("Password"),
			signatureAuthentication: gs.getMessage("Signature Authentication"),
			invalidCredentials: gs.getMessage("Please use correct password."),
			emptySignatureMessage: gs.getMessage("You must complete the required signature")
		};
	}
	if (data.assessment.enforce_none)
		data.assessment.pagination = 'none';
	data.mySurveysMsg = gs.getMessage("My Surveys");
	data.invalidRecordMsg =  gs.getMessage("You are not authorized or the record is not valid.");
	data.getStartedMsg = gs.getMessage("Get Started");
	data.readOnlyViewMsg = gs.getMessage("This is a read-only view");
	data.assessment.sys_properties = {
		allowedFileSize : gs.getProperty('com.glide.attachment.max_size'),
		allowedFileExtensions : gs.getProperty('glide.attachment.extensions')
	};
	
	function isSurveyPublic(typeId) {
		var metricType = new GlideRecord('asmt_metric_type');
		if (metricType.get(typeId))
			return metricType.allow_public;
		return false;
	}
	
	function redirectToOldWidget() {
		data.isRedirect = true;
		data.embeddedWidget = $sp.getWidget("take-survey", {
			type_id: typeId,
			instance_id: instanceId
		});
	}
	
	function isSurveyInstancePublic(instanceId) {
		var surveyInstance = new GlideRecord('asmt_assessment_instance');
		if (surveyInstance.get(instanceId))
			return isSurveyPublic(surveyInstance.getValue('metric_type'));
		return false;
	}
	
	function shouldRedirect(instanceId, typeId) {
		if (instanceId) {
			var instance = new GlideRecord('asmt_assessment_instance');
			return instance.get(instanceId) ? instance.metric_type.evaluation_method != 'survey' && instance.metric_type.evaluation_method != 'assessment' && instance.metric_type.evaluation_method != 'risk_assessment' && instance.metric_type.evaluation_method != 'attestation_v2': false;
		} else if (typeId) {
			var metricType = new GlideRecord('asmt_metric_type');
			return metricType.get(typeId) ? metricType.evaluation_method != 'survey' && metricType.evaluation_method != 'assessment' && metricType.evaluation_method != 'risk_assessment' && metricType.evaluation_method != 'attestation_v2': false;
		}	
		return false;
	}
})();
