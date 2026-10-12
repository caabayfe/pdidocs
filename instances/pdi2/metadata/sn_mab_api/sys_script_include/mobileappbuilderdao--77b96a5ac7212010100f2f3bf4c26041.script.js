class MobileAppBuilderDAO {
  constructor(table) {
    this.table = table;
    this.tableDAO = new sn_glide_ms_api.MobileAppBuilderDAO(table);
  }

  getRecord(sysId, returnFields) {
    var grs = this.tableDAO.getRecord(sysId);
    return this.getRecordMap(grs, returnFields);
  }

  getRecordsByEncodedQuery(encodedQuery, returnFields, limit, offset) {
    var records = [];
    var grs = this.tableDAO.getRecordsByEncodedQuery(
      encodedQuery,
      limit,
      offset
    );
    while (grs.next()) records.push(this.getRecordMap(grs, returnFields));

    return records;
  }

  saveRecord(record) {
    var grs = this.tableDAO.saveRecord(record);
    return grs.getUniqueValue();
  }

  saveAndReturnRecord(record, returnFields) {
    var grs = this.tableDAO.saveRecord(record);
    return this.getRecordMap(grs, returnFields);
  }

  deleteRecord(sysId) {
    return this.tableDAO.deleteRecord(sysId);
  }

  getRecordMap(grs, returnFields) {
    if (grs == null)
      new ErrorHandler().throwInternalError(
        'Cannot build record map for null GlideRecordSecure object'
      );
    else if (!grs.isValidRecord()) return null;

    var values = {};

    // We have to prime sys_scope display label.  This should be removed after DEF0235065 is resolved
    grs.getDisplayValue('sys_scope');

    if (returnFields == null) {
      grs.getElements().forEach(
        function (element) {
          values[element.getName()] = this.getValuesForElement(
            grs,
            element.getName()
          );
        }.bind(this)
      );
    } else {
      returnFields.forEach(
        function (field) {
          var element = grs.getElement(field);

          if (element != null)
            values[element.getName()] = this.getValuesForElement(
              grs,
              element.getName()
            );
        }.bind(this)
      );
    }

    return values;
  }

  getValuesForElement(grs, elementName) {
    if (grs.getValue(elementName) == null) return null;

    var element = grs.getElement(elementName);

    var elementValues = {};
    elementValues.value = grs.getValue(elementName);
    elementValues.type = element.getED().getInternalType();

    if (elementValues.type == 'reference') {
      var refRecord = element.getRefRecord();
      elementValues.referenceTable = refRecord.getTableName();
      // Used by Input attribute to fetch the 'name' field of the record in sys_sg_input_type table
      elementValues.referenceName = refRecord.getValue('name') || refRecord.getValue('title');
    }

    if (elementValues.type == 'glide_list')
      elementValues.referenceTable = element.getED().getReference();

    if (elementValues.type == 'table_name') {
      if (gs.tableExists(elementValues.value)) {
        var tableGRS = new GlideRecordSecure(elementValues.value);
        elementValues.displayValue = tableGRS.getClassDisplayValue();
      } else {
        elementValues.displayValue = elementValues.value;
      }
    } else elementValues.displayValue = element.getDisplayValue();

    return elementValues;
  }
}

MobileAppBuilderDAO.isTableAccessible = function (tableName) {
  return sn_glide_ms_api.MobileAppBuilderDAO.isTableAccessible(tableName);
};

module.exports = MobileAppBuilderDAO;
