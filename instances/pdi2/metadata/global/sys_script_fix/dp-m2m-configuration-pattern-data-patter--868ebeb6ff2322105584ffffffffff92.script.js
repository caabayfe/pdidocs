function updateReference(tableName, columnName, newReference) {
    var dictGr = new GlideRecord('sys_dictionary');
    dictGr.addQuery('name', tableName);
    dictGr.addQuery('element', columnName);
    dictGr.query();

    while (dictGr.next()) {
      var oldReference = dictGr.reference + '';
      if (oldReference !== newReference) {
        gs.info("Updating reference for " + tableName + "." + columnName +
                " from '" + oldReference + "' to '" + newReference + "'");
        dictGr.reference = newReference;
        dictGr.update();
      } else {
        gs.info("No update needed for " + tableName + "." + columnName +
                ", already set to '" + newReference + "'");
      }
    }
  }

  updateReference('dp_m2m_configuration_pattern', 'data_pattern', 'dp_data_pattern');
