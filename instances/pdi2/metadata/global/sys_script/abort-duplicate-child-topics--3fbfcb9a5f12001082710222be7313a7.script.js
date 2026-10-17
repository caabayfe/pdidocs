(function executeRule(current, previous /*null when async*/) {

    var gr = new GlideRecord('topic');
	
	var isTopicEmpty = current.parent_topic == null || current.parent_topic == '';
	if(isTopicEmpty)
		gr.addNullQuery('parent_topic');
	else 
		gr.addQuery('parent_topic', current.parent_topic);
	gr.addQuery('taxonomy', current.taxonomy);
	gr.addQuery('name', current.name);
	gr.addQuery('sys_id','!=', current.sys_id);
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		if(isTopicEmpty)
			gs.addErrorMessage(gs.getMessage("Two topics with an empty parent topic cannot have the same name. Rename this topic or choose a parent topic and try again."));
		else
			gs.addErrorMessage(gs.getMessage("A parent topic cannot have two child topics with the same name. Rename this topic or choose a different parent topic."));
	}

})(current, previous);
