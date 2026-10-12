// The purpose of this class is to hold constants that power how duplicate works, e.g. providing exceptions to renaming of records, which descendant records to reuse.
// The data is returned directly to the frontend, and have table names pre camelCased for that purpose.

class DuplicateConfigMap {
  constructor() {
    // Not all name fields are string/text inputs, we want to hold a list of tables to exclude renaming
    this.recordsNotToRename = [
      'sysSgButtonAttribute',
      'sysSgButtonInstance',
      'sysSgFilterConditionAttribute',
      'sysSgInput',
      'sysSgInputAttribute',
      'sysSgInputChoice',
      'sysSgItemParameter',
      'sysSgItemSortingAttribute',
      'sysSgSectionAttribute',
      'sysSgUiParameter',
      'sysSgVariable',
      'sysSgVariableAttribute',
      'sysSgViewConfigElementAttribute',
      'sysSgViewConfigField',
      'sysSgParameterAction',
      'sysSgParameterActionAttribute',
      'sysSgViewTemplateSlot',
      'sysSgViewTemplateSlotAttribute',
    ];

    // Some tables don't have name fields, but there is another key that's a string/text/textarea field that MAB
    // is using as display
    this.altNameFieldMap = {
      sysSgAppletLauncherHeader: 'text',
      sysSgAppletLauncherTab: 'label',
      sysSgAppletTab: 'label',
      sysSgChartSection: 'title',
      sysSgContentSection: 'title',
      sysSgFavoritesTab: 'label',
      sysSgIconSection: 'title',
      sysSgItemSection: 'title',
      sysSgItemSortingAttribute: 'label',
      sysSgMediaSection: 'title',
      sysSgNavigationSection: 'title',
      sysSgNotificationsTab: 'label',
      sysSgSettingsTab: 'label',
      sysSgViewTemplateSlotAttribute: 'type',
    };

    // Depending on the root record being duplicated, there are certain children or descendants that should not
    // be duplicated but reused. In snake case since this powers both UI and API
    this.descendantsToReuse = {
      all: [
        'sys_sg_card_size',
        'sys_sg_input_type',
        'sys_sg_view_template',
        'sys_sg_item_sorting_attribute_name',
      ],
      sys_sg_list_screen: [
        'sys_sg_filter',
        'sys_sg_button',
        'sys_sg_list_screen',
        'sys_sg_map_screen',
        'sys_sg_calendar_screen',
        'sys_sg_custom_map_screen',
        'sys_sg_details_screen',
        'sys_sg_form_screen',
        'sys_sg_parameter_section',
      ],
      sys_sg_calendar_screen: [
        'sys_sg_filter',
        'sys_sg_button',
        'sys_sg_list_screen',
        'sys_sg_map_screen',
        'sys_sg_calendar_screen',
        'sys_sg_custom_map_screen',
        'sys_sg_details_screen',
        'sys_sg_form_screen',
        'sys_sg_parameter_section',
      ],
      sys_sg_parameter_screen: ['sys_sg_parameter_section'],
      sys_sg_filter: ['sys_sg_item_sorting_attribute_name'],
      sys_sg_chart_screen: ['sys_sg_button'],
      sys_sg_form_screen: [
        'sys_sg_button',
        'sys_sg_list_screen',
        'sys_sg_related_lists_screen',
        'sys_sg_sections_screen',
        'sys_sg_browser_screen',
        'sys_sg_parameter_section',
      ],
      sys_sg_item_stream: ['sys_sg_button', 'sys_sg_form_screen'],
      sys_sg_map_screen: [
        'sys_sg_button',
        'sys_sg_filter',
        'sys_sg_form_screen',
        'sys_sg_parameter_section',
      ],
      sys_sg_chart: ['sys_sg_button'],
      sys_sg_button: [
        'sys_sg_action_screen',
        'sys_sg_activity_stream_screen',
        'sys_sg_browser_screen',
        'sys_sg_calendar_screen',
        'sys_sg_chart_screen',
        'sys_sg_custom_map_screen',
        'sys_sg_details_screen',
        'sys_sg_form_screen',
        'sys_sg_list_screen',
        'sys_sg_map_screen',
        'sys_sg_parameter_screen',
        'sys_sg_related_lists_screen',
        'sys_sg_sections_screen',
        'sys_sg_applet_launcher',
      ],
      sys_sg_applet_launcher: [
        'sys_sg_ui_parameter',
        'sys_sg_button',
        'sys_sg_icon',
        'sys_sg_global_search',
        'sys_sg_chart',
        'sys_sg_item_stream_container',
        'sys_sg_item_stream',
        'sys_sg_view_config',
        'sys_sg_filter',
        'sys_sg_button',
        'sys_sg_list_screen',
        'sys_sg_map_screen',
        'sys_sg_calendar_screen',
        'sys_sg_custom_map_screen',
        'sys_sg_details_screen',
        'sys_sg_form_screen',
        'sys_sg_parameter_section',
        'sys_sg_data_item',
        'sys_sg_master_item',
        'sys_sg_ui_rule',
        'sys_sg_ui_rule_action',
        'sys_sg_applet_launcher',
        'sys_sg_applet_launcher_header',
        'sys_sg_button_instance',
      ],
    };

    this.parameterizedConditionBuilders = {
      sys_sg_data_item: ['query_condition', 'offline_query_condition'],
      sys_sg_relationship_data_item: [
        'query_condition',
        'offline_query_condition',
      ],
      sys_sg_write_back_action_item: ['template'],
      sys_sg_write_back_action_step: ['template'],
    };

    // These records need to have their parent M2M record duplicated
    this.recordsToDuplicateParent = [
      'sysSgFilterCondition',
      'sysSgItemSorting',
    ];

    // These fields will not be duplicated
    this.fieldsNotToDuplicate = ['creation_method'];
  }
}

module.exports = DuplicateConfigMap;
