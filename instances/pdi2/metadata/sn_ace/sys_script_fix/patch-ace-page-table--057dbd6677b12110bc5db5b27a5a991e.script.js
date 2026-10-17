var gr = new GlideRecord('sn_ace_page');
gr.addQuery('is_template', false);
gr.addNotNullQuery('template');
gr.addNotNullQuery('route');
gr.addNotNullQuery('template.version');
gr.query();
while (gr.next()) {
    gr.setValue('version', gr.template.version);
    gr.update();
    gs.info('FIX SCRIPT: "Update version in ACE Page table": ' + gr.getValue('name') + ' - ' + gr.getValue('version'));
}
