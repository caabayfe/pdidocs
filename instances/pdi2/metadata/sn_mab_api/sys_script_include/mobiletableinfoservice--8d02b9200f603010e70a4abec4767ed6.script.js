class MobileTableInfoService {
  constructor() {
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.validationHandler = new sn_mab_api.ValidationHandler();
    this.commonExcludedTables = [
      'sys_sg_action_screen',
      'sys_sg_filter_condition_attribute_name',
      'sys_sg_filter_condition_type',
      'sys_sg_function',
      'sys_sg_incremental_offline_exclusion_list',
      'sys_sg_incremental_result',
      'sys_sg_input_attribute',
      'sys_sg_input_choice',
      'sys_sg_input_type',
      'sys_sg_mock_json_response',
      'sys_sg_offline_download_schedule',
      'sys_sg_offline_result',
      'sys_sg_offline_result_m2m_mobile_responder',
      'sys_sg_redirect_dest_field',
      'sys_sg_request_log',
      'sys_sg_search_screen',
      'sys_sg_screen_field',
      'sys_sg_theme_style',
      'sys_sg_ui_rule_operation',
      'sys_sg_ui_rule_trigger',
      'sys_sg_variable_attribute',
      'sys_sg_view_element_attribute_name',
      'sys_sg_button_chat_launcher',
      'sys_sg_ui_element',
      'sys_sg_screen_m2m_ui_element',
      'sys_sg_source_ui_elements_mappings',
      'sys_sg_push_action_instance',
      'sys_sg_push_parameter_value',
      'sys_sg_push_action_category',
      'sys_sg_input_variable_param_map',
      'sys_sg_view_config_field',
      'sys_sg_section_attribute',
      'sys_sg_client_theme',
      'sys_sg_parameter_action_attribute',
      'sys_sg_descriptive_element_attribute',
    ];
    this.whiteListedTables = [
      'sys_push_application',
      'sys_certificate',
      'sysevent_email_action',
    ];
  }

  getSentenceCaseLabel(displayValue) {
    return displayValue.charAt(0) + displayValue.substring(1).toLowerCase();
  }

  // This was previously versioned based on family, but we have not versioned them in many releases
  getExcludedTables() {
    return this.commonExcludedTables;
  }

  getMobileTableNamesAndLabels() {
    var result = [];
    /* we use glideRecord rather then glideRecordSecure
     ** because we want to provide the list of all tables w/o
     ** restricting the list of tables based on user ACLs
     */
    var gr = new GlideRecord('sys_db_object');
    var excludedTables = this.getExcludedTables();
    gr.addQuery('name', 'STARTSWITH', 'sys_sg_').addOrCondition(
      'name',
      'IN',
      this.whiteListedTables
    );
    gr.addQuery('name', 'NOT IN', excludedTables);
    // for sys_db_object, if the column doesn't have a name or has an element then it is not a table we want to return
    gr.addNullQuery('element');
    gr.addNotNullQuery('name');
    gr.orderBy('label');
    gr.query();

    while (gr.next()) {
      var tableInfo = {
        label: this.getSentenceCaseLabel(gr.getDisplayValue()),
        value: gr.getValue('name'),
      };
      result.push(tableInfo);
    }

    return result;
  }
}

module.exports = MobileTableInfoService;
