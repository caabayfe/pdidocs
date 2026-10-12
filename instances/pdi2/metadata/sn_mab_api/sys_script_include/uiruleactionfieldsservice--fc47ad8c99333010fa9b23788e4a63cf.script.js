class UIRuleActionFieldsService {
  static cleanQueryParams(queryParams) {
    return Object.keys(queryParams).reduce(function (output, key) {
      var value = queryParams[key];
      var newValue =
        Array.isArray(value) && value.length === 1 ? value[0] : value;
      output[key] = newValue;
      return output;
    }, {});
  }

  static parseRecord(record) {
    if (!record) return {};
    return Object.keys(record).reduce(function (output, key) {
      var value = record[key];
      output[key] =
        typeof value === 'string'
          ? value
          : value.value || value.displayValue || null;
      return output;
    }, {});
  }

  static parseRecords(records) {
    return records.map(UIRuleActionFieldsService.parseRecord);
  }

  static prepareTargetRecords(records) {
    return UIRuleActionFieldsService.parseRecords(records).map(function (
      record
    ) {
      record.id = record.name;
      record.label = record.name;
      return record;
    });
  }

  constructor(queryParams) {
    this._queryParams = UIRuleActionFieldsService.cleanQueryParams(queryParams);
    this._errorHandler = new sn_mab_api.ErrorHandler();
    this._daoCache = new sn_mab_api.MobileDAOCache();
    this._targetOptions = [];
  }

  getTargetOptions() {
    // Fetch the parent to see if it is a valid record
    var isParentValid = !!this._getRecordValue(
      this._queryParams.parentTable,
      this._queryParams.parentId,
      'name'
    );

    // Throw error if the parent is invalid (parentId doesn't exist in parentTable)
    if (!isParentValid) {
      this._errorHandler.throwBadConfigError(
        'Cannot find any valid target for current UI rule action. Parent ID of UI rule is invalid.'
      );
    }

    switch (this._queryParams.parentTable) {
      case 'sys_sg_view_config':
        return this._getViewConfigTargetOptions();
      case 'sys_sg_parameter_screen':
        return this._getParameterScreenTargetOptions();
      case 'sys_sg_parameter_section':
        return this._getParameterSectionTargetOptions();
      default:
        return [];
    }
  }

  getOperationOptions() {
    var uiRuleOperationQualifier = new global.UIRuleOperationQualifier();
    var dao = new MobileAppBuilderDAO('sys_sg_ui_rule_operation');
    var parentTable = this._queryParams.parentTable;
    var query = 'name=';
    switch (parentTable) {
      case 'sys_sg_view_config':
        query = 'nameIN' + uiRuleOperationQualifier.MOBILE_VIEW_OPS.join(',');
        break;
      case 'sys_sg_parameter_screen':
      case 'sys_sg_parameter_section':
        query =
          'nameIN' +
          uiRuleOperationQualifier.PARAM_SCREEN_OPS.concat(
            uiRuleOperationQualifier.getOneExtendOperations()
          ).join(',');
        break;
      default:
        break;
    }
    var records = dao.getRecordsByEncodedQuery(query, [
      'sys_id',
      'label',
      'name',
    ]);
    return UIRuleActionFieldsService.parseRecords(records);
  }

  _setTargetOption(object) {
    if (!object.Id) return;

    var id = String(object.Id);
    var type = object.Type;
    var label = id + ' [' + type + ']';

    this._targetOptions.push({
      label: label,
      id: id,
    });
  }

  _getViewElementIds(object, textOnly) {
    var type = object.Type;
    var children = object.Children;
    if (!textOnly) {
      this._setTargetOption(object);
    }

    if (children) {
      var self = this;
      children.forEach(function (child) {
        self._getViewElementIds(child, textOnly);
      });
    } else if (textOnly && type === 'Text') {
      this._setTargetOption(object);
    }
  }

  _getRecordValue(table, sysId, field) {
    var dao = new MobileAppBuilderDAO(table);
    var results = UIRuleActionFieldsService.parseRecord(
      dao.getRecord(sysId, [field])
    );
    return results[field];
  }

  _getViewConfigTargetOptions() {
    // require operation sys_id
    var operationSysId = this._queryParams.operation;
    if (!operationSysId) {
      this._errorHandler.throwBadConfigError(
        'Operation sys_id is required for UI Rules where parent_table is "sys_sg_view_config"'
      );
    }

    // get the view template record
    var templateSysId = this._getRecordValue(
      'sys_sg_view_config',
      this._queryParams.parentId,
      'template'
    );

    // get view template json
    var jsonString = this._getRecordValue(
      'sys_sg_view_template',
      templateSysId,
      'template_json'
    );

    // get the operation name
    var operationName = this._getRecordValue(
      'sys_sg_ui_rule_operation',
      operationSysId,
      'name'
    );

    // parse the itemview json
    var json = JSON.parse(jsonString);
    var textOnly = operationName === 'applyDateFormatter';
    this._getViewElementIds(json, textOnly);

    return this._targetOptions;
  }

  _getInputsFromParent() {
    // get input records associated with the ui rule's parent screen or section
    var inputDao = new MobileAppBuilderDAO('sys_sg_input');
    var tableString = this._queryParams.parentTable.replace('sys_sg_', '');
    var parentQuery = tableString + '=' + this._queryParams.parentId;
    var screenInputs = inputDao.getRecordsByEncodedQuery(parentQuery, ['name']);
    var targetOptions =
      UIRuleActionFieldsService.prepareTargetRecords(screenInputs);

    return {
      targetOptions: targetOptions,
      inputDao: inputDao,
      parentQuery: parentQuery,
      parentId: this._queryParams.parentId,
    };
  }

  _getParameterScreenTargetOptions() {
    // get input records based on ui rule's parent fields
    var inputsFromParent = this._getInputsFromParent();
    // ..., Array.from and Object.assign are all es6
    var targetOptions = inputsFromParent.targetOptions.map(function (option) {
      return option;
    });

    // get all sys_sg_parameter_sections associated with the parent sys_sg_parameter_screen
    var mappingDao = new MobileAppBuilderDAO('sys_sg_parameter_section_m2m');
    var sections = mappingDao.getRecordsByEncodedQuery(
      inputsFromParent.parentQuery,
      ['parameter_section']
    );
    var sectionIds = [];
    sections.forEach(function (screen) {
      if (screen.parameter_section && screen.parameter_section.value) {
        sectionIds.push(screen.parameter_section.value);
      }
    });
    var sectionQuery = 'parameter_sectionIN' + sectionIds.join(',');
    // get all input records associated with the sys_sg_parameter_sections
    var sectionInputs = inputsFromParent.inputDao.getRecordsByEncodedQuery(
      sectionQuery,
      ['name']
    );
    UIRuleActionFieldsService.prepareTargetRecords(sectionInputs).forEach(
      function (record) {
        if (record.parameter_screen !== inputsFromParent.parentId) {
          targetOptions.push(record);
        }
      }
    );

    return targetOptions;
  }

  _getParameterSectionTargetOptions() {
    // get input records based on ui rule's parent section
    var targetOptions = this._getInputsFromParent().targetOptions;
    return UIRuleActionFieldsService.prepareTargetRecords(targetOptions);
  }
}

module.exports = UIRuleActionFieldsService;
