class ViewConfigMetadata {
  constructor(sysId) {
    this.table = '';
    this.viewConfigSysId = '';
    this.fieldLabelSysId = 'c90fd1c2b7321010df65f6efce11a9d2';
    this.fieldValueSysId = 'c2eed5c2b7321010df65f6efce11a9cf';
    this.textValueSysId = '601f19c2b7321010df65f6efce11a925';
    this.initialize(sysId);
  }

  initialize(sysId) {
    const viewConfigGr = new GlideRecordSecure('sys_sg_view_config');
    viewConfigGr.get(sysId);

    if (!viewConfigGr.isValid()) {
      response.setError(
        new sn_ws_err.NotFoundError('View Config {' + sysId + '} is not found.')
      );
      return;
    }

    this.table = viewConfigGr.getValue('table');
    this.viewConfigSysId = sysId;
    this.viewTemplateSysId = viewConfigGr.getValue('template');
  }

  _isEmptyObject(object) {
    return (
      typeof object === 'object' && JSON.stringify(object) == JSON.stringify({})
    );
  }

  // private recursive function to help dot walk a ordered array decending children
  _getGlideElement(table, dotWalkedArray) {
    var columnName = dotWalkedArray.shift();
    var gr = new GlideRecord(table);
    var isValidField = gr.isValidField(columnName);
    if (!isValidField) return false;

    var ge = gr.getElement(columnName);
    var type = ge.getED().getInternalType();
    if (dotWalkedArray[0] !== undefined && type === 'reference') {
      var refTable = ge.getRefRecord().getTableName();
      return this._getGlideElement(refTable, dotWalkedArray);
    } else return ge;
  }

  _getTableDisplayElementName(table) {
    //We can accept either a GlideRecord or a string but we want a gliderecord
    var tableGr = new GlideRecord(table);
    //Get all the fields for the table
    var elements = tableGr.getElements();
    //Scoped vs Global calls
    //Global gives us a java object
    //Scoped a js array
    var jsArr = Array.isArray(elements);
    var elementsLength = jsArr ? elements.length : elements.size();
    for (var i = 0; i < elementsLength; i++) {
      //if find the display field, return it and finish
      var element = jsArr ? elements[i] : elements.get(i);
      var dicGR = new GlideRecord('sys_dictionary');
      dicGR.addQuery('name', element.getTableName());
      dicGR.addQuery('element', element.getName());
      dicGR.query();
      while (dicGR.next()) {
        if (dicGR.display) {
          return dicGR.getValue('element');
        }
      }
    }
    // defualt to "name" if no element dictionary.display is set to true
    return 'name';
  }

  _getFieldElementAttributeGrs() {
    var fieldElementAttributeGrs = [];
    // get view config elements
    var viewConfigElementGr = new GlideRecordSecure(
      'sys_sg_view_config_element'
    );
    viewConfigElementGr.addEncodedQuery(
      'view_template_slot.type=text^view_config=' + this.viewConfigSysId
    );
    viewConfigElementGr.query();
    while (viewConfigElementGr.next()) {
      // get view config element attributes that are type FieldLabel or FieldValue
      var viewConfigElementAttributeGr = new GlideRecordSecure(
        'sys_sg_view_config_element_attribute'
      );
      viewConfigElementAttributeGr.addEncodedQuery(
        'name=' +
          this.fieldLabelSysId +
          '^ORname=' +
          this.fieldValueSysId +
          '^ORname=' +
          this.textValueSysId +
          '^view_config_element=' +
          viewConfigElementGr.getUniqueValue()
      );
      viewConfigElementAttributeGr.query();
      while (viewConfigElementAttributeGr.next()) {
        fieldElementAttributeGrs.push(viewConfigElementAttributeGr);
      }
    }
    return fieldElementAttributeGrs;
  }

  _getSlotFieldElementAttributeGrs(viewTemplateSysId) {
    var templateSlotFieldElementAttributeGrs = [];
    var viewTemplateSlotGr = new GlideRecordSecure('sys_sg_view_template_slot');
    viewTemplateSlotGr.addEncodedQuery(
      'type=text^view_template=' + viewTemplateSysId
    );
    viewTemplateSlotGr.query();
    while (viewTemplateSlotGr.next()) {
      // get view template slot attributes that are type FieldLabel or FieldValue
      var viewTemplateSlotAttributeGr = new GlideRecordSecure(
        'sys_sg_view_template_slot_attribute'
      );
      viewTemplateSlotAttributeGr.addEncodedQuery(
        'name=' +
          this.fieldLabelSysId +
          '^ORname=' +
          this.fieldValueSysId +
          '^view_template_slot=' +
          viewTemplateSlotGr.getUniqueValue()
      );
      viewTemplateSlotAttributeGr.query();
      while (viewTemplateSlotAttributeGr.next()) {
        templateSlotFieldElementAttributeGrs.push(viewTemplateSlotAttributeGr);
      }
    }
    return templateSlotFieldElementAttributeGrs;
  }

  _getFieldMetaData(tableName, field) {
    var fieldMetadata = {};
    if (typeof field !== 'string') return fieldMetadata;

    if (field === '') return fieldMetadata;

    var glideElement = this._getGlideElement(tableName, field.split('.'));
    if (typeof glideElement === 'boolean' && !glideElement)
      return fieldMetadata;

    var glideElementDescriber = glideElement.getED();
    var type = glideElementDescriber.getInternalType();
    var hasChoices = glideElement.getChoices().length > 0;
    fieldMetadata = {
      displayValue: glideElement.getLabel(),
      isReference: type === 'reference',
      parent: glideElementDescriber.getTableName(),
      type: type,
      hasChoices: hasChoices,
    };
    if (fieldMetadata.isReference) {
      var refTable = glideElement.getRefRecord().getTableName();
      fieldMetadata.referenceDataKey = refTable;
      fieldMetadata.referenceTableDefaultField =
        this._getTableDisplayElementName(refTable);
    }
    return fieldMetadata;
  }

  _getFieldData(fieldElementAttributeGr, table) {
    var data = {};
    var fieldType = fieldElementAttributeGr.getDisplayValue('name');
    var value = fieldElementAttributeGr.getValue('value');
    var translatedValue = fieldElementAttributeGr.getValue('translated_value');
    if (typeof value !== 'string' && typeof translatedValue !== 'string')
      return data;

    data.fieldTypeTextInput = value || translatedValue;
    data.fieldType = fieldType;
    var mappedFieldMeta = this._getFieldMetaData(table, value);
    if (this._isEmptyObject(mappedFieldMeta)) return data;

    data.mappedFieldMeta = mappedFieldMeta;
    return data;
  }

  getElementAttributeFieldMetadata(viewTemplateSysId, viewConfigTable) {
    var response = {};
    var table = viewConfigTable || this.table;
    if (!viewTemplateSysId || viewTemplateSysId === this.viewTemplateSysId) {
      var fieldElementAttributeGrs = this._getFieldElementAttributeGrs();
      // format data for each view config element attribute of type FieldValue or FieldLabel
      fieldElementAttributeGrs.forEach(
        function (fieldElementAttributeGr) {
          var viewTemplateSlot =
            fieldElementAttributeGr.view_config_element.view_template_slot;
          var viewTemplateSlotName = viewTemplateSlot.getDisplayValue('name');
          var data = this._getFieldData(fieldElementAttributeGr, table);
          if (this._isEmptyObject(data)) return;

          response[viewTemplateSlotName] = data;
        }.bind(this)
      );
    }
    var slotFieldElementAttributeGrs = this._getSlotFieldElementAttributeGrs(
      viewTemplateSysId || this.viewTemplateSysId
    );
    slotFieldElementAttributeGrs.forEach(
      function (slotFieldElementAttributeGr) {
        var viewTemplateSlot = slotFieldElementAttributeGr.view_template_slot;
        var viewTemplateSlotName = viewTemplateSlot.getDisplayValue('name');
        var data = this._getFieldData(slotFieldElementAttributeGr, table);
        if (this._isEmptyObject(data)) return;

        if (!response[viewTemplateSlotName])
          response[viewTemplateSlotName] = {};

        response[viewTemplateSlotName]['templateSlotData'] = data;
      }.bind(this)
    );
    try {
      var viewConfigFieldGr = new GlideRecordSecure('sys_sg_view_config_field');
      viewConfigFieldGr.addEncodedQuery('view_config=' + this.viewConfigSysId);
      viewConfigFieldGr.query();
      while (viewConfigFieldGr.next()) {
        const cardFieldValue = viewConfigFieldGr.getDisplayValue('name');
        if (!response[cardFieldValue]) {
          response[cardFieldValue] = {};
          response[cardFieldValue].fieldTypeTextInput = cardFieldValue;
          response[cardFieldValue].fieldType = 'CardField';
          response[cardFieldValue].mappedFieldMeta = this._getFieldMetaData(
            table,
            cardFieldValue
          );
        }
      }
    } catch (e) {
      return response;
    }
    return response;
  }
}

module.exports = ViewConfigMetadata;
