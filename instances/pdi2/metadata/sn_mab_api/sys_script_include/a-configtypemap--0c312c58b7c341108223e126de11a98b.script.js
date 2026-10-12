class A_ConfigTypeMap {
  constructor() {
    this.typeMap = {
      // screens
      sys_sg_applet_launcher: 'Launcher screen',
      sys_sg_list_screen: 'List screen',
      sys_sg_form_screen: 'Record screen',
      sys_sg_browser_screen: 'Mobile web screen',
      sys_sg_parameter_screen: 'Input form screen',
      sys_sg_map_screen: 'Map screen',
      sys_sg_calendar_screen: 'Calendar screen',
      sys_sg_chart_screen: 'Chart screen',
      // Icons and Cards
      sys_sg_view_config: 'Card',
      sys_sg_view_template: 'Card template',
      sys_sg_item_view: 'Legacy card',
      sys_sg_icon: 'Icon',
      // Data Items and Relationship Data Items
      sys_sg_data_item: 'Data item',
      sys_sg_relationship_data_item: 'Relationship data item',
    };
    this.hideFromContentTreeNodes = [
      'sys_sg_input_type',
      'sys_sg_item_sorting_attribute_name',
      'sys_sg_view_config_element',
      'sys_sg_view_config_element_attribute',
      'sys_sg_view_template_slot',
      'sys_sg_view_template_slot_attribute'
    ];
  }
}

module.exports = A_ConfigTypeMap;
