var dictionaryGR = new GlideRecord('sys_dictionary');
dictionaryGR.addQuery('name', 'cmn_rota_esc_step_def');
dictionaryGR.addQuery('element', 'time_to_next_step');
dictionaryGR.setLimit(1);
dictionaryGR.query();
if (dictionaryGR.next()) {
    dictionaryGR.default_value = '00:15:00';
    dictionaryGR.setWorkflow(false); //turn off workflow so cache is not flushed each time
    dictionaryGR.update();
}
