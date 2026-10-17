class McbResultFormatter {
  constructor(McbResultFormat) {
    this.format = McbResultFormat;
  }

  /*
   * This function will format a field, {name, value}, object based on the
   * formatting guid passed in during class instantiation.
   *
   * INPUT
   * field: {name, value} object of a glide record element
   * table: name of the table the field exists on
   *
   * RETURN
   * {name, value}: a modified field value based on this.format
   */
  formatField(field, table) {
    if (!this.format.hasOwnProperty(table)) return field;
    if (!this.format[table].hasOwnProperty(field.name)) return field;

    var result = field;
    var fieldMetaData = this.format[table][field.name];

    if (fieldMetaData.hasOwnProperty('returnName')) {
      result.name = fieldMetaData['returnName'];
    }
    if (fieldMetaData.hasOwnProperty('returnType')) {
      if (fieldMetaData['returnType'] === 'boolean') {
        result.value = Boolean(Number(field.value));
      }
    }
    if (fieldMetaData.hasOwnProperty('isExcluded')) {
      if (fieldMetaData['isExcluded']) {
        result = null;
      }
    }

    return result;
  }

  /*
   * A boolean check to determin if the result should or should not use the display value
   *
   * INPUT
   * fieldName: name of the field on the table
   * table: name of the table the hm is associated to
   *
   * RETURN
   * bool: an indicator of if the value formatted will be the display value
   */
  shouldFormatWithDisplayValue(fieldName, table) {
    if (!this.format.hasOwnProperty(table)) return false;
    if (!this.format[table].hasOwnProperty(fieldName)) return false;

    var fieldMetaData = this.format[table][fieldName];
    if (!fieldMetaData.hasOwnProperty('returnDisplayValue')) return false;

    return fieldMetaData['returnDisplayValue'];
  }

  /*
   * Constructs a hashmap to be used for the table
   * This includes default field values.
   *
   * INPUT
   * table: name of the table the hm is associated to
   *
   * RETURN
   * {}: a hashmap with field default fields for formats with the defaultValue property
   */
  formattedDefaultHashmap(table) {
    const hm = {};
    if (!this.format.hasOwnProperty(table)) return hm;

    var tableMetaData = Object.keys(this.format[table]);

    for (var i = 0; i < tableMetaData.length; i++) {
      var fieldName = tableMetaData[i];
      var fieldMetaData = this.format[table][fieldName];
      if (fieldMetaData.hasOwnProperty('defaultValue')) {
        hm[fieldName] = fieldMetaData['defaultValue'];
      }
    }

    return hm;
  }

  /*
   * Helper function, to look up the replaced name for a given field
   *
   * This was included to help keep track of the sys_id field if it was ever changed.
   *
   * INPUT
   * table: name of the table the field exists on
   * defaultFieldName: the original name of the field to look up
   *
   * RETURN
   * String: the modified name of the field
   */
  getReplacedFieldName(table, defaultFieldName) {
    if (!this.format.hasOwnProperty(table)) return defaultFieldName;
    if (!this.format[table].hasOwnProperty(defaultFieldName))
      return defaultFieldName;
    if (!this.format[table][defaultFieldName].hasOwnProperty('returnName'))
      return defaultFieldName;

    return this.format[table][defaultFieldName]['returnName'];
  }
}

module.exports = McbResultFormatter;
