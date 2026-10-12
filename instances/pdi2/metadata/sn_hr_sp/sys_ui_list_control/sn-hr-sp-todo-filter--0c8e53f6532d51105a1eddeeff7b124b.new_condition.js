var answer=false;
var gr = new GlideRecord("sn_hr_sp_todo_filter_m2m_category");
gr.addQuery('filter',parent.sys_id);
gr.query();
if(gr.hasNext())
	answer=true;
