function transform(input) {
	
	function getSourceTable(input)
	{
		var sourceRecordSysId = gs.nil(input.source_record) ? Object.keys(input.selected_records)[0] : input.source_record;
		var taskGr = new GlideRecord("task");
		taskGr.get(sourceRecordSysId);
		return taskGr.getValue('sys_class_name');
	}
    
	function addIDAndLabelToKnowledgeBases(knowledgeBases){
		var kbList = [];
		knowledgeBases.forEach(function(knowledgeBase){
			kbList.push({
				id : knowledgeBase.sysId,
				label : knowledgeBase.name
			});
		});
		return kbList;
	}

	function addIDAndLabelOnKnowledgeBaseToLanguageMap(knowledgeBaseToLanguagesMap){
		var kbIDToLanguageMap = {};
		
		for(var kbSysId in knowledgeBaseToLanguagesMap){
			var languages = knowledgeBaseToLanguagesMap[kbSysId];
			var kbLanguages = [];
			languages.forEach(function(language){
				kbLanguages.push({
					id : language.id,
					label : language.displayLabel
				});
			});
			kbIDToLanguageMap[kbSysId] = kbLanguages;
		}

		return kbIDToLanguageMap;
	}
	
	var utils = new sn_km_gen_ai.KnowledgeGenAIUtils();
	var sourceTable = getSourceTable(input);
	var canShowLanguagePicker = utils.canShowLanguagePicker(sourceTable, input.target_table);
	var data = utils.getKnowledgeBaseWithLanguage(sourceTable, input.target_table);
	
	data['kbList'] = [];
	data['kbIdToLanguageMap'] = {};
	data['sourceTable'] = sourceTable;
	data['targetTable'] = input.target_table;
	
	if(canShowLanguagePicker){
		data['kbList'] = addIDAndLabelToKnowledgeBases(data['knowledgeBaseList']);
		data['kbIdToLanguageMap'] = addIDAndLabelOnKnowledgeBaseToLanguageMap(data['knowledgeBaseToLanguagesMap']);
	}

	data['canShowLanguagePicker'] = canShowLanguagePicker;
    return data;
}
