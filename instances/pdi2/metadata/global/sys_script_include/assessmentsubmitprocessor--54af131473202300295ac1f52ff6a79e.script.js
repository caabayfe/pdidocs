var AssessmentSubmitProcessor = Class.create();
AssessmentSubmitProcessor.prototype = {
	initialize: function() {
	},
	processRequest: function(data) {
		if (!data) {
			gs.error('[AssessmentSubmitProcessor]: Missing form parameters.');
			return { "success": "false", "message": "Missing form parameters." };
		}
		var instance_sysID = data["sysparm_instance_id"];
		var action_type = data["sysparm_action"];
		if (!instance_sysID) {
			gs.error('[AssessmentSubmitProcessor]: Missing assessment instance id.');
			return { "success": "false", "message": "Missing assessment instance id." };
		}

		if (action_type == 'cancel') {
			return { "success": "true" };
		}
		if (action_type != "save" && action_type != "submit") {
			gs.error('[AssessmentSubmitProcessor]: Unsupported action type.');
			return { "success": "false", "message": "Unsupported action type." };
		}

		return this.saveAssessment(instance_sysID, action_type, data);
	},
	isNil: function(str) {
		return (str == null || str == "");
	},
	saveAssessment: function(instance_sysID, action_type, data) {
		var inst = new GlideRecord("asmt_assessment_instance");
		if (!inst.get(instance_sysID)) {
			gs.error('[AssessmentSubmitProcessor]: instance ' + instance_sysID + ' not found.');
			return { "success": "false", "message": "instance " + instance_sysID + " not found." };
		}

		var user = gs.getUserID();
		var assignee = inst.getValue('user');
		if (!(new SNC.AssessmentCreation().isGuestUserTakingPublicSurvey(inst.getValue('metric_type'), user)) && assignee !== user) {
			gs.error('[AssessmentSubmitProcessor]: Unauthorized assessment taker');
			return { "success": "false", "message": "Unauthorized assessment taker" };
		}
		
		var channel = data["channel"];
		var status = inst.state;
		var questionCount = 0;
		var percentAnswered = 0;
		var portalProgress = 0;
		var signatureResult = null;
		var questionMap = {};
		var continueFromQuestion = inst.continue_from_question;
		var questionDefinitionMap = {};
		var unrankedDefinitionMap = {};
		var definitionValueMap = {};
		var retake = false;
		var paramArray;
		var questionId;
		var definitionId;
		var sourceId;
		var value;
		var dateTimeQuestionsMap = {};// To store all "date" and "datetime" questions from OAM. If it's empty, then it means the survey is not from OAM, or the survey doesn't contain any date type question.
		var timeValueSuffix = ":00";
		var dateValuePrefix = "ASMTQUESTION:OAM_Date";// This prefix should match the value set up from "SurveyAdaptiveCardGenerator" Script Include.
		var timeValuePrefix = "ASMTQUESTION:OAM_Time";// This prefix should match the value set up from "SurveyAdaptiveCardGenerator" Script Include.
		var datePlaceholder = "mm/dd/yyyy";
		var hiddenQuestions = data["hidden_questions"];
		var due = new GlideDateTime(inst.due_date);
		var now = new GlideDateTime().getLocalDate();
		if ((status == 'complete') && (inst.metric_type.allow_retake) && (now.compareTo(due) != 1)) {
			status = 'wip'; // Store new results when saving a completed instance and retake is allowed.
			retake = true;
		}
		if (status != 'wip' && status != 'ready')
			return { "success": "false", "message": "Instance was in invalid state." };

		for (var param in data) {
			if (param.startsWith('percent_answered')) {
				// When the property is set to true we set the percentAnswered to the actual pertage of questions answered.
				// Otherwise, we fallback to the previous behaviour where is percentage answered is same as the portal progress.
				if (gs.getProperty("sn_portal_surveys.sp_survey.map_correct_percentage_answered", "false") == "true")
					percentAnswered = data[param];
				else {
					if ('portal_progress' in data)
						percentAnswered = data['portal_progress'];
					else
						percentAnswered = data[param];
				}
				continue;
			}
			if (param.startsWith('portal_progress')) {
				portalProgress = data[param];
				continue;
			}
			if (param.startsWith('signature_result')) {
				signatureResult = data[param];
				continue;
			}
			if (param.startsWith('continue_from_question')) {
				continueFromQuestion = data[param];
				continue;
			}
			if (param.startsWith('ASMTQUESTION:')) {
				value = data[param];
				
				// Extract date and time value if questions are from Outlook Actionable Message.
				if (param.startsWith(dateValuePrefix)) {
					var quesInstSysId = param.substring(dateValuePrefix.length);
					if (!dateTimeQuestionsMap[quesInstSysId])
						dateTimeQuestionsMap[quesInstSysId] = {};
					var dateValue = "";
					if (data[param].indexOf('T') !== -1)
						dateValue = data[param].substring(0, data[param].indexOf('T'));// For example, we only need "2020-07-03" from "2020-07-03T07:00:00.000Z".
					else
						dateValue = data[param];
					// DEF0124475: if date value equals to the placeholder, it means there is no user input.
					if (dateValue === datePlaceholder)
						dateValue = "";
					dateTimeQuestionsMap[quesInstSysId]["dateValue"] = dateValue;
					continue;
				} else if (param.startsWith(timeValuePrefix)) {
					var quesInstSysId = param.substring(timeValuePrefix.length);
					var timeValue = "";
					if (!dateTimeQuestionsMap[quesInstSysId])
						dateTimeQuestionsMap[quesInstSysId] = {};
					// When there is no time value, it means the user didn't select any time, so we can save the empty value.
					if (data[param])
						timeValue = data[param] + timeValueSuffix;
					dateTimeQuestionsMap[quesInstSysId]['timeValue'] = timeValue;
					continue;
				}
				
				var isHidden = hiddenQuestions.indexOf(param.substring('ASMTQUESTION:'.length)) >= 0;
				var result = this.saveResponse(param.substring('ASMTQUESTION:'.length), value, isHidden);
			}
			if (param.startsWith('sys_original.ASMTQUESTION:')) {
				questionCount++;
			}
			if (param.startsWith('ASMTDEFINITION:')) {
				paramArray = param.split('_');
				definitionId = paramArray[0].substring('ASMTDEFINITION:'.length);
				questionId = paramArray[1] + '_' + paramArray[2];
				sourceId = paramArray[2];
				var selected = (this.isNil(data[param]) || data[param] == "false") ? false : true;
				if (questionId in questionMap) {
					if (!questionMap[questionId] && selected)
						questionMap[questionId] = true;
				} else
					questionMap[questionId] = selected;
				if (selected) {
					if (questionId in questionDefinitionMap)
						questionDefinitionMap[questionId] += "," + definitionId;
					else
						questionDefinitionMap[questionId] = definitionId;
				}
				definitionValueMap["ADDINFO:" + definitionId + "_" + sourceId] = data["ADDINFO:" + param];
				definitionValueMap["ADDINFO:" + questionId] = data["ADDINFO:" + param];
			} else if (param.startsWith('ASMTDEFINITIONRANK:')) {
				paramArray = param.split('_');
				definitionId = paramArray[0].substring('ASMTDEFINITIONRANK:'.length);
				questionId = paramArray[1] + '_' + paramArray[2];
				sourceId = paramArray[2];
				value = data[param];
				questionMap[questionId] = "RANKING";
				if (!this.isNil(value)) {
					if (questionId in questionDefinitionMap)
						questionDefinitionMap[questionId] += "," + definitionId;
					else
						questionDefinitionMap[questionId] = definitionId;
					definitionValueMap[definitionId + "_" + sourceId] = value;
					definitionValueMap["ADDINFO:" + definitionId+ "_" + sourceId] = data["ADDINFO:" + param];
				} else {
					/* In assessment_take2 ui page on platform there is an array called
						hidden_questions which prevents hidden ranking questions from getting
						deleted on asmt_assessment_instance_question table. Here, we delete the
						records and reinsert again*/
					if (questionId in unrankedDefinitionMap)
						unrankedDefinitionMap[questionId] += "," + definitionId;
					else
						unrankedDefinitionMap[questionId] = definitionId;
				}
			} else if (param.startsWith('ADDINFO:ASMTQUESTION:')) {
				questionId = param.substring('ADDINFO:ASMTQUESTION:'.length, param.length);
				var qst = new GlideRecord("asmt_assessment_instance_question");
				if (qst.get(questionId)) {
					qst.add_info = data[param];
					if (hiddenQuestions.indexOf(questionId) >= 0)
						qst.is_hidden = true;
					qst.update();
				}
			}
		}

		// If the survey is from Outlook Actionable Message, then we process "date" and "datetime" questions here.
		if (Object.keys(dateTimeQuestionsMap).length > 0) {
			for (var qsInstSysId in dateTimeQuestionsMap) {
				var valObj = dateTimeQuestionsMap[qsInstSysId];
				var dValue = valObj["dateValue"];
				var tValue = valObj["timeValue"];
				var resultForDateTime;
				if (tValue)
					// Save "datetime" question
					resultForDateTime = this.saveResponse(qsInstSysId, dValue + " " + tValue);
				else
					// Save "date" question
					resultForDateTime = this.saveResponse(qsInstSysId, dValue);
			}
		}

		this.saveMultipleCheckboxesAndRanking(instance_sysID, questionMap, questionDefinitionMap, definitionValueMap, unrankedDefinitionMap, hiddenQuestions);
		if (action_type == 'submit')
			inst.taken_on = new GlideDateTime();
		this.saveStatus(inst, questionCount, action_type, retake, percentAnswered, portalProgress, signatureResult, continueFromQuestion, channel);
		new AssessmentUtils().invokeExtensionPoints(inst);
		return { "success": "true" };
	},

	/**
	* @param {string} instance - the sys id of survey instance.
	* @param {object} questionMap - stores key-value paris where key is "asmtMetricSysId_metricTypeSysId" and value could be either "True/False" or a string, like "RANKING".
	* @param {object} questionDefinitionMap - store key-value paris where key is "asmtMetricSysId_metricTypeSysId" and value is a string of asmtMetricDefinitionSysIds separated by comma, such as "metric_definition_sys_id1,metric_definition_sys_id2".
	* @param {object} definitionValueMap - stores key-value paris where the key's format is "ADDINFO:asmtMetricDefinitionSysId_metricTypeSysId" and value is the answer
	* @param {array} hiddenQuestions - a list of sys ids of question instance.
	*/
	saveMultipleCheckboxesAndRanking: function(instance, questionMap, questionDefinitionMap, definitionValueMap, unrankedDefinitionMap, hiddenQuestions) {
		for (var key in questionMap) {
			var keyArray = key.split('_');
			var metric = keyArray[0];
			var source_id = keyArray[1];
			var qst = new GlideRecord("asmt_assessment_instance_question");
			qst.addQuery('instance', instance);
			qst.addQuery('metric', metric);
			qst.addQuery('source_id', source_id);
			qst.query();
			var isHidden = false;
			// PRB1525908: Check all instance questions, if any one of them is in hiddenQuestions then isHidden should be true
			while(!isHidden && qst.next())
			isHidden = hiddenQuestions.indexOf(qst.getUniqueValue()) >= 0;
			var source_table = qst.source_table;
			var category = qst.category;
			var metric_type_group = qst.metric_type_group;
			var arr;
			var definitionId;
			var metricDef;
			var i;
			var qstRecord;
			//delete
			var gr = new GlideRecord("asmt_assessment_instance_question");
			gr.addQuery('instance', instance);
			gr.addQuery('metric', metric);
			gr.addQuery('source_id', source_id);
			gr.addQuery('category', category);
			gr.deleteMultiple();
			var utils = new AssessmentUtils();
			var type = questionMap[key];
			if ((type == "RANKING" || type) && questionDefinitionMap[key]) {
				arr = questionDefinitionMap[key].split(",");
				for (i = 0; i < arr.length; i++) {
					definitionId = arr[i];
					metricDef = new GlideRecord('asmt_metric_definition');
					metricDef.addQuery('sys_id', definitionId);
					metricDef.setCategory('survey_meta');
					metricDef.query();
					if (metricDef.next()) {
						qstRecord = new GlideRecord("asmt_assessment_instance_question");
						qstRecord.initialize();
						qstRecord.source_table = source_table;
						qstRecord.source_id = source_id;
						qstRecord.metric = metric;
						qstRecord.category = category;
						qstRecord.instance = instance;
						qstRecord.metric_definition = definitionId;
						qstRecord.metric_type_group = metric_type_group;
						if (!this.isNil(type) && type == "RANKING") {
							qstRecord.value = definitionValueMap[definitionId + "_" + source_id];
						} else
							qstRecord.value = metricDef.getValue("value").toString();
						qstRecord.add_info = definitionValueMap["ADDINFO:" + definitionId + "_" + source_id];
						qstRecord.is_hidden = isHidden;
						var qID = qstRecord.insert();
						utils.setAnonymizeResponse(qID);
					}
				}
			} else {
				//insert
				if (type == "RANKING") {
					arr = unrankedDefinitionMap[key].split(",");
					for (i = 0; i < arr.length; i++) {
						definitionId = arr[i];
						qstRecord = new GlideRecord("asmt_assessment_instance_question");
						qstRecord.initialize();
						qstRecord.source_table = source_table;
						qstRecord.source_id = source_id;
						qstRecord.metric = metric;
						qstRecord.category = category;
						qstRecord.instance = instance;
						qstRecord.metric_definition = definitionId;
						qstRecord.metric_type_group = metric_type_group;
						qstRecord.add_info = definitionValueMap["ADDINFO:" + definitionId + "_" + source_id];
						qstRecord.is_hidden = isHidden;
						var qID = qstRecord.insert();
						utils.setAnonymizeResponse(qID);
					}
				} else {
					qstRecord = new GlideRecord("asmt_assessment_instance_question");
					qstRecord.initialize();
					qstRecord.source_table = source_table;
					qstRecord.source_id = source_id;
					qstRecord.metric = metric;
					qstRecord.category = category;
					qstRecord.instance = instance;
					qstRecord.metric_type_group = metric_type_group;
					qstRecord.add_info = definitionValueMap["ADDINFO:" + key];
					qstRecord.is_hidden = isHidden;
					var qID = qstRecord.insert();
					utils.setAnonymizeResponse(qID);
				}
			}
		}
	},
	saveResponse: function(questionId, value, isHidden) {
		var qst = new GlideRecord("asmt_assessment_instance_question");
		qst.get(questionId);
		var returnValue = 0;
		if (qst.isValid()) {
			qst.is_hidden = isHidden;
			if (isHidden){
				qst.string_value = '';
				qst.value = '';
			} else if ('date'.indexOf(qst.metric.datatype) >= 0) {
				var date = new GlideDateTime();
				var userDateFormat = gs.getDateFormat();
				date.setDisplayValue(value, userDateFormat);
				qst.value = 0;
				qst.string_value = (date.getLocalDate() != null) ? date.getLocalDate().getValue() : value; 
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			} else if ('datetime'.indexOf(qst.metric.datatype) >= 0) {
				var dateTime = new GlideDateTime();
				var userDateTimeFormat = gs.getDateTimeFormat();
				dateTime.setDisplayValue(value, userDateTimeFormat);
				qst.value = 0;
				qst.string_value = dateTime.getDisplayValueInternal();
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			} else if ('string'.indexOf(qst.metric.datatype) >= 0) {
				qst.value = 0;
				qst.string_value = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			} else if ('checkbox'.indexOf(qst.metric.datatype) >= 0) {
				returnValue = 1;
				if (value == 'true' || value == 'on') {
					qst.value = 1;
					qst.string_value = 'true';
				} else {
					qst.value = 0;
					qst.string_value = 'false';
				}
			} else if ('reference'.indexOf(qst.metric.datatype) >= 0) {
				qst.reference_id = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			} else if ('custom'.indexOf(qst.metric.datatype) >= 0) {
				'number'.indexOf(qst.metric.custom_metric.result_type) >= 0 ? qst.value = parseInt(value) : qst.string_value = value;
				returnValue = !!value ? 1 : -1;
			} else {
				qst.value = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			}
			qst.update();
		}
		return returnValue;
	},
	saveStatus: function(inst, questionCount, action_type, retake, percentAnswered, portalProgress, signatureResult, continueFromQuestion, channel) {
		inst.percent_answered = percentAnswered;
		inst.portal_progress = portalProgress;
		inst.continue_from_question = continueFromQuestion;
		inst.channel = channel.toString();
		if (signatureResult)
			inst.signature_result = signatureResult;
		if (action_type == 'submit') {
			if (retake) {
				inst.state = "wip";
				inst.update();
			}
			inst.state = "complete";
			inst.update();
		} else if (action_type == 'save') {
			if (inst.state != "complete")
				inst.state = "wip";
			inst.update();
		}
	},
	type: 'AssessmentSubmitProcessor'
};
