var gr = new GlideRecord('metric_definition');
gr.addQuery('table', table_name);
gr.addActiveQuery();
gr.query(); 
answer = gr.hasNext();
