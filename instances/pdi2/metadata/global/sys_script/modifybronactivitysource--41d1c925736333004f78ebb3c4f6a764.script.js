(function executeRule(current, previous /*null when async*/ ) {

    var ruleId;
    var gr = new GlideRecord('sys_script');
    gr.addQuery('collection', current.activity_source_table);
    gr.addQuery('name', 'Create Activity');
    gr.query();

    if (gr.next()) {
        ruleId = gr.sys_id;
		gs.addInfoMessage("Existing Business Rule <a href = '/sys_script.do?sys_id=" + ruleId + "'>Click Here</a>");
    } 
	else {
        //get Table scope
        var tableRecord = new GlideRecord('sys_db_object');
        tableRecord.addQuery('name', current.activity_source_table);
        tableRecord.query();
        if(tableRecord.next()){
		
        gr = new GlideRecord('sys_script');
        gr.initialize();
        gr.setValue('collection', current.activity_source_table);
        gr.setValue('name', 'Create Activity');
        gr.setValue('sys_scope', tableRecord.sys_scope);
        gr.setValue('advanced', true);
        gr.setValue('when', 'after');
        gr.setValue('action_insert', true);
		gr.setValue('description', 'System created business rule');	
        ruleId = gr.insert();
		gs.addInfoMessage("New Business Rule <a href = '/sys_script.do?sys_id=" + ruleId + "'>Click Here</a>");
		}
    }
    

})(current, previous);
