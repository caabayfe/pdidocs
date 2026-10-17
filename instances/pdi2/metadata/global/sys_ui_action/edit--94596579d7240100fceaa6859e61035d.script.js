var uri = action.getGlideURI();
var path = uri.getFileFromPath();

uri.set('sysparm_m2m_ref', 'asmt_m2m_stakeholder');
uri.set('sysparm_stack', 'no');

// Filter the slush bucket based on the metric_type (Vendor or Groups) in the metric_category table
var category_user_sys_id = uri.get('sysparm_collectionID');
var category_user_table = 'asmt_m2m_category_user';
var category_user_record = new GlideRecord(category_user_table);

if (category_user_sys_id && category_user_record.get(category_user_sys_id))
	uri.set('sysparm_query', 'metric_type=' + category_user_record.metric_category.metric_type);

action.setRedirectURL(uri.toString('sys_m2m_template.do'));
