var gr = new GlideRecord("sys_script");
gr.get(current.business_rule);
gr.deleteRecord();
