class TableInfoService {
  getTableNamesAndLabels(queryParams) {
    const tablesOutput = [];
    const rotatedTables = getRotatedTables();

    /*
     * Keeping our functions encapsulated allows for us to achieve a 10x speed improvement.
     * This is because Rhino performs a 'direct call' where the function is called without
     * any variable lookup at all and avoids generic reflective method calls.
     */
    function getRotatedTables() {
      const isBaseTableMap = {};
      const isRotatedTableMap = {};

      const rotatedTable = new GlideRecord('sys_table_rotation');
      rotatedTable.query();

      while (rotatedTable.next())
        isBaseTableMap[rotatedTable.getValue('name')] = true;

      const rotatedExtension = new GlideRecord('sys_table_rotation_schedule');
      rotatedExtension.query();

      /*
       * The sys_table_rotation table includes all of the base tables that are a rotated table.
       * For example, sys_amb_message
       *
       * The sys_table_rotation_schedule includes all tables that are part of the rotated tabels.
       * For example, sys_amb_message, sys_amb_message0001, sys_amb_message0002, etc
       *
       * This check will see if the current sys_table_rotation_schedule is the base table and not include it in the list of tables to be excluded from the response.
       * For example, the result set after this check would be sys_amb_message0001, sys_amb_message0002, etc
       */
      while (rotatedExtension.next()) {
        if (!isBaseTableMap[rotatedExtension.getValue('table_name')])
          isRotatedTableMap[rotatedExtension.getValue('table_name')] = true;
      }

      return isRotatedTableMap;
    }

    function shouldExcludeTable(tableName) {
      if (rotatedTables[tableName]) return true;
      return (
        tableName.startsWith('sysx_') ||
        tableName.startsWith('var__') ||
        tableName.startsWith('ts_')
      );
    }

    const session = gs.getSession();
    const language = session.getLanguage();
    const scope = queryParams.scope ? ''.concat(queryParams.scope) : null;

    const tablesGR = new GlideRecord('sn_mab_api_db_object_sys_documentation');
    tablesGR.addQuery('sd_element', null);
    tablesGR.addQuery('sd_language', language);

    tablesGR.orderBy('sdbo_label');
    tablesGR.query();

    while (tablesGR.next()) {
      const tableName = tablesGR.getValue('sdbo_name');
      if (shouldExcludeTable(tableName)) continue;

      const label =
        tablesGR.getValue('sd_label') != null
          ? tablesGR.getValue('sd_label')
          : // still a mystery on how glide gets the label for a view with no sys_documentation, so we find it the long way
            this.getLabelForView(tablesGR.getValue('sdbo_sys_id'));

      const table = {
        value: tableName,
        label: label,
      };

      tablesOutput.push(table);
    }

    const dbViewTablesGR = new GlideRecord('sys_db_view');
    dbViewTablesGR.addQuery('sys_scope', scope);

    dbViewTablesGR.orderBy('label');
    dbViewTablesGR.query();

    while (dbViewTablesGR.next()) {
      const dbViewName = dbViewTablesGR.getValue('name');
      if (shouldExcludeTable(dbViewName)) continue;

      const getDBViewLabel = dbViewTablesGR.getValue('label');

      const dbViewLabel = getDBViewLabel != null ? getDBViewLabel : '';

      const dbViewTable = {
        value: dbViewName,
        label: dbViewLabel,
      };

      tablesOutput.push(dbViewTable);
    }

    tablesOutput.sort((a, b) => {
      const labelA = a.label.toUpperCase(); // ignore upper and lowercase
      const labelB = b.label.toUpperCase(); // ignore upper and lowercase
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });

    return tablesOutput;
  }

  getLabelForView(sysId) {
    const viewGR = new GlideRecord('sys_db_object');
    viewGR.get(sysId);
    return viewGR.getDisplayValue('label');
  }
}

module.exports = TableInfoService;
