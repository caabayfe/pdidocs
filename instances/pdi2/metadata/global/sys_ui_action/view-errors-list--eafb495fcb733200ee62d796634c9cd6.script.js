function openLink() {
	var url = "";
	// For GlideModalForm
	var input = window.parent.document.getElementsByName("sysparm_error_url"); 
	
	if(input && input.length > 0) {
		url = input[0].value;
	} 
	else { 
		// Default/List view - create URL from error_code
		taskGr = new GlideRecord("sa_error_handler_task");
 		taskGr.addQuery('sys_id', g_form.getUniqueValue());
		taskGr.query();	
		if (taskGr.next()) {
			var affectedServicesCond = "";
			//filter affected items only for mapping
			if (taskGr.getValue('application') == '58c8d0ef9f6232000f51b7bda42e7017') {
					affectedServicesCond = "n_affected_items>0^";
			}
			//the group_id represents teh stats, query it to get meta data query
			var statsGr = new GlideRecord("automation_error_code_stats");
 			statsGr.addQuery('sys_id', taskGr.getValue('group_id'));
 			statsGr.query();
			var encQuery;
 			if(statsGr.next()) {
				encQuery = "error_code="+statsGr.getValue("error_code");
				encQuery += buildFieldCondition("os",statsGr.os);
				encQuery += buildFieldCondition("credential",statsGr.credential);
				encQuery += buildFieldCondition("pattern",statsGr.pattern);
				encQuery += buildFieldCondition("cmdb_rule",statsGr.cmdb_rule);
				encQuery += buildFieldCondition("executable_name",statsGr.executable_name);
				url = "/automation_error_msg_list.do?sysparm_query="+affectedServicesCond+"is_ignored=false^" + encQuery + 
					"^status!=3^NQstatus=3^latest_actionISNOTEMPTY^ORlatest_action!=NULL^" + encQuery + "^ci_id.sys_idINjavascript:global.svcFindCisWithActiveErrors('" + statsGr.getValue("error_code") + "')";
			} else {
				//in case the group was not found in stats, search for the instance stats
				statsGr = new GlideRecord("automation_error_instance_code_stats");
				statsGr.addQuery('sys_id', taskGr.getValue('group_id'));
				statsGr.query();
				if (statsGr.next()) {
					encQuery = "err_error_code="+statsGr.getValue("error_code");
					encQuery += "^inst_instance_key="+statsGr.instance_key;
					encQuery += buildFieldCondition("err_os",statsGr.os);
					encQuery += buildFieldCondition("err_credential",statsGr.credential);
					encQuery += buildFieldCondition("err_pattern",statsGr.pattern);
					encQuery += buildFieldCondition("err_cmdb_rule",statsGr.cmdb_rule);
					encQuery += buildFieldCondition("err_executable_name",statsGr.executable_name);

					url = "/sn_svc_err_instance_to_msg_list.do?sysparm_query=err_is_ignored=false^" + encQuery + 
						"^err_status!=3^NQerr_status=3^err_latest_actionISNOTEMPTY^ORerr_latest_action!=NULL^" + encQuery;
				}
			}
			
		}
		
	}
	g_navigation.open(url, '_blank');
}

function buildFieldCondition(key, value) {
	if (value)
		return "^"+key+"="+value;
	else
		return "^"+key+"ISEMPTY"; 
}
