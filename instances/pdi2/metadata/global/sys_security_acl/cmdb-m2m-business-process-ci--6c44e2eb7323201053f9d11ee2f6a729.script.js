var gr = new GlideRecord('cmdb_ci_business_process');
gr.get(current.business_process);
answer = new global.BusinessProcessUtils().canAccess(gr);
