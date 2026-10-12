(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("unconnected_category_content");
	gr.addEncodedQuery("sys_id!=" + current.sys_id.toString() + "^knowledge.number=" + current.knowledge.number.toString() + "^topic=" + current.topic.toString() + "^update_type=" + current.update_type.toString());
	gr.query();
	gr.deleteMultiple();

})(current, previous);
