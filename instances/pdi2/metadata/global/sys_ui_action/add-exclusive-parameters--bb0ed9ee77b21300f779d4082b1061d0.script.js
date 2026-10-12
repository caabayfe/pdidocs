var uri = action.getGlideURI();
var path = "sys_atf_parameter_variable.do";
uri.set('sys_target','sys_atf_parameter_variable');
uri.set('sysparm_collection_key','model');
uri.set('sysparm_collection_relationship','');
uri.set('sysparm_collection_label','Parameters+Variables');
uri.set('sys_id', '-1');
action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
