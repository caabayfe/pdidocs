//Our goal here is to not allow the user to switch mid server option while there is a running listener
function onSubmit() {
	var gr = new GlideRecord(g_form.getTableName());
	if (!gr.get(g_form.getUniqueValue()))//ignore NEW
		return true;
	
	if (gr.mid_server == g_form.getValue('mid_server'))//ignore no MID changes
		return true;
	
	if (!g_form.getValue('listener'))//ignore if user disabling listener
		return true;
	
	//MID server changed, listener is enabled and we already have a running listener
	if (gr.listener === 'true'){
		var msg = formatMessage(getMessage("You can not change the 'MID Server' value while the listener is running. Please stop the listener first."));
		alert(msg);
		g_form.setValue('mid_server', gr.mid_server);
		return false;
	}
	
	return true;
	
}
