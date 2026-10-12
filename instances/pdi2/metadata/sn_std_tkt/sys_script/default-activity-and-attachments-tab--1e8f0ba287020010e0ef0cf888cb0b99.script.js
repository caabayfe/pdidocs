(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('ticket_tab_configuration');
	
    //Creating default activity tab
    gr.initialize();
    gr.type = 'activity';
    gr.tab_name = gs.getMessage('Activity');
    gr.order = 10;
    gr.parent = current.sys_id;
	gr.table = current.table;
    gr.insert();
	
    //Creating default attachments tab
    gr.initialize();
    gr.type = 'attachments';
    gr.tab_name = gs.getMessage('Attachments');
    gr.order = 20;
    gr.parent = current.sys_id;
	gr.table = current.table;
    gr.insert();

})(current, previous);
