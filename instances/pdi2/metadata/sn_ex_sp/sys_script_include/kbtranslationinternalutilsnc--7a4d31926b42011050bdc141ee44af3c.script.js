var KBTranslationInternalUtilSNC = Class.create();
KBTranslationInternalUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getTranslatedKbsNotLinkedToTopic: function () {

		var responseObj = {
			topicContentMapArr: [],
			isTranslationPluginInstalled: true,
			isMultipleLangKBPresent: true
		};
		if (!GlidePluginManager.isActive('com.glideapp.knowledge.i18n2')){
			responseObj.isTranslationPluginInstalled = false;
			return JSON.stringify(responseObj);
		}
		var langCount = 0;
		var kbGr = new GlideAggregate('kb_knowledge');
		kbGr.addAggregate('COUNT(DISTINCT','language');
		kbGr.setGroup(false);
		kbGr.query();

		while(kbGr.next()){
			langCount = kbGr.getAggregate('COUNT(DISTINCT','language');
		}
		if(langCount <= 1){
			responseObj.isMultipleLangKBPresent = false;
			return JSON.stringify(responseObj);
		}
		var topicGr = new GlideRecord('topic');
		topicGr.query();
		while (topicGr.next()) {
			var flag = false;
			topicContentMap = {
				topic: topicGr.getDisplayValue(),
				sys_id: topicGr.getUniqueValue(),
				unlinkedContent: []
			};
			
			var contentGr = new GlideRecord('m2m_connected_content');
			contentGr.addQuery('topic', topicGr.getUniqueValue());
			contentGr.addQuery('content_type', '4c32a92153622010069addeeff7b12a3');
			contentGr.query();
			while (contentGr.next()) {
				var translatedKb = new KBContentTranslationUtil().getTranslatedVersionsFromSysId(contentGr.getValue('knowledge'));
				
				while (translatedKb.next()) {
					var transGr = new GlideRecord('m2m_connected_content');
					transGr.addQuery('knowledge', translatedKb.getUniqueValue());
					transGr.addQuery('topic', topicGr.getUniqueValue());
					transGr.query();
					
					if (!transGr.hasNext()) {
						flag = true;
						if(topicContentMap.unlinkedContent.indexOf(translatedKb.getDisplayValue()) === -1)
							topicContentMap.unlinkedContent.push(translatedKb.getDisplayValue());
					}
				}
			}
			if (flag)
				responseObj.topicContentMapArr.push(topicContentMap);
		}
		return JSON.stringify(responseObj);
	},
	linkAllTranslatedVersionsToTopic: function() {
		var startMessage = gs.getMessage("Knowledge articles linking process started");
		gs.addInfoMessage(startMessage);
		if (!GlidePluginManager.isActive('com.glideapp.knowledge.i18n2')){
			return gs.getMessage("Translation plugin not installed");
		}
		var count = 0;
		var langCount = 0;
		var kbGr = new GlideAggregate('kb_knowledge');
		kbGr.addAggregate('COUNT(DISTINCT','language');
		kbGr.setGroup(false);
		kbGr.query();
		while(kbGr.next()){
			langCount = kbGr.getAggregate('COUNT(DISTINCT','language');
		}
		if(langCount <= 1){
			return gs.getMessage("Knowledge articles doesn't exist in multiple languages");
		}
		var topicGr = new GlideRecord('topic');
		topicGr.query();
		while (topicGr.next()) {
			
			var contentGr = new GlideRecord('m2m_connected_content');
			contentGr.addQuery('topic', topicGr.getUniqueValue());
			contentGr.addQuery('content_type', '4c32a92153622010069addeeff7b12a3');
			contentGr.query();
			while (contentGr.next()) {
				var translatedKb = new KBContentTranslationUtil().getTranslatedVersionsFromSysId(contentGr.getValue('knowledge'));
				
				while (translatedKb.next()) {
					var transGr = new GlideRecord('m2m_connected_content');
					transGr.addQuery('knowledge', translatedKb.getUniqueValue());
					transGr.addQuery('topic', topicGr.getUniqueValue());
					transGr.query();
					
					if (!transGr.hasNext()) {
						var newContentGr = new GlideRecord('m2m_connected_content');
						newContentGr.initialize();
						newContentGr.setValue('topic', topicGr.getUniqueValue());
						newContentGr.setValue('knowledge', translatedKb.getUniqueValue());
						newContentGr.setValue('content_type', '4c32a92153622010069addeeff7b12a3');
						newContentGr.insert();
						count++;
						gs.info(translatedKb.getDisplayValue() + " was added to "+ topicGr.getDisplayValue()+"("+topicGr.getUniqueValue()+")");
					}
				}
			}
			
		}
		var finishMessage = gs.getMessage("Translated knowledge articles linking is completed. Please check application logs for more details");
		gs.addInfoMessage(finishMessage);
		return count;
	},
	type: 'KBTranslationInternalUtilSNC'
});
