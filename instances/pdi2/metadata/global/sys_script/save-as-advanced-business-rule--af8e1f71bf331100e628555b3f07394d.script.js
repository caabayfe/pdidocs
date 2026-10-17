(function(){
	var gr = new GlideRecord('sys_script');
	gr.newRecord();
	if(gr.script.nil())
		return;
	
	if(GlideStringUtil.normalizeWhitespace(current.script.toString()) != GlideStringUtil.normalizeWhitespace(gr.script.toString()))
		current.advanced = true;
})();
