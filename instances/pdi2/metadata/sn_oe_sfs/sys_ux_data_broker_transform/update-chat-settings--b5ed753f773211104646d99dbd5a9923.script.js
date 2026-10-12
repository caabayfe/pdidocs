function transform(input) {
    var util = new global.ACEAppBuilderGlobalScopedUtil();
    util.updateRecord('sys_cs_live_agent_setup', input.record_id, input.field_values);

}
