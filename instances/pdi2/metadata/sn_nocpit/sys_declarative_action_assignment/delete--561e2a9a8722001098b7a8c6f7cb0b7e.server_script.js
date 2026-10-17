if(current.user_id!="NULL" && current.user_id!=""){
	var gr = new GlideRecord('noc_user_view');
	if (gr.get(current.sys_id))
		gr.deleteRecord();
}
