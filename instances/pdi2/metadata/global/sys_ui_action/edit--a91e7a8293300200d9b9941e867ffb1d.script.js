var tables = GlideDBObjectManager.get().getAllExtensions(parent.basic_apply_to.toString());
var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');
uri.set('sysparm_query', 'nameIN' + GlideStringUtil.join(tables) + '^sys_scope!=' + parent.sys_scope.toString());
uri.set('jvar_no_filter', 'true');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
