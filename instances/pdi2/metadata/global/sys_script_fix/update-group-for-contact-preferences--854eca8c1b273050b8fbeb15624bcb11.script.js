var prefGr = new GlideRecord('cmn_rota_contact_preference');
prefGr.addQuery('group', '');
prefGr.query();

while (prefGr.next()) {
    if (!gs.nil(prefGr.cmn_rota) || !gs.nil(prefGr.cmn_rota_escalation_set)) {
        prefGr.group = prefGr.cmn_rota ? prefGr.cmn_rota.group + '' : prefGr.cmn_rota_escalation_set.group + '';
        prefGr.setWorkflow(false);
        prefGr.setUseEngines(false);
        prefGr.update();
    }
}
