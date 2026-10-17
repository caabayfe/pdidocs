var CmdbWsConfigBase = Class.create();
CmdbWsConfigBase.prototype = {

    PARAM_APP_ID: 'appId',
    PARAM_PROP_NAME: 'propName',
    PARAM_TABLE_NAME: 'table',
    PARAM_CONFIG_ID: 'configId',
    PARAM_ORDER_BY: 'orderBy',
    PARAM_CONDITIONS: 'conditions',
    PARAM_LIMIT	: 'limit',
    PARAM_PROPERTIES: 'properties',

    TABLE_CONFIG_IDENTIFIER: 'sn_cmdb_ws_config_identifier',
    TABLE_CONFIG_PROP: 'sn_cmdb_ws_config_property',
    COLUMN_CONFIG_PROP_NAME: 'name',
    COLUMN_CONFIG_PROP_VALUE: 'value',

    COLUMN_CONFIG_APP_ID: 'ux_application',
    COLUMN_CONFIG_NAME: 'name',
    COLUMN_CONFIG_IDENTIFIER: 'config_identifier_id',
    COLUMN_CONFIG_TO_APP_ID: 'config_identifier_id.ux_application',
    COLUMN_DEFAULT_CONFIG: 'config_identifier_id.default',

    initialize: function() {},

    _buildTableResponse: function(configTableGr) {
        var result = [];
        while (configTableGr.next()) {
            var record = {};
            for (var field in configTableGr) {
                if (!gs.nil(field)) {
                    record[field] = configTableGr.getValue(field);
                }
            }
            result.push(record);
        }
        return result;
    },

    type: 'CmdbWsConfigBase'
};
