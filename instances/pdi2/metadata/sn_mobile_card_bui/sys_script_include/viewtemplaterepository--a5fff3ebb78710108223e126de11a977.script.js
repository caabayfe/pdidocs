var ViewTemplateRepository = Class.create();
ViewTemplateRepository.prototype = {
  initialize: function() {},

  type: 'ViewTemplateRepository',

  setIfPresent: function(field, value, gr) {
    if (value) {
      gr.setValue(field, value);
    }
  },

  update: function(id, template) {
    var templateViewGR = new GlideRecord('sys_sg_view_template');

    if (templateViewGR.get(id)) {
      this.setIfPresent('name', template.name, templateViewGR);
      this.setIfPresent('description', template.description, templateViewGR);
      this.setIfPresent('template_json', template.jsonTemplate, templateViewGR);

      templateViewGR.update();

      //deletes unused slots
      this.deleteUnusedRecords(
        template.slotsToDelete,
        'sys_sg_view_template_slot'
      );
      //deletes unused slot attributes
      this.deleteUnusedRecords(
        template.slotAttributesToDelete,
        'sys_sg_view_template_slot_attribute'
      );

      // Save template slots & template slot attributes
      if (
        template.templateSlots != undefined &&
        template.templateSlots.length > 0
      ) {
        this.saveTemplateSlots(
          templateViewGR.getValue('sys_id'),
          template.templateSlots
        );
      }

      return templateViewGR;
    }

    return {};
  },

  save: function(template, scope) {
    var templateViewGR = new GlideRecord('sys_sg_view_template');
    templateViewGR.setValue('name', template.name);
    templateViewGR.setValue('description', template.description);
    templateViewGR.setValue('template_json', template.jsonTemplate);
    templateViewGR.setValue('active', true);
    this.setIfPresent('sys_scope', scope, templateViewGR);

    templateViewGR.insert();

    if (
      template.templateSlots != undefined &&
      template.templateSlots.length > 0
    ) {
      this.saveTemplateSlots(
        templateViewGR.getValue('sys_id'),
        template.templateSlots,
        scope
      );
    }

    return templateViewGR;
  },

  saveTemplateSlots: function(templateId, slots, scope) {
    var gr = new GlideRecord('sys_sg_view_template_slot');
    slots.forEach(
      function(slot, index) {
        if (slot.id) {
          if (gr.get(slot.id)) {
            this.setIfPresent('type', slot.type, gr);
            this.setIfPresent('name', slot.name, gr);
            this.setIfPresent('view_template', templateId, gr);
            gr.update();
          }
        } else {
          gr.newRecord();
          gr.setValue('type', slot.type);
          gr.setValue('name', slot.name);
          gr.setValue('view_template', templateId);
          this.setIfPresent('sys_scope', scope, gr);
          gr.insert();
        }

        if (
          slot.templateSlotAttributes != undefined &&
          slot.templateSlotAttributes.length > 0
        ) {
          this.saveTemplateSlotAttributes(
            gr.getUniqueValue(),
            slot.name,
            slot.templateSlotAttributes,
            scope
          );
        }
      }.bind(this)
    );
  },

  saveTemplateSlotAttributes: function(slotId, slotName, slotAtts, scope) {
    var templateSlotAttributeGR = new GlideRecord(
      'sys_sg_view_template_slot_attribute'
    );

    slotAtts.forEach(
      function(slotAtt, index) {
        if (slotAtt.attributeName != undefined) {
          var attNameId;
          if (slotAtt.attributeName.id) {
            attNameId = slotAtt.attributeName.id;
          } else {
            var nameGR = new GlideRecord('sys_sg_view_element_attribute_name');
            nameGR.query('name', slotAtt.attributeName.name);
            if (!nameGR.next()) {
              attNameId = '';
            } else {
              attNameId = nameGR.getUniqueValue();
            }
          }
        }

        if (slotAtt.id) {
          // Existing template slot attribute
          if (templateSlotAttributeGR.get(slotAtt.id)) {
            templateSlotAttributeGR.setValue('name', attNameId);
            templateSlotAttributeGR.setValue(
              'description',
              slotAtt.description,
              templateSlotAttributeGR
            );
            templateSlotAttributeGR.setValue(
              'value',
              slotAtt.value,
              templateSlotAttributeGR
            );
            templateSlotAttributeGR.setValue(
              'translated_value',
              slotAtt.translatedValue,
              templateSlotAttributeGR
            );
            this.setIfPresent(
              'view_template_slot',
              slotId,
              templateSlotAttributeGR
            );
            templateSlotAttributeGR.update();
          }
        } else {
          // Existing template slot attribute
          templateSlotAttributeGR.newRecord();
          templateSlotAttributeGR.setValue('name', attNameId);
          templateSlotAttributeGR.setValue('description', slotAtt.description);
          templateSlotAttributeGR.setValue('value', slotAtt.value);
          templateSlotAttributeGR.setValue(
            'translated_value',
            slotAtt.translatedValue
          );
          templateSlotAttributeGR.setValue('view_template_slot', slotId);
          this.setIfPresent('sys_scope', scope, templateSlotAttributeGR);
          templateSlotAttributeGR.insert();
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
};
