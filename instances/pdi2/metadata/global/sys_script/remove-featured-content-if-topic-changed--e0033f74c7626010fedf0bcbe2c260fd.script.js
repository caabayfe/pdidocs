(function executeRule(current, previous /*null when async*/ ) {
	//Remove feeatured content if the connected content is moved to another topic
    var gr = new GlideRecord('featured_content');
    gr.addQuery('connected_content', current.sys_id);
    gr.deleteMultiple();
})(current, previous);
