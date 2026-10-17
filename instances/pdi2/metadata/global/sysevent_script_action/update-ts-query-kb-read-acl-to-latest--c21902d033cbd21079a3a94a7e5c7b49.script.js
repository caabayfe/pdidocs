var TABLE_NAME = 'sys_security_acl';
    var SYS_ID = '920cbdebc0a8016633c97cb6eaef0268';
    var updatedScript = 'answer = gs.hasRole(\'knowledge_admin\') || gs.hasRole(\'knowledge_manager\') || gs.hasRole(\'text_search_admin\') || gs.hasRole(\'platform_ml_read\');';
    var gr = new GlideRecord(TABLE_NAME);
    gr.get(SYS_ID);
    gr.query();
    if(gr.next()) {
        gr.script = updatedScript;
        gr.update();
    }
