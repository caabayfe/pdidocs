function _changeToStringUTF(tableName, fieldName, currentInternalType) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", tableName);
    gr.addQuery("internal_type", currentInternalType);
    gr.addQuery("element", fieldName);
    gr.setWorkflow(false);
    gr.query();

    if(gr.next()) {
        gr.setValue("internal_type", "string_full_utf8");
        gr.update();
    }
}

_changeToStringUTF('sys_cb_topic', 'graph', 'json');
_changeToStringUTF('sys_cs_topic', 'definition', 'string');
_changeToStringUTF('sys_cs_conversation', 'topic_definition', 'string');
_changeToStringUTF('sys_cs_conversation_task', 'fields', 'string');
