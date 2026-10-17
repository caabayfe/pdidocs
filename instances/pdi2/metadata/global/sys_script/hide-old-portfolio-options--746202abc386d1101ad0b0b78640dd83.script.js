(function executeRule(current, previous /*null when async*/ ) {

    if (current.name == "standard_portfolio_construct.turn_on" && current.value == "true" && previous.value == "false") {
        // hide - Edit Weights UI action
        var gr = new GlideRecord('sys_ui_action');
        if (gr.get('0f0ad690b3043300f224a72256a8dc16')) {
            gr.setValue('active', false);
            gr.update();
        }
        gr = new GlideRecord('sys_ui_action');
        if (gr.get('70366facc7004010a6dff2327ec26068')) {
            gr.setValue('active', false);
            gr.update();
        }
        gr = new GlideRecord('sys_ui_action');
        if (gr.get('b1a13845b3642300a7d22ab716a8dca8')) {
            gr.setValue('active', false);
            gr.update();
        }
        
        // hide - Edit Metric Weights UI action
        gr = new GlideRecord('sys_ui_action');
        if (gr.get('4e223c45b3642300a7d22ab716a8dc0f')) {
            gr.setValue('active', false);
            gr.update();
        }

        // hide Taxonomy layer definitions app module
        gr = new GlideRecord('sys_app_module');
        if (gr.get('5c0c145bb3632300f224a72256a8dc2e')) {
            gr.setValue('active', false);
            gr.update();
        }
        // hide app module - Metric Definitions
        if (gr.get('8d6745c63b13230099b8832b44efc457')) {
            gr.setValue('active', false);
            gr.update();
        }
        // hide app module - Portfolio Metric
        if (gr.get('59794dc63b13230099b8832b44efc4de')) {
            gr.setValue('active', false);
            gr.update();
        }
        // hide BRs - Enforce Parent being in layer above and Enforce Portfolio Taxonomy - Node
        gr = new GlideRecord('sys_script');
        if (gr.get('178db204b3403300f224a72256a8dc23')) {
            gr.setValue('active', false);
            gr.update();
        }
        if (gr.get('f982d210b3043300f224a72256a8dc96')) {
            gr.setValue('active', false);
            gr.update();
        }
        // disable Automatically attach performance metrics BR
        if (gr.get('b8d98e49c7421010a6dff2327ec260c2')) {
            gr.setValue('active', false);
            gr.update();
        }
        // Hide BR SPM: Initiate Normalize Metric Scores
        gr = new GlideRecord('sys_script');
        if (gr.get('4f40b766372023006289cc9fbe41f135')) {
            gr.setValue('active', false);
            gr.update();
        }
        // enable Enforce node to be leaf BR
        gr = new GlideRecord('sys_script');
        if (gr.get('bd845bea7786d1500a9cb7714f5a9903')) {
            gr.setValue('active', true);
            gr.update();
        }
        // hide client script Business Services Related List
        gr = new GlideRecord('sys_script_client');
        if (gr.get('0cd66534b3843300f224a72256a8dc95')) {
            gr.setValue('active', false);
            gr.update();
        }
        // enable Toggle Business Services Related List
        if (gr.get('1b014c36774ed1500a9cb7714f5a9910')) {
            gr.setValue('active', true);
            gr.update();
        }
        // hide dictionary entry taxonomy_layer on spm_taxonomy_node table
        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'spm_taxonomy_node');
        gr.addQuery('element', 'spm_taxonomy_layer');
        gr.query();
        if (gr.next()) {
            gr.setValue('active', false);
            gr.update();
        }
        // update reference_qual for parent field of spm_taxonomy_node
        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'spm_taxonomy_node');
        gr.addQuery('element', 'parent');
        gr.query();
        if (gr.next()) {
            gr.setValue('reference_qual', "javascript:'spm_service_portfolio=' + current.spm_service_portfolio");
            gr.update();
        }

        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'spm_service_portfolio');
        gr.addQuery('element', 'auto_weight_offering_metrics');
        gr.query();
        if (gr.next()) {
            gr.setValue('active', false);
            gr.setValue('default_value', false);
            gr.update();
        }
        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'spm_service_portfolio');
        gr.addQuery('element', 'add_default_performance_metrics');
        gr.query();
        if (gr.next()) {
            gr.setValue('active', false);
            gr.setValue('default_value', false);
            gr.update();
        }
    }

})(current, previous);
