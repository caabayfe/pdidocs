var gr = new GlideRecord('sys_document_viewer_status');
gr.addQuery('should_cleanup', false); 
gr.setValue('should_cleanup', true);
gr.updateMultiple();
