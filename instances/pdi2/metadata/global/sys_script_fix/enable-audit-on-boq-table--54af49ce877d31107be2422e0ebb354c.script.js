function enableAudit() {
        var gr = new GlideRecord('sys_dictionary');
        gr.addEncodedQuery('internal_type=collection^name=sn_atf_tg_sn_boq');
        gr.query();
        if (gr.next()) {
            gr.setValue('audit', true);
            gr.update();
        }
    }
	
    enableAudit();
