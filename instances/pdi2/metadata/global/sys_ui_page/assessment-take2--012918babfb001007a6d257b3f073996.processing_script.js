(function(_this) {
	function saveAssessment() {
		if (!instance_sysID) {
			gs.error('[assessment_take2]: Missing instance sys_id');
			response.sendRedirect('home.do');
			return;
		}

		var inst = new GlideRecord("asmt_assessment_instance");
		if (!inst.get(instance_sysID)) {
			gs.error('[assessment_take2]: Invalid instance sys_id');
			response.sendRedirect('home.do');
			return;
		}

		var user = gs.getUserID();
		var assignee = inst.getValue('user');
		if (!(new SNC.AssessmentCreation().isGuestUserTakingPublicSurvey(inst.getValue('metric_type'), user)) && assignee !== user) {
			gs.error('[assessment_take2]: Unauthorized assessment taker');
			response.sendRedirect('home.do');
			return;
		}

		var hq = {};
		if (typeof hiddenQuestions != 'undefined')
			hq = (new JSONParser()).parse(hiddenQuestions);
		hiddenQuestions = hq;

		var aq = "";
		if(typeof attachmentQuestions != 'undefined')
			aq = attachmentQuestions;
		attachmentQuestions = aq;

		var status = inst.state;
		var questionCount = 0;
		var questionAnswer = 0;
		var questionMap = {};
		var questionDefinitionMap = {};
		var definitionValueMap = {};
		var retake = false;
		var due = new GlideDateTime(inst.due_date);
		var now = new GlideDateTime().getLocalDate();
		if ((status == 'complete') && (inst.metric_type.allow_retake) && (now.compareTo(due) != 1)) {
			status = 'wip'; // Store new results when saving a completed instance and retake is allowed.
			retake = true;
		}
		if (status == 'wip' || status == 'ready') {
			for ( var params in _this) {
				if (params.startsWith('ASMTQUESTION:')) {
					var value = _this[params];
					var questionId = params.substring('ASMTQUESTION:'.length, params.length);
					var result = saveResponse(questionId, value, selection_result);
					if (result > 0)
						++questionAnswer;
				}
				if (params.startsWith('sys_original.ASMTQUESTION:')) {
					var qId = params.substring('sys_original.ASMTQUESTION:'.length, params.length);
					if (qId in hiddenQuestions) {
						if(attachmentQuestions.indexOf(qId) >=0){
							var attachment = _this[params].split(",");
							for(var i=0;i<attachment.length;i++){
								var sa = new GlideSysAttachment();
								sa.deleteAttachment(attachment[i]);
							}
						}
						// Set 'is_hidden' to true in order not to generate metric result for this question
						var grQstInstnace = new GlideRecord("asmt_assessment_instance_question");
						if (grQstInstnace.get(qId)) {
							grQstInstnace.is_hidden = true;
							grQstInstnace.update();
						}
					} else {
						// Setting 'is_hidden' false for attachment since we do not save response for attachment where we toggle 'is_hidden'
						// If attachment is set to visible again we need to toggle 'is_hidden' accordingly
						if (attachmentQuestions.indexOf(qId) >=0){
							var attachmentGR = new GlideRecord('sys_attachment');
							attachmentGR.addQuery('table_name','asmt_assessment_instance_question');
							attachmentGR.addQuery('table_sys_id',qId);
							attachmentGR.query();
							if(attachmentGR.hasNext())
								++questionAnswer;
							var grQstnInstnace = new GlideRecord("asmt_assessment_instance_question");
							if (grQstnInstnace.get(qId)) {
								grQstnInstnace.is_hidden = false;
								grQstnInstnace.update();
							}
							
						}
						
						++questionCount;
					}
				}
				if(params.startsWith('ASMTDEFINITION:')){
					var definitionId = params.substring('ASMTDEFINITION:'.length, 'ASMTDEFINITION:'.length + 32);
					var questionId = params.split('_')[1];
					var selected = (GlideStringUtil.nil(_this[params]) || _this[params] == "false") ?  false : true;

					if(questionId in questionMap){
						if(!questionMap[questionId] && selected)
							questionMap[questionId] = true;
					}
					else
						questionMap[questionId] = selected;

					if(selected){
						if(questionId in questionDefinitionMap)
							questionDefinitionMap[questionId] += ","+definitionId;
						else
							questionDefinitionMap[questionId] = definitionId;
					}

				} else if (params.startsWith('ASMTDEFINITIONRANK:')) {
					var definitionId = params.substring('ASMTDEFINITIONRANK:'.length, 'ASMTDEFINITIONRANK:'.length + 32);
					var questionId = params.split('_')[1];
					var sourceId = params.split('_')[2];
					var value = _this[params];
					questionMap[questionId] = "RANKING";

					if(questionId in questionDefinitionMap)
						questionDefinitionMap[questionId] += ","+definitionId;
					else
						questionDefinitionMap[questionId] = definitionId;

					definitionValueMap[definitionId + '_' + sourceId] = value;
				}
				if (params.startsWith('ADDINFO:ASMTQUESTION:')) {
					var questionId = params.substring('ADDINFO:ASMTQUESTION:'.length, params.length);
					var qst = new GlideRecord("asmt_assessment_instance_question");
					if (qst.get(questionId)) {
						qst.add_info = _this[params];
						qst.update();
					}
				}
			}

			for(var key in questionMap){
				var isHidden = (key in hiddenQuestions) ? true : false;
				var qst = new GlideRecord("asmt_assessment_instance_question");
				qst.get(key);
				var source_table = qst.source_table;
				var source_id = qst.source_id;
				var metric = qst.metric;
				var category = qst.category;
				var instance = qst.instance;
				var metric_type_group = qst.metric_type_group;

				//delete
				var gr = new GlideRecord("asmt_assessment_instance_question");
				gr.addQuery('instance',instance);
				gr.addQuery('metric',metric);
				gr.addQuery('source_id',source_id);
				gr.addQuery('category',category);
				gr.deleteMultiple();

				var utils = new AssessmentUtils();
				if(questionMap[key] && !isHidden){
					++questionAnswer;

					//insert for all values
					var arr = questionDefinitionMap[key].split(",");
					for(var i=0;i<arr.length;i++){
						var definitionId = arr[i];
						var metricDef = new GlideRecord('asmt_metric_definition');
						metricDef.addQuery('sys_id',definitionId);
						metricDef.query();
						if(metricDef.next()){
							var qstRecord = new GlideRecord("asmt_assessment_instance_question");
							qstRecord.initialize();
							qstRecord.source_table = source_table;
							qstRecord.source_id = source_id;
							qstRecord.metric = metric;
							qstRecord.category = category;
							qstRecord.instance = instance;
							qstRecord.is_hidden = isHidden;
							qstRecord.metric_definition = definitionId;
							qstRecord.metric_type_group = metric_type_group;
							if(!GlideStringUtil.nil(questionMap[key]) && questionMap[key] == "RANKING"){
								qstRecord.value = definitionValueMap[definitionId + '_' + source_id];
							}
							else
								qstRecord.value = metricDef.getValue("value").toString();
							qstRecord.add_info = _this["ADDINFO:ASMTQUESTION:" + key];
							var qID = qstRecord.insert();
							utils.setAnonymizeResponse(qID);
						}
					}
				}
				else{
					//insert
					var qstRecord = new GlideRecord("asmt_assessment_instance_question");
					qstRecord.initialize();
					qstRecord.source_table = source_table;
					qstRecord.source_id = source_id;
					qstRecord.metric = metric;
					qstRecord.category = category;
					qstRecord.instance = instance;
					qstRecord.metric_type_group = metric_type_group;
					qstRecord.add_info = _this["ADDINFO:ASMTQUESTION:" + key];
					qstRecord.is_hidden = isHidden;
					var qID = qstRecord.insert();
					utils.setAnonymizeResponse(qID);
				}
				if(!isHidden)
					++questionCount;
			}

			inst.signature_result = (_this['signature_result']).trim();
			if(selection_result=='submit')
				inst.taken_on = new GlideDateTime();
			saveStatus(inst, questionCount, questionAnswer, retake);
		}
	}

	function saveResponse(questionId, value, selection_result) {
		var qst = new GlideRecord("asmt_assessment_instance_question");
		qst.get(questionId);
		var returnValue = 0;
		if (qst.isValid()) {
			qst.is_hidden = false;
			if (questionId in hiddenQuestions) {
				qst.value = '';
				qst.string_value = '';
				qst.is_hidden = true;
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
			} else if ('reference'.indexOf(qst.metric.datatype)>=0){
				qst.reference_id = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			} else if ('custom'.indexOf(qst.metric.datatype) >= 0){
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
	}

	function saveStatus(inst, questionCount, questionAnswer, retake) {
		inst.percent_answered = ((questionAnswer * 100) / questionCount);
		inst.channel = 'platform';
		if (selection_result == 'submit') {
			if (retake) {
				inst.state = "wip";
				inst.update();
			}
			inst.state = "complete";
			inst.update();
		} else if (selection_result == 'save') {
			if (inst.state != "complete")
				inst.state = "wip";
			inst.update();
		}
	}

	if (selection_result != 'cancel' && selection_result != 'close')
		saveAssessment();

	if (selection_result == 'close')
		(new SNC.AssessmentCreation()).removePreview(instance_sysID);

	var type = new GlideRecord("asmt_metric_type");
	type.get(type_sysID);

	var url = ''; 
	if(typeof sysparm_return_url!== 'undefined')
		url = GlideStringUtil.unEscapeHTML(sysparm_return_url);
	if (selection_result == 'submit') {
		if (type.url != '')
			url = type.url;
		else if (url == '') {
			url = 'assessment_thanks.do?sysparm_assessable_type=' + type_sysID.toString() + '&sysparm_assessment_type=' + type.evaluation_method.getChoiceValue().toLowerCase();
		}
	} else {
		var inst = new GlideRecord("asmt_assessment_instance");
		inst.get(instance_sysID);
		if (url == '') {
			url = 'assessment_take2.do?sysparm_assessable_type=' + type_sysID.toString() + '&sysparm_assessable_sysid=' + selection_result;
			if (inst)
				url += '&sysparm_inst_due_date=' + inst.getValue('due_date');
		}
	}
	response.sendRedirect(url);
})(this);
