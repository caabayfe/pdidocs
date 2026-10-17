deleteUnwantedWizardAnswerRecords();

function deleteUnwantedWizardAnswerRecords() {
    var gr = new GlideRecord('sys_wizard_answer');
    gr.addQuery('sys_scope', '81ac5fe1c7442110408bc8d6f2c260d1');
    gr.addQuery('active', true);
    gr.query();
    while (gr.next()) {
        gs.info(gs.getMessage("Deleted sys_wizard_answer record: {0}", gr.getValue('name')));
        gr.deleteRecord();
    }
}
