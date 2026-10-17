var gr = new GlideRecord('pa_dashboards_permissions');
gr.get(current.sys_id);
answer = !gr.isValid();
