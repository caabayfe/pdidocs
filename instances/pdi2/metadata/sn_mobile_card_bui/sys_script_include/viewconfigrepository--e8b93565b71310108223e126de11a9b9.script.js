var ViewConfigRepository = Class.create();
ViewConfigRepository.prototype = {
  initialize: function() {},

  type: 'ViewConfigRepository',

  save: function(viewConfig, scope) {
    var viewConfigGR = new GlideRecord('sys_sg_view_config');

    this.setIfPresent('description', viewConfig.description, viewConfigGR);
    this.setIfPresent('template', viewConfig.template, viewConfigGR);
    this.setIfPresent('table', viewConfig.table, viewConfigGR);
    this.setIfPresent('name', viewConfig.name, viewConfigGR);
    viewConfigGR.setValue('active', true);
    this.setIfPresent('sys_scope', scope, viewConfigGR);

    viewConfigGR.insert();

    if (
      viewConfig.viewConfigElements != undefined &&
      viewConfig.viewConfigElements.length > 0
    ) {
      this.saveViewConfigElements(
        viewConfigGR.getUniqueValue(),
        viewConfig.viewConfigElements
      );
    }

    if (
      viewConfig.mobileUiRules != undefined &&
      viewConfig.mobileUiRules.length > 0
    ) {
      this.saveMobileUiRules(viewConfig.mobileUiRules);
    }

    return viewConfigGR;
  },

  deleteUnusedRecords: function(unusedRecords, table) {
    var slotsGr = new GlideRecord(table);
    /*
        Be very careful about moving logic out of this for loop.
        I elected to keep the query in here and delete record rather than do deleteMultiple
        with a check that the array exists because if you remove that check all view template slots
        will get deleted. Delete mutiple seems too dangerous to use for this.
        */
    if (unusedRecords) {
      unusedRecords.forEach(function(unusedRecordId) {
        if (slotsGr.get(unusedRecordId)) {
          slotsGr.deleteRecord();
        }
      });
    }
  },

  update: function(id, viewConfig) {
    var viewConfigGR = new GlideRecord('sys_sg_view_config');

    if (viewConfigGR.get(id)) {
      this.setIfPresent('description', viewConfig.description, viewConfigGR);
      this.setIfPresent('template', viewConfig.template, viewConfigGR);
      this.setIfPresent('table', viewConfig.table, viewConfigGR);
      this.setIfPresent('name', viewConfig.name, viewConfigGR);

      viewConfigGR.update();

      if (viewConfig.resetViewConfigElements) {
        this.resetViewConfigElements(viewConfigGR.getUniqueValue());
      }

      if (
        viewConfig.viewConfigElements != undefined &&
        viewConfig.viewConfigElements.length > 0
      ) {
        this.saveViewConfigElements(
          viewConfigGR.getUniqueValue(),
          viewConfig.viewConfigElements
        );
      }

      if (
        viewConfig.mobileUiRules != undefined &&
        viewConfig.mobileUiRules.length > 0
      ) {
        this.saveMobileUiRules(viewConfig.mobileUiRules);
      }

	  //deletes unused elements
      this.deleteUnusedRecords(
        viewConfig.elementsToDelete,
        'sys_sg_view_config_element'
      );

      //deletes unused element attributes
      this.deleteUnusedRecords(
        viewConfig.elementAttributesToDelete,
        'sys_sg_view_config_element_attribute'
      );

      //deletes unused ui rules
      if (
        viewConfig.mobileUiRulesToDelete != undefined &&
        viewConfig.mobileUiRulesToDelete.length > 0
      ) {
        this.deleteMobileUiRules(viewConfig.mobileUiRulesToDelete);
      }

      //deletes unused ui rule actions
      if (
        viewConfig.mobileUiRuleActionsToDelete != undefined &&
        viewConfig.mobileUiRuleActionsToDelete.length > 0
      ) {
        this.deleteMobileUiRuleActions(viewConfig.mobileUiRuleActionsToDelete);
      }

      return viewConfigGR;
    }

    return null;
  },

  resetViewConfigElements: function(viewConfigId) {
    var viewConfigElementsGR = new GlideRecord('sys_sg_view_config_element');
    viewConfigElementsGR.query('view_config', viewConfigId);

    while (viewConfigElementsGR.next()) {
      viewConfigElementsGR.deleteRecord();
    }
  },

  saveViewConfigElements: function(viewConfigId, elements) {
    var elementGR = new GlideRecord('sys_sg_view_config_element');
    elements.forEach(
      function(element) {
        elementGR.initialize();

        if (element.id && elementGR.get(element.id)) {
          this.setIfPresent('name', element.name, elementGR);
          this.setIfPresent(
            'view_template_slot',
            element.templateSlot,
            elementGR
          );
          this.setIfPresent('view_config', viewConfigId, elementGR);
          elementGR.update();
        } else {
          elementGR.newRecord();
          this.setIfPresent('name', element.name, elementGR);
          this.setIfPresent(
            'view_template_slot',
            element.templateSlot,
            elementGR
          );
          this.setIfPresent('view_config', viewConfigId, elementGR);
          elementGR.insert();
        }

        if (
          element.viewConfigElementAttributes != undefined &&
          element.viewConfigElementAttributes.length > 0
        ) {
          this.saveViewConfigElementAttributes(
            elementGR.getUniqueValue(),
            element.templateSlot,
            element.viewConfigElementAttributes
          );
        }
      }.bind(this)
    );
  },

  saveMobileUiRules: function(mobileUiRules) {
    var mobileUiRuleRepository = new MobileUiRuleRepository();
    mobileUiRules.forEach(function(mobileUiRule) {
      mobileUiRuleRepository.saveMobileUiRule(mobileUiRule);
    });
  },

  deleteMobileUiRules: function(mobileUiRuleSysIds) {
    var mobileUiRuleRepository = new MobileUiRuleRepository();
    mobileUiRuleSysIds.forEach(function(mobileUiRuleSysId) {
      mobileUiRuleRepository.deleteMobileUiRule(mobileUiRuleSysId);
    });
  },

  deleteMobileUiRuleActions: function(mobileUiRuleActionSysIds) {
    var mobileUiRuleRepository = new MobileUiRuleRepository();
    mobileUiRuleActionSysIds.forEach(function(mobileUiRuleActionSysId) {
      mobileUiRuleRepository.deleteMobileUiRuleAction(mobileUiRuleActionSysId);
    });
  },

  saveViewConfigElementAttributes: function(elementId, slotId, elementAtts) {
    var elementAttGR = new GlideRecord('sys_sg_view_config_element_attribute');
    elementAtts.forEach(
      function(elementAtt) {
        elementAttGR.initialize();

        if (elementAtt.id && elementAttGR.get(elementAtt.id)) {
          this.setIfPresent(
            'description',
            elementAtt.description,
            elementAttGR
          );
          this.setIfPresent('value', elementAtt.value, elementAttGR);
          this.setIfPresent(
            'translated_value',
            elementAtt.translatedValue,
            elementAttGR
          );
          this.setIfPresent(
            'name',
            this.getName(elementAtt.name),
            elementAttGR
          );
          this.setIfPresent('view_config_element', elementId, elementAttGR);
          elementAttGR.update();
        } else {
          elementAttGR.newRecord();
          this.setIfPresent(
            'description',
            elementAtt.description,
            elementAttGR
          );
          this.setIfPresent('value', elementAtt.value, elementAttGR);
          this.setIfPresent(
            'translated_value',
            elementAtt.translatedValue,
            elementAttGR
          );
          this.setIfPresent(
            'name',
            this.getName(elementAtt.name),
            elementAttGR
          );
          this.setIfPresent('view_config_element', elementId, elementAttGR);
          elementAttGR.insert();
        }
      }.bind(this)
    );
  },

  createAttachment: function(grToAttachTo, fileName, fileType, base64Data) {
    var gsa = new GlideSysAttachment();
    var attachmentSysId = gsa.writeBase64(
      grToAttachTo,
      fileName,
      fileType,
      base64Data
    );
    return attachmentSysId;
  },

  getName: function(nameAtt) {
    if (nameAtt === undefined) {
      return null;
    }
    var nameGR = new GlideRecord('sys_sg_view_element_attribute_name');
    var nameExists = false;

    if (nameAtt.id) {
      nameExists = nameGR.get(nameAtt.id);
    } else {
      nameGR.query('name', nameAtt.name);
      nameExists = nameGR.next();
    }

    if (nameExists) return nameGR.getUniqueValue();
  },

  setIfPresent: function(field, value, gr) {
    if (value !== undefined) {
      gr.setValue(field, value);
    }
  },
};
