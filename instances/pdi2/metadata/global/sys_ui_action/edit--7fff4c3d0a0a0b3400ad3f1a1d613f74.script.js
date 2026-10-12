var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_collection_related_file', current.getTableName());
uri.set('sysparm_form_type', 'o2m');
uri.set('sysparm_stack', 'no');
uri.set('sysparm_query', '');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
