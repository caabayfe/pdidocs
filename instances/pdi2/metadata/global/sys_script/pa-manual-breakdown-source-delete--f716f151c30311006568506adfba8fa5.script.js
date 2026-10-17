var gr = new GlideRecord('pa_dimensions');
gr.addQuery('manual_breakdown', current.sys_id);
gr.deleteMultiple();
