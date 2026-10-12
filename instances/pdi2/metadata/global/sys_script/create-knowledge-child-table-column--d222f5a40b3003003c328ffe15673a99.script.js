(function executeRule(current, previous /*null when async*/) {
	
	var atUtil = new ArticleTemplateUtil();
	var columnName = atUtil.getNameFromLabel(current.column_label, 'kb_', false); 
	// Handling for new record 
	if(current.operation() == 'insert'){
		var atGR = new GlideRecord('kb_article_template');
		atGR.get(current.article_template);
		var isColumnPresent = atUtil.validateColumnNameWithParams(columnName, atGR.child_table, current.column_label, current.article_template);
		if(isColumnPresent == 'nameExists'){
			gs.addErrorMessage(gs.getMessage('A field with this name already exists in this template. Enter a different name.'));
			current.setAbortAction(true);
			return;
		}
		else if(columnName == '' || gs.nil(columnName)) {
			gs.addErrorMessage(gs.getMessage('Enter a valid name with alphanumeric characters and underscore.'));
			current.setAbortAction(true);
			return;
		}
		var column = new GlideRecord('sys_dictionary');
		column.initialize();
		column.name = atGR.child_table;
		column.internal_type = current.column_type;
		column.column_label = current.column_label;
		if(current.column_type == 'string' || current.column_type == 'html'){
			column.text_index = true;
			if(current.column_type == 'string'){
				column.max_length = 500;
			}
		}
	
		column.element = columnName;
		column.mandatory = current.mandatory;
		var sysId = column.insert();
		current.table_column = column.element;
		if(current.column_type == 'html') {
			SNC.DictionaryAttribute.set(atGR.child_table,columnName,"editor.height","300");
			SNC.DictionaryAttribute.set(atGR.child_table,columnName,"editor.toolbar","fontfamily fontsize | bold italic underline strikethrough forecolor backcolor pastetext removeformat | blocks searchreplace undo redo spellchecker | bullist numlist outdent indent alignleft aligncenter alignright | tableofcontents table link unlink a11ycheck anchor accordion insertdatetime | image media codesample | code fullscreen");
			SNC.DictionaryAttribute.set(atGR.child_table,columnName,"editor.plugins","table link image media codemirror lists advlist fullscreen charmap directionality emoticons insertdatetime nonbreaking pagebreak searchreplace wordcount anchor tableofcontents codesample visualblocks visualchars compat3x autolink align_listitems tinymcespellchecker accordion editimage a11ychecker");
		}
	}
	// handling for update scenario
	else if(current.operation() == 'update'){
		var column = new GlideRecord('sys_dictionary');
		column.addQuery("name", current.article_template.child_table);
		column.addQuery("element", current.table_column);
		column.query();
		if(column.next() && !column.hasNext()){
			var hasChanges = false;
			if(current.column_label != previous.column_label){
				column.column_label = current.column_label;		
				hasChanges = true;
			}
			if(current.mandatory != previous.mandatory){
				column.mandatory = current.mandatory;
				hasChanges = true;
			}
			if(current.active != previous.active){
				column.text_index = current.active;
				column.attributes = 'no_text_index=' + !current.active;
				hasChanges = true;
			}
			if(hasChanges === true){
				column.update();
			}
		}			
	} 
})(current, previous);
