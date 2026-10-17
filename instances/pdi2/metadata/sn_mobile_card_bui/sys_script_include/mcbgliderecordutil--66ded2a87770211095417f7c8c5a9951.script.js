var McbGlideRecordUtil = Class.create();
McbGlideRecordUtil.prototype = {
  /*
   * MCB UI Rules payload generator
   *
   * INPUT:
   * parentId: String: id of a parent record (sys_sg_view_config in the case of MCB)
   *
   * RETURN:
   * [{}]: a set of ui rules template
   */
  initialize: function (format) {
    this.formatter = new sn_mobile_card_bui.McbResultFormatter(format);
  },

  /*
   * Get a list of all the elements in the given GlideRecord.
   *
   * INPUT
   * gr: the GlideRecord instance, positioned to a valid record
   *
   * RETURN
   * [field_names]: an array with the field names in the given GlideRecord
   */
  _getElements: function (gr) {
    var elements = gr.getElements(); // returns a Java ArrayList
    var fields = [];

    // Why we manually add sys_id,
    // because GlideRecord.getElements() excludes it
    fields.push("sys_id");

    if (typeof elements.size != "undefined") {
      //we are in global scope, so iterate

      for (var i = 0; i < ge.size(); i++) {
        var element = elements.get(i);
        fields.push(element.getName());
      }
    } else {
      //we are in scope, so loop over the array

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        fields.push(element.getName());
      }
    }

    return fields;
  },

  /*
   * Populate the given hashmap from a single GlideRecord.
   * Each element in the GlideRecord becomes a property
   * in the hashmap.
   *
   * Field data returned will be formatted using the formatter
   * provided on McbGlideRecordUtil class construction.
   *
   * INPUT
   * gr: a GlideRecord instance, positioned to a valid record
   * table: name of the table the gr is associated with
   *
   * RETURN
   * {field:value,...}: the hash of the glide record fields:values
   */
  _hashMapFromGR: function (gr, table) {
    var hashmap = this.formatter.formattedDefaultHashmap(table);

    var elements = this._getElements(gr);

    for (var i = 0; i < elements.length; i++) {
      var field = {
        name: elements[i],
        value: gr.getValue(elements[i]),
      };

      if (!field.value) {
        continue;
      } else {
        field.value = field.value.toString();
      }

      var useDisplayValue = this.formatter.shouldFormatWithDisplayValue(
        field.name,
        table
      );

      if (useDisplayValue) {
        field.value = gr.getDisplayValue(elements[i]);
      }

      field = this.formatter.formatField(field, table);

      if (field) hashmap[field.name] = field.value;
    }

    return hashmap;
  },

  /*
   * Populate an array of hashmaps from the given GlideRecords.
   * Each each glide record becomes a hashmap in the array.
   *
   * INPUT:
   * gr: a GlideRecord instance, positioned to a valid record
   * table: name of the table the gr is associated with
   *
   * RETURN:
   * [{field:value,...}]: An array of hashmaps from generated from the gr iteration
   */
  _hashMapsFromGR: function (gr, table) {
    var hashMaps = [];

    while (gr.next()) {
      var hashMap = this._hashMapFromGR(gr, table);
      hashMaps.push(hashMap);
    }

    return hashMaps;
  },

  /*
   * A generic gr query lookup to hashmap converter
   *
   * INPUT:
   * table: String: name of the table with the record to look up
   * field: String: name of the field to query the queryValue on
   * queryValue: String: value to query the field for the table
   *
   * RETURN:
   * [{field:value,...},...]: A set of hashmaps from a glide record query
   */
  mapsFromGrQuery: function (table, field, queryValue) {
    if (!queryValue) return [];

    var gr = new GlideRecordSecure(table);
    gr.query(field, queryValue);
    gr.query();

    return this._hashMapsFromGR(gr, table);
  },

  /*
   * MCB card payload generator
   *
   * INPUT:
   * sysId: String: sysId of a single sys_sg_view_config record
   *
   * RETURN:
   * {}: payload of a card
   */
  getCard: function (sysId) {
    // guard
    if (!sysId) return {};

    // card
    var viewConfigHM = this.mapsFromGrQuery(
      "sys_sg_view_config",
      "sys_id",
      sysId
    )[0];

    // card.elements
    var viewConfigElementHMs = this.mapsFromGrQuery(
      "sys_sg_view_config_element",
      "view_config",
      sysId
    );

    for (var i = 0; i < viewConfigElementHMs.length; i++) {
      // card.element.templateSlot;
      var viewConfigElementTemplateSlotFieldName =
        this.formatter.getReplacedFieldName(
          "sys_sg_view_config_element",
          "view_template_slot"
        );

      var templateSlotHM = this.mapsFromGrQuery(
        "sys_sg_view_template_slot",
        "sys_id",
        viewConfigElementHMs[i][viewConfigElementTemplateSlotFieldName]
      )[0];

      viewConfigElementHMs[i][viewConfigElementTemplateSlotFieldName] =
        templateSlotHM;

      // card.element.attributes
      var viewConfigElementIdFieldName = "sys_id";
      viewConfigElementIdFieldName = this.formatter.getReplacedFieldName(
        "sys_sg_view_config_element_attribute",
        viewConfigElementIdFieldName
      );

      var viewConfigElementAttributeHMs = this.mapsFromGrQuery(
        "sys_sg_view_config_element_attribute",
        "view_config_element",
        viewConfigElementHMs[i][viewConfigElementIdFieldName]
      );

      viewConfigElementHMs[i]["viewConfigElementAttribute"] =
        viewConfigElementAttributeHMs;
    }

    viewConfigHM["viewConfigElements"] = viewConfigElementHMs;
    var cardTable = viewConfigHM["table"];
    if (cardTable) {
        var tableDisplayName = new GlideRecord(cardTable).getLabel();
        viewConfigHM["tableLabel"] = tableDisplayName;
    }
    return viewConfigHM;
  },

  /*
   * MCB template payload generator
   *
   * INPUT:
   * sysId: String: sysId of a single sys_sg_view_template record
   * isCardDataIncluded: Bool: includes view config and view config element data if true
   *
   * RETURN:
   * {}: payload of a template
   */
  getTemplate: function (sysId, isCardDataIncluded) {
    // guard
    if (!sysId) return [];

    isCardDataIncluded =
      typeof isCardDataIncluded !== "undefined" ? isCardDataIncluded : true;

    // template
    var templateHM = this.mapsFromGrQuery(
      "sys_sg_view_template",
      "sys_id",
      sysId
    )[0];

	// This handles the case of the DD not having permission for
	// the template but does have permission on the card,
	if (!templateHM) return { jsonTemplate: "" };

    // template.viewConfigs
    if (isCardDataIncluded) {
      var viewConfigsHM = this.mapsFromGrQuery(
        "sys_sg_view_config",
        "template",
        sysId
      );
      templateHM["viewConfigs"] = viewConfigsHM;
    }

    // template.slots
    var templateSlotHMs = this.mapsFromGrQuery(
      "sys_sg_view_template_slot",
      "view_template",
      sysId
    );

    // template.slot.attributes
    for (var i = 0; i < templateSlotHMs.length; i++) {
      var viewTemplateSlotIdFieldName = "sys_id";
      viewTemplateSlotIdFieldName = this.formatter.getReplacedFieldName(
        "sys_sg_view_template_slot",
        viewTemplateSlotIdFieldName
      );

      var templateSlotAttributeHMs = this.mapsFromGrQuery(
        "sys_sg_view_template_slot_attribute",
        "view_template_slot",
        templateSlotHMs[i][viewTemplateSlotIdFieldName]
      );

      // template.slot.attribute.name
      for (var j = 0; j < templateSlotAttributeHMs.length; j++) {
        var viewTemplateSlotAttributeNameFieldName = "name";
        viewTemplateSlotAttributeNameFieldName =
          this.formatter.getReplacedFieldName(
            "sys_sg_view_template_slot_attribute",
            viewTemplateSlotAttributeNameFieldName
          );
        var templateSlotAttributeNameHM = this.mapsFromGrQuery(
          "sys_sg_view_element_attribute_name",
          "sys_id",
          templateSlotAttributeHMs[j][viewTemplateSlotAttributeNameFieldName]
        )[0];
        templateSlotAttributeHMs[j]["attributeName"] =
          templateSlotAttributeNameHM;
      }

      templateSlotHMs[i]["templateSlotAttributes"] = templateSlotAttributeHMs;

      // template.slot.viewConfigElements
      if (isCardDataIncluded) {
        var templateSlotViewConfigElementHMs = this.mapsFromGrQuery(
          "sys_sg_view_config_element",
          "view_template_slot",
          templateSlotHMs[i][viewTemplateSlotIdFieldName]
        );

        templateSlotHMs[i]["viewConfigElements"] = templateSlotViewConfigElementHMs;
      }
    }

    templateHM["templateSlots"] = templateSlotHMs;
    return templateHM;
  },

  /*
   * MCB UI Rules payload generator
   *
   * INPUT:
   * parentId: String: id of a parent record (sys_sg_view_config in the case of MCB)
   *
   * RETURN:
   * [{}]: a set of ui rules template
   */
  getUiRules: function (parentId) {
    // guard
    if (!parentId) return [];

    // uiRules
    var uIRuleHMs = this.mapsFromGrQuery(
      "sys_sg_ui_rule",
      "parent_id",
      parentId
    );

    // uiRule.actions
    for (var i = 0; i < uIRuleHMs.length; i++) {
      var uiRuleActionIdFieldName = "sys_id";
      uiRuleActionIdFieldName = this.formatter.getReplacedFieldName(
        "sys_sg_ui_rule",
        uiRuleActionIdFieldName
      );

      var uIRuleActionHMs = this.mapsFromGrQuery(
        "sys_sg_ui_rule_action",
        "ui_rule",
        uIRuleHMs[i][uiRuleActionIdFieldName]
      );
      uIRuleHMs[i]["mobileUiRuleActions"] = uIRuleActionHMs;
    }
    return uIRuleHMs;
  },

  verifyAuth: function (table, sysId) {
    var glideRecord = new GlideRecord(table);
    glideRecord.get(sysId);
    return glideRecord.canRead();
  },

  type: "McbGlideRecordUtil",
};
