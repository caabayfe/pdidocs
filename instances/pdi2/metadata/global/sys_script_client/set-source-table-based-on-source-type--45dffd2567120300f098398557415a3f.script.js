function onChange(control, oldValue, newValue, isLoading, isTemplate) {
      if (isLoading || newValue === '') {
        return;
      }

    if (newValue == "0")
        g_form.setValue("source_table", "sys_script");
    else if (newValue == "1")
        g_form.setValue("source_table", "sys_ui_action");
    else if (newValue == "2")
        g_form.setValue("source_table", "sys_script_include");
    else if (newValue == "3")
        g_form.setValue("source_table", "sysauto_script");
    else if (newValue == "4")
        g_form.setValue("source_table", "wf_activity");
    else if (newValue == "6")
        g_form.setValue("source_table", "sp_widget");
    else if (newValue == "7")
        g_form.setValue("source_table", "sys_ui_macro");
    else if (newValue == "8")
        g_form.setValue("source_table", "wf_element_activity");
    else if (newValue == "9")
        g_form.setValue("source_table", "sys_ui_title");
    else if (newValue == "11")
        g_form.setValue("source_table", "sys_security_acl");
    else if (newValue == "13")
        g_form.setValue("source_table", "sysevent_in_email_action");
    else if (newValue == "14")
        g_form.setValue("source_table", "sc_cat_item_producer");
    else if (newValue == "15")
        g_form.setValue("source_table", "sys_ui_page");
    else if (newValue == "16")
        g_form.setValue("source_table", "sys_hub_action_type_definition");
    else if (newValue == "17")
        g_form.setValue("source_table", "sys_hub_flow");
    else if (newValue == "18")
        g_form.setValue("source_table", "sys_relationship");
    else if (newValue == "20")
		g_form.setValue("source_table", "sys_ux_screen_condition");
    else if (newValue == "21")
		g_form.setValue("source_table", "sys_db_object");
    else if (newValue == "22")
		g_form.setValue("source_table", "sys_ws_operation");
	else if (newValue == "23")
		g_form.setValue("source_table", "sysevent_email_action");
	else if (newValue == "24")
	    g_form.setValue("source_table", "sys_data_policy2");
	else if (newValue == "26")
	    g_form.setValue("source_table", "awa_work_item_sizing");
    else if (newValue == "27")
	    g_form.setValue("source_table", "sys_ui_policy");
    else if (newValue == "29")
	    g_form.setValue("source_table", "sys_declarative_action_assignment");
    else if (newValue == "30")
	    g_form.setValue("source_table", "sys_script_email");
    else if (newValue == "31")
	    g_form.setValue("source_table", "sys_email_client_template");
    else if (newValue == "32")
	    g_form.setValue("source_table", "sys_ux_data_broker_transform");
   else if (newValue == "33")
	    g_form.setValue("source_table", "sn_aia_tool");
    else
        g_form.setValue("source_table", "");
    }
