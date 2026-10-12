(function executeRule(current, previous /*null when async*/) {
	var interactionId = current.origin_id;
	var gr = new GlideRecord("interaction");
	if (gr.get(interactionId))
		current.assigned_to = gr.getValue("assigned_to");
})(current, previous);
