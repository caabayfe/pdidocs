(function executeRule(current, previous /*null when async*/) {
    try {
        var entity = current.sys_id;
        var gr = new GlideRecord('m2m_sys_nlu_utterance_entity');
        gr.addQuery('entity', entity);
        gr.query();

        while (gr.next()) {
			gr.deleteRecord();
        }
    } catch (e) {
        gs.debug("Error in NLU Entity Update : " + e.message);
    }
})(current, previous);
