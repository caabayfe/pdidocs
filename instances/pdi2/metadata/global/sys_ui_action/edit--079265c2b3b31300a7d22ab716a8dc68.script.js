var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');
uri.set('sysparm_collection_related_field', 'sc_cat_item');
uri.set('sysparm_form_type', 'm2m');
uri.set('sysparm_collection_relationship', '');
uri.set('sysparm_collection_key', 'service_offering');
//DEF0098441: Adding query to show only supported catalog item categories to avoid user errors.
uri.set('sysparm_query', 'sys_class_nameINsc_cat_item,pc_product_cat_item,pc_hardware_cat_item,pc_software_cat_item');
uri.set('sysparm_collection_related_file', 'sc_cat_item');
uri.set('jvar_no_filter', 'true');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
