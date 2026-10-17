var esc_PreChatUtil = Class.create();
esc_PreChatUtil.prototype = {
	initialize: function(interactionSysId) {
		this.interactionGr = null;
		if (interactionSysId) {
			var gr = new GlideRecord("interaction");
			if (gr.get(interactionSysId))
				this.interactionGr = gr;
		}
	},
	getCategoryRefQualifier: function(preChatGr) {
		return "metric.category.metric_type="+preChatGr.pre_chat_config.pre_chat_survey.survey;
	},
	getJsonBlob: function(interactionGr) {
		interactionGr = interactionGr || this.interactionGr;
		var contextTable = interactionGr.getValue("context_table");
		var contextDoc = interactionGr.getValue("context_document");

		if ("interaction_json_blob" != contextTable || !contextDoc)
			return null;

		var contextGr = new GlideRecord(contextTable);
		if (contextGr.get(contextDoc)) {
			try {
				return JSON.parse(contextGr.getValue("value"));
			} catch (e) {
				gs.warn(gs.getMessage("esc_PreChatUtil: Error parsing interaction context"));
				return null;
			}
		}
	},
	/*
	* @desc It is used to check the applicability of pre-chat survey for user based on audience
	* @parm interactionGr
	* @parm preChatSurveyId
	* @return boolean
	*/
	isApplicable : function(interactionGr, preChatSurveyId) {
		var contextJson = this.getJsonBlob(interactionGr);

		if (!contextJson)
			return false;

		var preChatConfigGr = new GlideRecord("sn_hr_sp_pre_chat_survey_config");
		if (preChatConfigGr.isValid()) {
			preChatConfigGr.addQuery("pre_chat_survey", preChatSurveyId);
			if (contextJson.hasOwnProperty("portal")) 
				preChatConfigGr.addQuery("portal.url_suffix", contextJson.portal);
			else if (contextJson.hasOwnProperty("clienttype"))
				preChatConfigGr.addQuery("mobile_client", contextJson.clienttype);
			else
				return false;

			preChatConfigGr.setLimit(1);
			preChatConfigGr.query();
			
			
			if (preChatConfigGr.next()) {
				return gs.nil(preChatConfigGr.user_criteria) || 
					sn_uc.UserCriteriaLoader.userMatches(gs.getUserID(),[preChatConfigGr.getValue("user_criteria")]);
			}
		}

		return false;
	},
	/*
	* @desc returns connect queue based on sn_hr_sp_pre_chat mapping
	* @returns sys_id of chat_queue
	*/
	getQueue: function() {
		var contextJson = this.getJsonBlob();
		var category = contextJson.liveagent_esc_pre_chat_category;
		var surveyInstanceId = contextJson.liveagent_pre_assessment_instance;

		var questionInstGr = new GlideRecord("asmt_assessment_instance_question");
		questionInstGr.addQuery("instance", surveyInstanceId);
		questionInstGr.addQuery("metric.datatype","choice");
		questionInstGr.query();
		var metrics = [];
		while (questionInstGr.next())
			metrics.push(questionInstGr.getValue("metric"));
		
		var preChatGr = new GlideRecord("sn_hr_sp_pre_chat");
		if (preChatGr.isValid()) {
			preChatGr.addQuery("pre_chat_category.metric","IN",metrics.toString());
			preChatGr.addQuery("pre_chat_category.display",category);
			preChatGr.query();
			if (preChatGr.next())
				return preChatGr.getValue("queue");
		}
		return null;
	},
	isESCPortal : function() {
		var contextJson = this.getJsonBlob(this.interactionGr);
		var urlSuffix = new sn_hr_sp.hr_TicketPageConfigUtil().getActivePortalURLSuffix();
		if (contextJson.hasOwnProperty("portal") && contextJson.portal == urlSuffix)
			return true;
		return false;
	},
	isMobile : function(clientType) {
		var contextJson = this.getJsonBlob(this.interactionGr);
		if (contextJson.hasOwnProperty("clienttype") && contextJson.clienttype == clientType)
			return true;
		return false;
	},
	showAskAQuestionPreChat : function(interactionGr) {
		var contextJson = this.getJsonBlob(interactionGr);
		var result = contextJson.show_ask_a_question_prechat == 'true';
		if (new GlidePluginManager().isActive('com.sn_hr_core'))
			result = result && gs.getProperty('sn_hr_sp.hr_ask_a_question_enabled', 'true') == 'true';
		
		return result;
	},
	
	_updateComment: function(table, record_sys_id, comment) {
		var gr = new GlideRecord(table);
		gr.addQuery('sys_id', record_sys_id);
		gr.query();
		if(gr.next()) {
			gr.comments = comment;
			gr.update();
		}
	},
	
	updateAdditionalcomments: function(interactionGr) {
		var contextJson = this.getJsonBlob(interactionGr);

		if (!contextJson)
			return false;
		
		if('hr' == contextJson['liveagent_application'] && contextJson['liveagent_pre_chat_survey_name'] == 'Ask a Question Pre-chat') {
			var case_sys_id = null;
			var comment = contextJson['liveagent_esc_pre_chat_ask_a_question'];
			
			if(contextJson['liveagent_task_number'].includes("HRC"))
				case_sys_id = contextJson['liveagent_task_sys_id'];
			else if(contextJson['liveagent_task_number'].includes("HRT")) {
				case_sys_id = contextJson['liveagent_parent_case_sys_id'];
				var task_sys_id = contextJson['liveagent_task_sys_id'];
				this._updateComment('sn_hr_core_task', task_sys_id, comment);
			}
			
			this._updateComment('sn_hr_core_case', case_sys_id, comment);
		}
	},

	type: 'esc_PreChatUtil'
};
