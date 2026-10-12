(function process(env) {

    var tablesOutput = [];
    var rotatedTables = getRotatedTables();

    /*
    * Keeping our functions encapsulated allows for us to achieve a 10x speed improvement.
    * This is because Rhino performs a 'direct call' where the function is called without
    * any variable lookup at all and avoids generic reflective method calls.
    */
    function getRotatedTables() {
        var isBaseTableMap = {};
        var isRotatedTableMap = {};

        var rotatedTable = new GlideRecord('sys_table_rotation');
        rotatedTable.query();

        while (rotatedTable.next())
            isBaseTableMap[rotatedTable.getValue('name')] = true;

        var rotatedExtension = new GlideRecord('sys_table_rotation_schedule');
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
        if (rotatedTables[tableName])
            return true;

        if (
            tableName.startsWith('sysx_') ||
            tableName.startsWith('var__') ||
            tableName.startsWith('ts_')
        )
            return true;

        return false;
    }

    function getLabelForView(sysId) {
        var viewGR = new GlideRecord('sys_db_object');
        viewGR.get(sysId);

        return viewGR.getDisplayValue('label');
    }

    var session = gs.getSession();
    var language = session.getLanguage();

    var tablesGR = new GlideRecord('sn_mobile_card_bui_db_object_sys_documentation');
    tablesGR.addQuery('sd_element', null);
    tablesGR.addQuery('sd_language', language);

    tablesGR.orderBy('sdbo_label');
    tablesGR.query();

    while (tablesGR.next()) {
        var tableName = tablesGR.getValue('sdbo_name');
        if (shouldExcludeTable(tableName))
            continue;

        var label = tablesGR.getValue('sd_label') != null ?
            tablesGR.getValue('sd_label') :
            // still a mystery on how glide gets the label for a view with no sys_documentation, so we find it the long way
            getLabelForView(tablesGR.getValue('sdbo_sys_id'));

        var sysId = tablesGR.getValue('sdbo_sys_id');

        var table = {
            id: sysId,
            name: tableName,
            label: label,
        };

        tablesOutput.push(table);
    }

    return tablesOutput;

})(env);
