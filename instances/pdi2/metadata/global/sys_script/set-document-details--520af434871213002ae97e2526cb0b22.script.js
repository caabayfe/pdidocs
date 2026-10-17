(function executeRule(current, previous /*null when async*/) {
	if (current.type == 'task' && current.task) {
		var glide = new GlideRecord('task');
		glide.addQuery('sys_id', current.task);
		glide.query();
		current.document_table = glide.next() ? glide.getValue('sys_class_name') : '';
        current.document_id = current.task;

		//set knowledge to null to prevent potential previous knowledge record data retention
		current.knowledge_article = '';

	} else if (current.type == 'knowledge' && current.knowledge_article) {
		current.document_table = "kb_knowledge";
		current.document_id = current.knowledge_article;

		//set task to null to prevent potential previous task record data retention
		current.task = '';
	}

	if (current._operation() == 'insert') {
		var existingRelationship = new GlideRecord("interaction_related_record");
		existingRelationship.addQuery("interaction", current.interaction);
		existingRelationship.addQuery("document_id", current.document_id);
		existingRelationship.setLimit(1);
		existingRelationship.query();

		if (existingRelationship.next()) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("{0} is already associated with {1}", [current.document_id.getRefRecord().number, current.interaction.getRefRecord().number]));
		} else {
			gs.addInfoMessage(gs.getMessage("{0} has been associated with {1}", [current.document_id.getRefRecord().number, current.interaction.getRefRecord().number]));
		}
	} 
})(current, previous);
