(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var atUtil = new ArticleTemplateUtil();
	var tableName = current.child_table;
	var articleType = current.article_template;

	if(current.operation() == 'insert'){
		tableName = atUtil.getNameFromLabel(articleType, 'kb_template_', true); 
		var atNameExists = atUtil.validateATNameWithParams(articleType, tableName);
		if(atNameExists == 'nameExists'){
			gs.addErrorMessage(gs.getMessage('An article template with the same name already exists. Enter a different name.'));
			current.setAbortAction(true);
			return;
		}
		else if(tableName == '' || gs.nil(tableName)) {
			gs.addErrorMessage(gs.getMessage('Enter a valid name with alphanumeric characters and underscore.'));
			current.setAbortAction(true);
			return;
		}

		var tableSysId = atUtil.createKnowledgeChildTable(tableName, articleType);
		if(tableSysId != null){
			current.child_table = tableName;
			atUtil.updateSysDictionaryProperties(tableName);		
			var iaSysId = atUtil.createInterceptorEntry(articleType, tableName);
			current.answer_ref = iaSysId;
			atUtil.createCustomRendererForTemplate(tableName);
      atUtil.createRouteMappingForTemplate(tableName);
		}
		else{
			gs.addErrorMessage(gs.getMessage('An error occurred while processing the request. Please contact the system administrator.'));
			current.setAbortAction(true);
			return;
		}
	}
	else if(current.operation() == 'update'){
		var answerRef = current.answer_ref;
		if(current.article_template != previous.article_template){
			// update table label
			var gr = new GlideRecord('sys_db_object');
			gr.addQuery('name', current.child_table);
			gr.query();
			if(gr.next()){
				gr.label = articleType;
				gr.update();
			}
		}
		// update interceptor entry
		atUtil.updateInterceptorEntry(current, previous);
	}
})(current, previous);


    
