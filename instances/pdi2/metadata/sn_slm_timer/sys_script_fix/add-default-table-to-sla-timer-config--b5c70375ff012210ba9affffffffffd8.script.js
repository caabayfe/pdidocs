var gr = new GlideRecord('sla_timer_config');
gr.addNullQuery('table_name');
gr.setWorkflow(false);
gr.setValue('table_name', 'contract_sla');
gr.updateMultiple();
