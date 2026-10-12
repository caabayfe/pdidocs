(function (engine) {

    var tableColumnsMap = {"sys_trigger" : ["script", "job_context"],
						"kb_navons" : ["script"],
						"sys_ui_style" : ["value"],
						"sysevent_in_email_action" : ["condition_script"],
						"par_coreui_migration_script" : ["script"],
						"gs_entitlement_plugin_mapping" : ["condition_script"],
						"sys_jelly_file" : ["script"],
						"sysrule_assignment" : ["script"],
						"sys_filter_option_dynamic" : ["script"],
						"ecc_agent_script_file" : ["script"],
						"expert_panel_redirect" : ["script"],
						"sys_transform_entry" : ["source_script"],
						"discovery_probe_parameter" : ["value_script"],
						"cmn_notif_service_provider" : ["construction_script", "script"],
						"sc_cat_item_delivery_plan" : ["script"],
						"ecc_queue_config" : ["notify_script"],
						"sys_wizard_answer" : ["script"],
						"sysevent_script_action" : ["condition_script"],
						"sys_impex_map" : ["condition_script"],
						"ecc_event_handler" : ["script"],
						"sysrule_approvals" : ["script"],
						"sys_declarative_action_assignment" : ["script_condition", "scripted_client_condition", "dynamic_script_condition"],
						"sys_sg_button" : ["condition_script", "offline_condition_script"],
						"sys_app_payload_unloader_rule" : ["script_condition"],
						"sysevent_email_template" : ["message"],
						"sn_cloud_discovery_retry_configuration" : ["script"],
						"sn_cmp_pol_rule" : ["condition_script"],
						"sn_cmp_pol_action_type" : ["action_script"],
						"sn_cmp_pol_condition_type" : ["condition_script", "condition_invocation_script"],
						"discovery_classifier_probe" : ["condition_script"],
						"sn_cmp_pol_condition" : ["script"],
						"sn_cmp_rb_resourcescript" : ["script"],
						"sn_cmp_cloud_event_handler" : ["run_handler_script"],
						"sn_capi_response_processor" : ["script"],
						"web_service_launcher_lookup" : ["launch_script"],
						"task_rel_type" : ["child_script", "parent_script"],
						"task_rel_allowed" : ["child_script"]
						};

	var search_regex = /\s*\.Encrypter\s*/;
	var code_comments_regex = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;
	var ISNOTEMPTY_LITERAL = "ISNOTEMPTY";
	var OR_QUERY_LITERAL = "^OR";

	for(var table in tableColumnsMap) {
		var columns = tableColumnsMap[table];
		var gr = new GlideRecord(table);
		if(!gr.isValid())
			continue;

		var query = "";
		for(var column in columns) {
			if(!gr.isValidField(columns[column]))
				continue;
			query += columns[column] + ISNOTEMPTY_LITERAL;
			if(column < columns.length - 1)
				query += OR_QUERY_LITERAL;
		}
		gr.addEncodedQuery(query);
		gr.query();

		while(gr.next()) {
			for(var i in columns) {
				var columnValue = gr.getValue(columns[i]);
				if (!search_regex.test(columnValue))
					continue;

				//remove code comments
				var commentsRemovedValue = columnValue.replace(code_comments_regex, '');

				//raise finding if no comments found or usage found in commentsRemovedValue
				if (commentsRemovedValue.length == columnValue.length || search_regex.test(commentsRemovedValue)) {
					engine.finding.setCurrentSource(gr);
					engine.finding.increment();
				}
			}
		}
	}

    var flowTables = ["sys_hub_flow_logic_instance_v2", "sys_hub_action_instance_v2"];
	for (i in flowTables) {
		var gFlow = new GlideRecord(flowTables[i]);
		if (!gFlow.isValid())
		    continue;
		gFlow.query();
		while (gFlow.next()) {
			if (JSUtil.nil(gFlow.getValue("values"))) continue;
			var deCompressValue = GlideCompressionUtil.expandToString(GlideStringUtil.base64DecodeAsBytes(gFlow.getValue("values")));
			if (!search_regex.test(deCompressValue))
				continue;
			engine.finding.setCurrentSource(gFlow);
			engine.finding.increment();
		}
	}

})(engine);
