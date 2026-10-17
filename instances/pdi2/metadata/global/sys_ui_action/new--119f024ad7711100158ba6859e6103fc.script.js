var uri = action.getGlideURI();
var collectionId = uri.get('sysparm_collectionID');

var gr = new GlideRecord('asmt_metric_category');
gr.addQuery('metric_type', collectionId);
gr.query();
if (gr.next())
	gs.setRedirect("asmt_m2m_category_user.do?sys_id=-1&sysparm_view=survey&sysparm_query=metric_category=" + gr.sys_id);
else
	gs.setRedirect("asmt_m2m_category_user.do?sys_id=-1");
