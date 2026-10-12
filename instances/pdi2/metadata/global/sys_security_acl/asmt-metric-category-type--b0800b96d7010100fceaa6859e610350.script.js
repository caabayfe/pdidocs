var gr = new GlideRecord('asmt_metric');
gr.addQuery("category", current.sys_id);
gr.query();

answer = !gr.hasNext();
