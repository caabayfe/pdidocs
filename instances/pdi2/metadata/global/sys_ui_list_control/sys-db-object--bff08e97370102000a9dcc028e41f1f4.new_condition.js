var gr = new GlideRecord('cmdb_identifier');
gr.addQuery('applies_to', parent.name);
gr.query();
answer = gr.getRowCount() > 0;
