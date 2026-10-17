var gr = new GlideRecord('sn_aisearch_global_job_completion');
gr.query();
gr.deleteMultiple();

// Set everything back to OOTB
gr.initialize();
gr.setValue('destination_sys_id', '6ebf8fe1531201107f03ddeeff7b122b');
gr.setValue('source_sys_id', 'c861cea2c7022010099a308dc7c26041');
gr.setValue('table_name', 'sys_search_context_config');
gr.insert();

if (!current.isActionAborted()) action.setRedirectURL(current);
