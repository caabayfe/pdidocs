action.setRedirectURL('/sys_pd_trigger_instance.do?sys_id=' + current.getUniqueValue() + '&sysparm_view=process_conditions&sysparm_view_forced=true');
current.update();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postUpdate(current);
