var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'spm_taxonomy_node');
gr.addQuery('element', 'parent');
gr.query();
if (gr.next()) {
    if (gs.getProperty('standard_portfolio_construct.turn_on') == 'true') {
        gr.setValue('reference_qual', "javascript:'spm_service_portfolio=' + current.spm_service_portfolio");
        gr.update();
        gs.info('Updated reference_qual for parent field on spm_taxonomy_node table');
    }
}
