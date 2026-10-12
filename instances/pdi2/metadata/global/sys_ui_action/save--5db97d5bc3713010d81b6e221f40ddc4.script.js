execSaveInteractionRelatedRecord();

function execSaveInteractionRelatedRecord() {

	var existingRelationship = new GlideRecord("interaction_related_record");
	existingRelationship.addQuery("interaction", current.interaction);
	var relatedRef = null;
	if (current.getValue("type") == "knowledge" && !current.knowledge_article.nil()) {
		relatedRef = current.knowledge_article;
		existingRelationship.addQuery("knowledge_article", relatedRef);
	} else if (current.getValue("type") == "task" && !current.task.nil()) {
		relatedRef = current.task;
		existingRelationship.addQuery("task", relatedRef);
	} else if (!current.document_id.nil()) {
		relatedRef = current.document_id;
		existingRelationship.addQuery("document_id", relatedRef);
	} else {
		gs.addInfoMessage(gs.getMessage("No {0} selected", current.type.nil() ? "task" : current.getValue("type")));
		return;
	}

	existingRelationship.setLimit(1);
	existingRelationship.query();
	if(existingRelationship.next()){
		gs.addInfoMessage(gs.getMessage("{0} is already associated with {1}",
			[relatedRef.getRefRecord().number, current.interaction.getRefRecord().number]));
		return;
	}
	current.insert();
}
