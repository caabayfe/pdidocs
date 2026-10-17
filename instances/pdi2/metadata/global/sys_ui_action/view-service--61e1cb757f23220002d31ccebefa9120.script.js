runUIAction();

function runUIAction() {
		
   var serviceSysClassName = current.sys_class_name;
   var serviceSysId = current.sys_id;
   var serviceName = current.name;
	
	if (!(serviceSysClassName)) { //used when it's opened from a database view
		serviceSysClassName = current.service_sys_class_name;
		serviceSysId = current.service_sys_id;	
		serviceName = current.service_name;	
	}
 	
	if (serviceSysClassName == 'cmdb_ci_query_based_service'){
		action.setRedirectURL('$sa_qbs_view.do?sysparm_bsid=' + serviceSysId + 
						  '&sysparm_bsname=' + serviceName +
						  '&sysparam_back_ref=service_auto_table' +
						  '&sysparm_plugin_mode=assurance ');		
		return;
	}
	
	if (serviceSysClassName == 'cmdb_ci_alert_group'){
		var alertGroupFilter;
		var gr = new GlideRecord('cmdb_ci_alert_group');
		  gr.query("sys_id",current.sys_id);
		  if (gr.next()) {
			alertGroupFilter = gr.filter;
		}
		action.setRedirectURL('$sa_alerts_console_view.do?sysparm_bsid=' + serviceSysId + 
						  '&sysparm_bsname=' + serviceName +
						  '&sysparam_back_ref=service_auto_table' +
						  '&sysparm_disable_user_query=1&sysparm_fixed_query='+alertGroupFilter+' ');
		return;
	}
	
	if (serviceSysClassName == 'cmdb_ci_service_manual'){
		action.setRedirectURL('$sa_manual_bs_map.do?sysparm_bsid=' + serviceSysId + 
						  '&sysparm_bsname=' + serviceName +
						  '&sysparam_back_ref=service_auto_table' +
						  '&sysparm_plugin_mode=assurance ');
		return;
	}
	
	//it's a discovered service
	//Make sure service has EP
	var gr = new GlideRecord('sa_m2m_service_entry_point');
   gr.addQuery('cmdb_ci_service', serviceSysId);
   gr.query();
   if (!gr.next()) {
      // No EP
	   gs.addInfoMessage(gs.getMessage("No map available, please add an entry point" ));
	   return;      
   }
	current.update();
	// show Business Service Map
	action.setReturnURL(current);
	
	action.setRedirectURL('$sw_topology_map.do?sysparm_bsid=' + serviceSysId + 
						  '&sysparm_bsname=' + serviceName +
						  '&sysparam_back_ref=service_auto_table' +
						  '&sysparm_plugin_mode=assurance ');
}
