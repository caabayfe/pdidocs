var naaUtils = new sn_wwna.NAAWWNAUtils();
var skillConfigIds = naaUtils.fetchM2MSkillMap();
skillConfigIds = Object.keys(skillConfigIds);
var gr = new GlideRecord('sn_nowassist_skill_config_var_set');
gr.addQuery('skill_config', 'IN', skillConfigIds);
gr.addQuery('name', '__delivery_step__');
gr.addQuery('config_type', sn_wwna.WWNAConstants.WWNA_DUMMY_CONFIG_TYPE_ID);
gr.query();
while (gr.next()) {
    var varSetId = gr.getUniqueValue();
    gr.setValue('config_type', sn_wwna.WWNAConstants.NAA_OOB_DELIVERY_STEP);
    gr.update();
    gr.vars['show_nap_card'] = false;
    gr.update();
    var varSetUIGr = new GlideRecord('sn_ns_skill_config_var_set_ui');
    varSetUIGr.addQuery('var_set', varSetId);
    varSetUIGr.query();
    if (varSetUIGr.next()) {
        varSetUIGr.deleteRecord();
    }
}
