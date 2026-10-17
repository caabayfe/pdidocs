/*
This is a set of constant formats for formatting objects
formatName: {
    tableName: {
      FieldName: {
        isExcluded: [boolean], // includes or excludes field
        returnName: [boolean], // changes the name of the field returned
        returnType: [type], // changes the type of the returned field
        defaultValue: [string], // overrides the values of the returning field
      },
      ...
*/

class McbResultFormats {
  constructor() {}
  
  /**
   * Formatting used to construct card payloads
   */
  static viewConfigFormat = {
    sys_sg_view_template: {
      sys_id: {
        returnName: 'id',
      },
      template_json: {
        returnName: 'jsonTemplate',
      },
      sys_created_by: {
        returnName: 'createdBy',
      },
      active: {
        returnType: 'boolean',
      },
      description: {
        defaultValue: null,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
    },
    sys_sg_view_template_slot: {
      sys_id: {
        returnName: 'id',
      },
      sys_policy: {
        isExcluded: true,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      view_template: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_template_slot_attribute: {
      sys_id: {
        returnName: 'id',
      },
      translatedValue: {
        defaultValue: null,
      },
      translated_value: {
        returnName: 'translatedValue',
      },
      description: {
        defaultValue: null,
      },
      icon: {
        defaultValue: null,
      },
      name: {
        returnName: 'attributeName',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      view_template_slot: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_element_attribute_name: {
      sys_id: {
        returnName: 'id',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
      sys_policy: {
        isExcluded: true,
      },
    },
    sys_sg_view_config: {
      active: {
        returnType: 'boolean',
      },
      sys_id: {
        returnName: 'id',
      },
      sys_scope: {
        returnName: 'scope',
      },
      advanced: {
        isExcluded: true,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_config_element: {
      sys_id: {
        returnName: 'id',
      },
      view_template_slot: {
        returnName: 'templateSlot',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      view_config: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_config_element_attribute: {
      sys_id: {
        returnName: 'id',
      },
      name: {
        returnDisplayValue: true,
      },
      description: {
        defaultValue: null,
      },
      translatedValue: {
        defaultValue: null,
      },
      translated_value: {
        returnName: 'translatedValue',
      },
      icon: {
        defaultValue: null,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      view_config_element: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_ui_rule: {
      sys_id: {
        returnName: 'id',
      },
      sys_scope: {
        returnName: 'scope',
      },
      parent_table: {
        returnName: 'parentTable',
      },
      parent_id: {
        returnName: 'parentId',
      },
      reverse_if_false: {
        returnName: 'reverseIfFalse',
        returnType: 'boolean',
      },
      active: {
        returnType: 'boolean',
      },
      condition: {
        defaultValue: null,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_ui_rule_action: {
      sys_id: {
        returnName: 'id',
      },
      ui_rule: {
        returnName: 'mobileUiRule',
      },
      sys_scope: {
        returnName: 'scope',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
  };

  /**
   * Formatting used to construct template payloads
   */
  static viewTemplateFormat = {
    sys_sg_view_template: {
      sys_id: {
        returnName: 'id',
      },
      template_json: {
        returnName: 'jsonTemplate',
      },
      sys_created_by: {
        returnName: 'createdBy',
      },
      active: {
        returnType: 'boolean',
      },
      sys_scope: {
        returnName: 'scope',
      },
      sys_policy: {
        returnName: 'protectionPolicy',
      },
      sys_name: {
        isExcluded: true,
      },
      description: {
        defaultValue: null,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
    },
    sys_sg_view_template_slot: {
      sys_id: {
        returnName: 'id',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      view_template: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_template_slot_attribute: {
      sys_id: {
        returnName: 'id',
      },
      translated_value: {
        returnName: 'translatedValue',
      },
      translatedValue: {
        defaultValue: null,
      },
      description: {
        defaultValue: null,
      },
      icon: {
        defaultValue: null,
      },
      name: {
        returnName: 'attributeName',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      view_template_slot: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_element_attribute_name: {
      sys_id: {
        returnName: 'id',
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
      sys_policy: {
        isExcluded: true,
      },
    },
    sys_sg_view_config: {
      sys_id: {
        returnName: 'id',
      },
      template: {
        isExcluded: true,
      },
      description: {
        isExcluded: true,
      },
      name: {
        isExcluded: true,
      },
      table: {
        isExcluded: true,
      },
      active: {
        isExcluded: true,
      },
      advanced: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
    sys_sg_view_config_element: {
      sys_id: {
        returnName: 'id',
      },
      view_template_slot: {
        isExcluded: true,
      },
      sys_mod_count: {
        isExcluded: true,
      },
      sys_updated_on: {
        isExcluded: true,
      },
      sys_class_name: {
        isExcluded: true,
      },
      sys_package: {
        isExcluded: true,
      },
      sys_update_name: {
        isExcluded: true,
      },
      sys_updated_by: {
        isExcluded: true,
      },
      sys_created_on: {
        isExcluded: true,
      },
      view_config: {
        isExcluded: true,
      },
      sys_name: {
        isExcluded: true,
      },
      sys_scope: {
        isExcluded: true,
      },
      sys_created_by: {
        isExcluded: true,
      },
    },
  };
}

module.exports = McbResultFormats;
