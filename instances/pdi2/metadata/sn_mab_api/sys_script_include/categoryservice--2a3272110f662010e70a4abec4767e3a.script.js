class CategoryService {
  constructor() {
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.validationHandler = new sn_mab_api.ValidationHandler();
  }

  // this method has been extracted from getCategoryRecords because sys_sg_native_client is the
  // only table the has records potentially in every scope.
  getMobileAppCategoryRecords() {
    var groupingResult = [];
    var table = 'sys_sg_native_client';
    var configKeyGenerator = new sn_mab_api.ConfigKeyFactory().getGenerator(
      table
    );
    var recordList = this._getRecordsByEncodedQuery({ table: table });

    recordList.forEach(function (record) {
      groupingResult.push(
        this._simplifiedRecord(record, configKeyGenerator, table)
      );
    }, this);

    return groupingResult;
  }

  getCategoryRecords(queryParams) {
    if (!queryParams.tables)
      this.errorHandler.throwBadRequestError(
        'Malformed query parameter for [tables]'
      );

    var scope = this._createScopeQuery(queryParams);

    var retrievedRecordIds = {};
    var groupingResult = [];
    var tables = queryParams.tables[0].split(',');
    var selectedRecordIds = queryParams.selectedRecordIds
      ? queryParams.selectedRecordIds
      : null;
    //This encoded query shall apply to all the tables
    //This encoded query shall match the encoded query pattern from platform
    var encodedQuery = queryParams.encodedQuery
      ? queryParams.encodedQuery
      : null;
    var additionalFields = [];
    if (queryParams.additionalFields) {
      // Like 'tables' param above, strings are being converted into arrays
      additionalFields = queryParams.additionalFields[0].split(',');
    }

    tables.forEach(function (table) {
      if (!table)
        this.errorHandler.throwBadRequestError(
          'Malformed query parameter for [tables]: ' + queryParams.tables
        );
      var isValidTable = this.validationHandler.isValidTable(table);
      if (!isValidTable)
        this.errorHandler.throwNotFoundError(
          'Does not exist for table:' + table
        );

      var requestAttributes = {};
      requestAttributes.scope = scope;
      requestAttributes.selectedRecordIds = selectedRecordIds;
      requestAttributes.table = table;
      requestAttributes.encodedQuery = encodedQuery;

      var configKeyGenerator = new sn_mab_api.ConfigKeyFactory().getGenerator(
        table
      );

      var recordList = this._getRecordsByEncodedQuery(requestAttributes);
      recordList.forEach(function (record) {
        var curSysId = record.sys_id.value;
        if (!retrievedRecordIds[curSysId]) {
          groupingResult.push(
            this._simplifiedRecord(
              record,
              configKeyGenerator,
              table,
              additionalFields
            )
          );
          retrievedRecordIds[curSysId] = curSysId;
        }
      }, this);
    }, this);

    return groupingResult;
  }

  _createScopeQuery(queryParams) {
    var scope = queryParams.scope ? ''.concat(queryParams.scope) : null;

    // check to see if scope was provided and if it is a valid scope
    if (scope != null && !this._hasScope(scope))
      this.errorHandler.throwNotFoundError('Does not exist for scope:' + scope);

    return scope;
  }

  getScreens(queryParams, param) {
    var scope = this._createScopeQuery(queryParams);

    if (
      !param ||
      !this._contains(['non_parameterized', 'parameterized'], param)
    )
      this.errorHandler.throwBadRequestError(
        'path variable must include non_parameterized or parameterized'
      );

    var uiParams = new MobileAppBuilderDAO(
      'sys_sg_ui_parameter'
    ).getRecordsByEncodedQuery('screen!=null');
    var uiParamsScreenIds = this._extractUniqueValuePerRecord(
      uiParams,
      'screen'
    ).join(',');

    var idQuery =
      param === 'parameterized'
        ? 'sys_idIN' + uiParamsScreenIds
        : 'sys_idNOT IN' + uiParamsScreenIds;

    var query = scope ? 'sys_scope=' + scope + '^' + idQuery : idQuery;

    var listScreens = new MobileAppBuilderDAO(
      'sys_sg_list_screen'
    ).getRecordsByEncodedQuery(query);

    var configKeyGenerator = new sn_mab_api.ConfigKeyFactory().getGenerator(
      'sys_sg_list_screen'
    );
    var simplifiedRecords = [];
    listScreens.forEach(function (record) {
      simplifiedRecords.push(
        this._simplifiedRecord(record, configKeyGenerator, 'sys_sg_list_screen')
      );
    }, this);

    return simplifiedRecords;
  }

  _extractUniqueValuePerRecord(records, field) {
    var values = [];
    records.forEach(function (record) {
      var value = record[field].value;

      if (!this._contains(values, value)) {
        values.push(value);
      }
    }, this);

    return values;
  }

  _contains(arr, target) {
    return arr.indexOf(target) > -1;
  }

  _getRecordsByEncodedQuery(requestAttributes) {
    var table = requestAttributes.table;
    var scope = requestAttributes.scope;
    var encodedQuery = requestAttributes.encodedQuery;
    var selectedRecordIds = requestAttributes.selectedRecordIds;
    var categoryDAO = new MobileAppBuilderDAO(table);
    var query = '';
    if (scope != null) query = 'sys_scope=' + scope;
    if (encodedQuery) query = query ? query + '^' + encodedQuery : encodedQuery;
    if (selectedRecordIds)
      query = query
        ? query + '^NQsys_idIN' + selectedRecordIds.join() + '^EQ'
        : 'sys_idIN' + selectedRecordIds.join();
    return categoryDAO.getRecordsByEncodedQuery(query);
  }

  _hasScope(scope) {
    return new GlideRecord('sys_scope').get(scope);
  }

  _simplifiedRecord(record, configKeyGenerator, table, additionalFields) {
    additionalFields = additionalFields || [];
    var recordName = '';
    var className = record.sys_class_name ? record.sys_class_name.value : table;
    if (record.name && record.name.displayValue)
      recordName = record.name.displayValue;
    else if (record.sys_name && record.sys_name.displayValue)
      recordName = record.sys_name.displayValue;
    var simplifiedRecord = {
      name: recordName,
      sysClassName: className,
      sysClassLabel: this._getClassLabel(record, className),
      sysId: record.sys_id.value,
      type: this._getTypeForRecord(configKeyGenerator, record, table),
      scope: record.sys_scope ? record.sys_scope.value : null,
      scopeDisplayValue: record.sys_scope
        ? record.sys_scope.displayValue
        : null,
      updatedOnDisplayValue: record.sys_updated_on
        ? record.sys_updated_on.displayValue
        : null,
      displayName: record.display_name
        ? record.display_name.value
          ? record.display_name.value
          : record.display_name
        : null,
      table: record.table ? record.table.value : null,
    };
    if (record.label && record.label.displayValue)
      simplifiedRecord.label = record.label.displayValue;

    // If there are adding additional fields (passed in using 'sysparm_fields'), try to add them
    additionalFields.forEach(function (field) {
      var valueToDisplay = '';
      var retrievedField = record[field];
      if (!retrievedField) return;

      if (retrievedField.displayValue) {
        valueToDisplay = retrievedField.displayValue;
      } else if (retrievedField.value) {
        valueToDisplay = retrievedField.value;
      }

      simplifiedRecord[field] = valueToDisplay;
    });

    return simplifiedRecord;
  }

  _getTypeForRecord(configKeyGenerator, record, table) {
    return configKeyGenerator.getTypeForRecord(record, table);
  }

  _getClassLabel(record, table) {
    var classLabelGetter = ClassLabelGetterFactory.getInstance();
    return classLabelGetter.getLabel(record, table);
  }
}

module.exports = CategoryService;
