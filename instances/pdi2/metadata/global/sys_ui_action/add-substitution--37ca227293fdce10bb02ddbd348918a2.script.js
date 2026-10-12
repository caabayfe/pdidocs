var uri = action.getGlideURI();
uri.set('sysparm_m2m_ref', 'cmdb_m2m_model_substitute');
uri.set('sysparm_stack', 'no');
uri.set('sysparm_collectionID', current.sys_id);
uri.set('sysparm_collection_key', 'model');
uri.set('sysparm_collection_related_file', 'cmdb_model');
uri.set('sysparm_collection_related_field', 'substitute');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
gs.setReturn(current.getLink(true));
