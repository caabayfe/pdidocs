var IPAddrFixScriptUtil;
(function() {
    IPAddrFixScriptUtil = {
        fixIPAddressColumnType: fixIPAddressColumnType
    };

    /*
     * Summary.  Updates the column type & ip_data_control value for the columns supplied in ipFields
     * 
     * @param {string} scriptIdentifier - A string to uniquely identify the fix script that invokes this method.
     *                                    Example: 'FIX_IPADDR_DISCO' - for Discovery Fix script
     * @param {object} ipFields - An object that contains the tablename, columns 
     *                             & optionally ip_data_control glide attribute to be updated
     *                             Example: ipFields={ <tableA>:{'name':<column1>},
     *                                                 <tableB>:[{'name':<column1, 'ip_data_control': <value>},
     *                                                          {'name':<column2}]};
     *
     */
    function fixIPAddressColumnType(scriptIdentifier, ipFields) {
        gs.debug(scriptIdentifier + ": Starting IPAddrFixScriptUtil.fixIPAddressColumnType'");

        var gr = new GlideRecord('sys_dictionary');
        if (!gr.isValid()) {
            gs.error(scriptIdentifier + ": Cannot update! Missing 'sys_dictionary' table!");
            return;
        }
        if (!gr.isValidField('name') || !gr.isValidField('element')) {
            gs.error(scriptIdentifier + ": Cannot update! Missing required fields in 'sys_dictionary' table!");
            return;
        }

        for (var ipTableName in ipFields) {
            var fields = ipFields[ipTableName];
            if (!(fields instanceof Array)) { // if not an array, convert to one
                fields = [fields];
            }
            for (var index in fields) {
                _updateColumnType(scriptIdentifier, ipTableName, fields[index]);
            }
        }

        gs.debug(scriptIdentifier + ": End of IPAddrFixScriptUtil.fixIPAddressColumnType");
    }

    function _updateColumnType(scriptIdentifier, table, column) {
        if (!column.hasOwnProperty('name')) {
            gs.error(scriptIdentifier + ": Invalid input format! Missing column name");
            return;
        }

        var sysDictionaryGr = new GlideRecord('sys_dictionary');
        sysDictionaryGr.addQuery('name', table);
        sysDictionaryGr.addQuery('element', column.name);
        sysDictionaryGr.query();

        if (sysDictionaryGr.next()) {
            var columnType = sysDictionaryGr.getValue('internal_type');
            var maxLength = sysDictionaryGr.getValue('max_length');

            sysDictionaryGr.setValue('internal_type', 'ip_addr');

            if (column.hasOwnProperty('ip_data_control')) {
                var attributeGr = _updateIPDataControlAttribute(scriptIdentifier, column.ip_data_control, sysDictionaryGr.getValue('attributes'));
                sysDictionaryGr.setValue('attributes', attributeGr.serializeAttributes());
            }

            var start = new Date().getTime();
            sysDictionaryGr.update();
            var end = new Date().getTime();

            gs.debug(scriptIdentifier + ': Updated ' + table + '.' + column.name + ' type from ' + columnType + ' with maxLength=' + maxLength + ' to ip_addr type in ' + (end - start) + ' ms');
        } else
            gs.warn(scriptIdentifier + ': Skipped update for ' + table + '.' + column.name);
    }

    function _updateIPDataControlAttribute(scriptIdentifier, value, attributes) {
        var attributeGr = new GlideAttributes(attributes);
        attributeGr.setAttribute('ip_data_control', value);

        gs.debug(scriptIdentifier + ': GlideAttribute updated, ip_data_control=' + attributeGr.getAttribute('ip_data_control'));

        return attributeGr;
    }
})();
