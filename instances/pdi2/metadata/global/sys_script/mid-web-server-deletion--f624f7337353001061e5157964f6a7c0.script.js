(function executeRule(current, previous /*null when async*/) {
    gs.info("Running MID Web Server deletion");
    var gr = new GlideRecord('ecc_agent_ext_context_webserver');
    gr.addQuery('mid_server',current.getUniqueValue());
    gr.query();
    while(gr.next()){
        gs.info("MID Web Server deletion: "+gr.getValue('name'));
        gr.setValue('status','Stopped');
        gr.update();
        gr.deleteRecord();
    }
})(current, previous);
