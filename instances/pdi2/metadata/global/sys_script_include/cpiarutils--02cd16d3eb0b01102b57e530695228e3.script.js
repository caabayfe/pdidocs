var CPIARUtils = Class.create();
CPIARUtils.prototype = {
    initialize: function() {
		this.HR_CASE_TABLE = "sn_hr_core_case";
	},

    getTablesRefQualifier: function(tableName) {
        if (!tableName || !new GlideRecord(tableName).isValid()) return 'name=';

		var tableNames = '';
        var tables = new TableUtils(tableName).getTables();
		for (var i = 0; i < tables.size(); i++) {
			if (i !== 0)
				tableNames += ",";
			tableNames += String(tables.get(i));
		}
        return 'nameIN' + tableNames + "^elementISNOTEMPTY^element!=sys_id";
    },

	getPredictionFieldList: function(tableName) {
		if (!tableName || !new GlideRecord(tableName).isValid()) return [];
		
		var fieldList = [];
		var tableNames = '';
		var tables = new TableUtils(tableName).getTables();
		for (var i = 0; i < tables.size(); i++) {
			if (i !== 0)
				tableNames += ",";
			tableNames += String(tables.get(i));
		}
		var sysDictionaryGr = new GlideRecord('sys_dictionary');
		sysDictionaryGr.addEncodedQuery('internal_type!=collection^ORinternal_type=NULL');
		sysDictionaryGr.addEncodedQuery('nameIN' + tableNames + "^elementISNOTEMPTY^element!=sys_id");
		sysDictionaryGr.query();
		
		while(sysDictionaryGr.next()) {
			fieldList.push({'id': sysDictionaryGr.element.toString(), 'label':sysDictionaryGr.column_label.toString()});
		}
		
		fieldList.sort(function(a, b) {
			return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
		});

		return fieldList;
	},
	
	getPredictionFieldSelectedList: function(fieldList, selectedString) {
		if(!selectedString) return [];
		var selectedItemsList = selectedString.split(",");
		var itemsDict = {};
		for(var index in selectedItemsList) {
			itemsDict[selectedItemsList[index]] = index;
		}
		for(var field in fieldList) {
			var tempIndex = itemsDict[fieldList[field].id];
			if(tempIndex) {
				selectedItemsList[tempIndex] = fieldList[field];
			}
		}
		return selectedItemsList;
	},

	getEmailNotificationList: function(tableName) {
		if (!tableName || !new GlideRecord(tableName).isValid()) return [];

		var emailNotificationList = [];
		var emailGr = new GlideRecord('sysevent_email_action');
		emailGr.addQuery('collection', tableName);
		emailGr.addQuery('generation_type', 'triggered');
		emailGr.query();

		while (emailGr.next()) {
			emailNotificationList.push({'id': emailGr.sys_id.toString(), 'label':emailGr.name.toString()});
		}
		
		return emailNotificationList;
	},

	getSMSNotificationList: function(tableName) {
		if (!tableName || !new GlideRecord(tableName).isValid() || !new GlideRecord('notify_sms_template').isValid()) return [];

		var smsNotificationList = [];
		var smsGr = new GlideRecord('notify_sms_template');
		smsGr.addQuery('table', tableName);
		smsGr.query();

		while (smsGr.next()) {
			smsNotificationList.push({'id': smsGr.sys_id.toString(), 'label':smsGr.name.toString()});
		}
		
		return smsNotificationList;
	},

	getIntentList: function(configSysId) {
		var intentList = [];
		var intentChoices = new AutoResolutionIntentChoiceListBuilder().getSupportedIntents(configSysId);
		
		for (var i = 0; i < intentChoices.getSize(); i++) {
			intentList.push({'id': intentChoices.getChoice(i).getValue(), 'label': intentChoices.getChoice(i).getLabel()});
		}

		return intentList;
	},

	checkIntentListExists: function(configSysId) {
		return new AutoResolutionIntentChoiceListBuilder().getSupportedIntents(configSysId).getSize() !== 0;
	},

	getTopicList: function() {
		var topicList = [];
		var topicGr = new GlideRecord('sys_cs_topic');
		topicGr.addQuery('visible', true); 
		topicGr.addActiveQuery();
		topicGr.query();

		while (topicGr.next()) {
			topicList.push({'id': topicGr.getValue('sys_id'), 'label': topicGr.getValue('name')});
		}

		return topicList;
	},

	getIARSLARecord: function(tableName) {
		var slaGr = new GlideRecord('contract_sla');
		slaGr.addQuery('collection', tableName);
		slaGr.addQuery('flow', '5ea5d7d453c50110af71ddeeff7b12da'); //IAR SLA Reminder Flow
		slaGr.query();

		if (slaGr.next()) {
			return slaGr.getUniqueValue();
		}

		return '';
	},

	isSMSActive: function() {
		var smsGr = new GlideRecord('sys_plugins');
		smsGr.addQuery('source', 'com.snc.notify.twilio_direct');
		smsGr.addActiveQuery();
		smsGr.query();

		if (smsGr.next()) {
			return true;
		} 
		
		return false;
	},
	
	getResolutionConfigDetails: function(recordId) {
		var glideRecord = new GlideRecord('sys_cs_auto_resolution_configuration');
		var exists = glideRecord.get(recordId);
		var result = {};
		if(exists) {
			result['recordSysId'] = recordId;
			result['tableName'] = glideRecord.getValue('target_table_name');
			result['tableNameLabel'] = gs.getMessage('Issues to be automated');
			
			result['iarInvocation'] = glideRecord.getDisplayValue('iar_invocation') ?  glideRecord.getDisplayValue('iar_invocation') : gs.getMessage('Automatic');
			result["iarInvocationLabel"] = gs.getMessage('IAR Invocation');
			
			result['assignTo'] = glideRecord.getDisplayValue('assign_to');
			result['assignToLabel'] = gs.getMessage('Assigned to');
			
			result['entryCondition'] = glideRecord.getDisplayValue('condition');
			if(!result['entryCondition']) {
				result['entryCondition'] = gs.getMessage("(empty)");
			}
			result['entryConditionLabel'] = gs.getMessage('Entry Criteria Condition');
			
			result["exitCondtion"] = glideRecord.getDisplayValue("exit_condition");
			if(!result['exitCondtion']) {
				result['exitCondtion'] = gs.getMessage("(empty)");
			}
			result["exitCondtionLabel"] = gs.getMessage("Exit Criteria Condition");
			
			result['modelsTrainedLabel'] = gs.getMessage('ML Models Trained');
			result['modelsTrainedTable'] = 'sys_cs_auto_resolution_configuration_language';
			result['modelsTrainedTableQuery'] = 'configuration='+recordId,
			result['modelsTrainedTableColumns'] = 'ml_solution_name,training_language,ml_training_state,active';
			
			result['intentsToTopicsLabel'] = gs.getMessage('Intents to Topics Mapped');
			result['intentsToTopicsTable'] = 'sys_cs_auto_resolution_intent_topic_map';
			result['intentsToTopicsTableQuery'] = 'ar_configuration='+recordId;
			result['intentsToTopicsTableColumns'] = 'ar_intent,matched_topic,active';
			
			result['remindersLabel'] = gs.getMessage('Reminders');
			result['remindersTable'] = 'sys_cs_auto_resolution_reminder';
			result['remindersTableQuery'] = 'configuration='+recordId;
			result['remindersTableColumns'] = 'percentage,email_notification,sms';
			
			result['aiSearchEnabled'] = glideRecord.getValue('ais_enabled') == "1" ? gs.getMessage("Enabled") : gs.getMessage("Disabled");
			result['aiSearchEnabledLabel'] = gs.getMessage('Apply AI Search');
			
			result['emailNotificationTemplates'] = glideRecord.getDisplayValue('initial_recommendation_email');
			if(!result['emailNotificationTemplates']) {
				result['emailNotificationTemplates'] = gs.getMessage("(empty)");
			}
			result['emailNotificationTemplatesLabel'] = gs.getMessage('Email notification templates');
			
			if(glideRecord.isValidField('initial_recommendation_sms')) {
				result['smsNotificationTemplates'] = glideRecord.getDisplayValue('initial_recommendation_sms');
				if(!result['smsNotificationTemplates']) {
					result['smsNotificationTemplates'] = gs.getMessage("(empty)");
				}
				result['smsNotificationTemplatesLabel'] = gs.getMessage("SMS notification templates");
				result['showSmsNotificationTemplates'] = true;
			} else{
				result['showSmsNotificationTemplates'] = false;
			}
			
			result['responseChannels'] = global.AutoResolutionAPI.getActiveResponseChannels(recordId).join();
			if(!result['responseChannels']) {
					result['responseChannels'] = gs.getMessage("(empty)");
			}
			result['responseChannelsLabel'] = gs.getMessage('Configured Response Channels');
			
			result['isHRTable'] = this.isHRCaseTable(glideRecord.getValue('target_table_name'));
			result['listViewName'] ='iar_admin_wizard_view';
			result['active'] = glideRecord.getValue("active") == '1' ? true: false;
		}
		return result;
	},
	
    type: 'CPIARUtils'
};
