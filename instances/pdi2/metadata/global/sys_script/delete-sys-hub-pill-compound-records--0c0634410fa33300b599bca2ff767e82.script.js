(function executeRule(current, previous /*null when async*/) {
  var gr = new GlideRecord("sys_hub_pill_compound");
	gr.addQuery("attached_to", current.sys_id);
	gr.query();
	while (gr.next())
		gr.deleteRecord();

})(current, previous);
