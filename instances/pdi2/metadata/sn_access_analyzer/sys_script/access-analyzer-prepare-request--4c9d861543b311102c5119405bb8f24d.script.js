(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_security_operation');
    gr.query();
    var opr = {};
    while (gr.next()) {
        opr[gr.sys_id] = gr.getValue('name');
    }
	
    g_scratchpad.sysSecurityOperations = opr;


})(current, previous);
