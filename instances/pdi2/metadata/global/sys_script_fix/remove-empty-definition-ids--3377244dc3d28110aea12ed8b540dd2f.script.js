var gr = new GlideRecord('usageanalytics_count_cfg');
gr.addEncodedQuery('definition_idISEMPTY');
gr.addQuery('count_type','Licensing');
gr.setWorkflow(false);
gr.deleteMultiple(); 
