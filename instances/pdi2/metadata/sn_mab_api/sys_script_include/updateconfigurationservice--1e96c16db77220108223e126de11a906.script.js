class UpdateConfigurationService {
  constructor() {
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.mobileDAOCache = new sn_mab_api.MobileDAOCache();
    this.validationHandler = new sn_mab_api.ValidationHandler();
    this.recordValidator = new sn_mab_api.RecordValidator();
    this.configSortingService = new sn_mab_api.ConfigSortingService();
    this.fieldEncryptor = new sn_mab_api.MobileFieldEncryptor();
    this.operations = ['inserts', 'updates', 'deletes'];
  }

  /**
   *
   * @param payload {{}}
   * @return {{}}
   */
  processRecords(payload) {
    var idMap = {};
    this.validateAllTables(payload);

    for (var i = 0; i < this.operations.length; i++) {
      var operation = this.operations[i];
      if (operation === 'deletes') {
        this.processDeletes(
          this.configSortingService.sortNodes(payload[operation]),
          idMap
        );
      } else {
        this.preProcessInsertsAndUpdates(payload[operation]);
        this.processInsertsAndUpdates(
          this.configSortingService.sortNodes(payload[operation]),
          idMap
        );
      }
      if (this.containsError(idMap)) {
        return idMap;
      }
    }

    return idMap;
  }

  preProcessInsertsAndUpdates(records) {
    // encrypt any password2 fields before field objects are flattened
    this.encryptAnyPassword2Fields(records);
    // flatten all records to avoid issues with sorting and id replacements
    this.flattenRecords(records);
  }

  processInsertsAndUpdates(sortedRecords, idMap) {
    for (var i = 0; i < sortedRecords.length; i++) {
      var record = sortedRecords[i];
      var table = record.tableName;

      var mobileAppBuilderDao = this.mobileDAOCache.getDAO(
        this._snakeCaseString(table)
      );

      this.replaceReference(record.fields, idMap);

      var response = this.insertOrUpdate(
        record.sysId,
        record.fields,
        mobileAppBuilderDao
      );

      if (!response) return;

      idMap[record.sysId] = response;
    }
  }

  /**
   *
   * @param sysId {String}
   * @param record {{}}
   * @param mobileAppBuilderDao {MobileAppBuilderDAO}
   * @return {{sys_id: null, message: string, operation: string, table: MobileAppBuilderDAO.table, is_success: boolean}}
   */
  insertOrUpdate(sysId, record, mobileAppBuilderDao) {
    var operation = this.isGeneratedId(sysId) ? 'insert' : 'update';

    if (operation === 'update') {
      record.sys_id = sysId;
    }

    if (record.sys_class_name)
      record.sys_class_name = this._snakeCaseString(record.sys_class_name);

    var invalidReferences = this.getInvalidReferences(record);

    if (invalidReferences.length > 0) {
      this.errorHandler.throwBadRequestError(
        'invalid reference from field(s) ' + invalidReferences.join(',')
      );
    }

    try {
      var realSysId = mobileAppBuilderDao.saveRecord(record);
    } catch (error) {
      this.errorHandler.throwBadRequestError(
        'unable to ' +
          operation +
          ' record into table ' +
          mobileAppBuilderDao.table +
          ' - ' +
          error.message
      );
    }

    // currently this condition might not ever be met. we need to update the dao to include lastErrorMessage
    if (!realSysId) {
      this.errorHandler.throwBadRequestError(
        'unable to ' +
          operation +
          ' record: ' +
          realSysId +
          ' into table ' +
          mobileAppBuilderDao.table
      );
    }

    // if we got to this point the record is assumed to have saved
    return {
      sys_id: realSysId,
      is_success: true,
      message:
        'successfully ' +
        operation +
        ' record: ' +
        realSysId +
        ' into table ' +
        mobileAppBuilderDao.table,
      operation: operation,
      table: mobileAppBuilderDao.table,
    };
  }

  encryptPassword2Fields(record, tableName) {
    for (var fieldName in record) {
      var field = record[fieldName];
      if (typeof field === 'object' && 'type' in field) {
        if (field.type === 'password2')
          record[fieldName] = this.fieldEncryptor.encrypt(
            this._snakeCaseString(tableName),
            fieldName,
            field.value
          );
      } else if (
        typeof field === 'string' &&
        ['map_provider_app_secret', 'location_provider_app_secret'].indexOf(
          fieldName
        ) > -1
      ) {
        record[fieldName] = this.fieldEncryptor.encrypt(
          this._snakeCaseString(tableName),
          fieldName,
          field
        );
      }
    }
  }

  encryptAnyPassword2Fields(records) {
    for (var tableName in records) {
      var recordsPerTable = records[tableName];
      for (var sysId in recordsPerTable) {
        this.encryptPassword2Fields(recordsPerTable[sysId], tableName);
      }
    }
  }

  flattenRecords(records) {
    for (var tableName in records) {
      var recordsPerTable = records[tableName];

      for (var sysId in recordsPerTable) {
        var record = recordsPerTable[sysId];
        recordsPerTable[sysId] = this.flattenRecord(record);
      }
    }
  }

  flattenRecord(record) {
    var flattenedRecord = {};

    for (var field in record) {
      var currValue = record[field];
      if (typeof currValue === 'object') {
        flattenedRecord[field] = currValue.value ? currValue.value : null;
      } else {
        flattenedRecord[field] = currValue;
      }
    }

    return flattenedRecord;
  }

  /**
   *
   * @param payload {{}}
   */
  validateAllTables(payload) {
    var operations = ['inserts', 'updates', 'deletes'];

    operations.forEach(
      function (operation) {
        var allRecords = payload[operation];

        if (!allRecords) return;

        Object.keys(allRecords).forEach(
          function (table) {
            if (
              !this.validationHandler.isValidTable(this._snakeCaseString(table))
            ) {
              this.errorHandler.throwBadRequestError('invalid table: ' + table);
            }
          }.bind(this)
        );
      }.bind(this)
    );
  }

  /**
   *
   * @param record {{}}
   * @param idMap {{}}
   */
  replaceReference(record, idMap) {
    for (var field in record) {
      if (this.hasGeneratedId(record[field])) {
        var generatedIds = this.extractGeneratedIds(record[field]);
        generatedIds.forEach(function (generatedId) {
          if (idMap[generatedId] && idMap[generatedId].sys_id) {
            record[field] = record[field].replace(
              generatedId,
              idMap[generatedId].sys_id
            );
          }
        });
      }
    }
  }

  /**
   * @param sortedRecords {[]}
   * @param idMap
   */
  processDeletes(sortedRecords, idMap) {
    for (var i = 0; i < sortedRecords.length; i++) {
      var record = sortedRecords[i];
      var table = record.tableName;

      var mobileAppBuilderDao = this.mobileDAOCache.getDAO(
        this._snakeCaseString(table)
      );

      var response = this.deleteRecord(record.sysId, mobileAppBuilderDao);

      if (!response) return;

      idMap[record.sysId] = response;
    }
  }

  deleteRecord(sysId, mobileAppBuilderDao) {
    try {
      var isDeleted = mobileAppBuilderDao.deleteRecord(sysId);
    } catch (error) {
      this.errorHandler.throwBadRequestError(
        'unable to delete record from table ' +
          mobileAppBuilderDao.table +
          ' - ' +
          error.message
      );
    }

    if (!isDeleted) {
      this.errorHandler.throwBadRequestError(
        'unable to delete record: ' +
          sysId +
          ' from table ' +
          mobileAppBuilderDao.table
      );
    }

    return {
      is_success: true,
      sys_id: sysId,
      operation: 'delete',
      table: mobileAppBuilderDao.table,
      message:
        'successfully deleted record: ' +
        sysId +
        ' from table ' +
        mobileAppBuilderDao.table,
    };
  }

  /**
   *
   * @param idMap {{}}
   * @return {boolean}
   */
  containsError(idMap) {
    for (var sysId in idMap) {
      if (!idMap[sysId].is_success) {
        return true;
      }
    }

    return false;
  }

  /**
   *
   * @param value {String}
   * @return {boolean}
   */
  isGeneratedId(value) {
    return this.validationHandler.isGeneratedId(value);
  }

  /**
   *
   * @param value {String}
   * @return {boolean}
   */
  hasGeneratedId(value) {
    return this.validationHandler.hasGeneratedId(value);
  }

  /**
   *
   * @param value {string}
   * @return {[]}
   */
  extractGeneratedIds(value) {
    return this.validationHandler.extractGeneratedIds(value);
  }

  /**
   * Checks to see if a record contains a reference the has not been replaced by a valid sysId
   * @param record {{}}
   * @return {[]}
   */
  getInvalidReferences(record) {
    var invalidFields = [];
    Object.keys(record).forEach(
      function (field) {
        if (this.isGeneratedId(record[field])) {
          invalidFields.push(field);
        }
      }.bind(this)
    );

    return invalidFields;
  }

  // todo: move into a utility service
  _snakeCaseString(string) {
    return string.replace(/M2M/g, 'M2m').replace(/[A-Z]/g, function (capital) {
      return '_' + capital.toLowerCase();
    });
  }
}

module.exports = UpdateConfigurationService;
