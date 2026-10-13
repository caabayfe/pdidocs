//current.update();
//action.setRedirectURL('cmdb_ci_query_based_service.do?sys_id=' +current.sys_id+'&sysparm_view=event_management_TBS');	
gs.getSession().putClientData('ts_view', 'EM');
action.setRedirectURL('cmdb_ci_query_based_service.do?sys_id=-1' +'&sysparm_view=event_management_TBS');		
