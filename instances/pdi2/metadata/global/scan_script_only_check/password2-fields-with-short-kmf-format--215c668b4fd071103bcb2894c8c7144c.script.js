(function(engine) {
    var ENCRYPTION_START_TAG_STRING = "\uFDE3";
    var dictionaryGr = new GlideRecord('sys_dictionary');
    dictionaryGr.addQuery('internal_type', 'password2');
    dictionaryGr.addQuery('attributes','CONTAINS', 'is_fallback_module_encrypted=true');
    dictionaryGr.query();

    var tableMap = {};
    while (dictionaryGr.next()) {
        var tableName = dictionaryGr.getValue('name');
        var columnName = dictionaryGr.getValue('element');
        addToMap(tableMap, tableName, columnName);
    }

    for (table in tableMap) {
        var fieldNames = tableMap[table];
        var tableGr = new GlideRecord(table);
        if (!tableGr.isValid()) {
            continue;
        }
        tableGr.query();
        while (tableGr.next()) {
            for (var i = 0; i < fieldNames.length; i++) {
                var columnValue = tableGr.getValue(fieldNames[i]);
                if (JSUtil.nil(columnValue)) {
                    continue;
                }
                if (columnValue.startsWith(ENCRYPTION_START_TAG_STRING)) {
                    finding.setCurrentSource(tableGr);
                    finding.increment();
                }
            }
        }
    }

    function addToMap(object, key, value) {
        if (!object[key])
            object[key] = [value];
        else
            object[key].push(value);
    }
})(engine);
