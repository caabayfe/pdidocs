var gr = new GlideRecord('pwd_reset_request');
gr.addQuery('process.cred_store.type.name', 'Local ServiceNow Instance');
gr.query();
answer = gr.getRowCount();
