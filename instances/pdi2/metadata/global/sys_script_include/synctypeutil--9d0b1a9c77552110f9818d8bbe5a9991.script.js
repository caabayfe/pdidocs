var SyncTypeUtil = Class.create();

/**
 * @param tableName: table name selected by the user
 * @param fields: ID Fields selected by the user for generating federated id
 * @return: Map<field_name,field_label> of unsupported and blacklisted fields added to ID Fields
 */
SyncTypeUtil.checkUnsupportedFields = function(tableName, fields) {
    var unsupportedFieldMap = {};
    if (JSUtil.nil(fields)) {
        return unsupportedFieldMap;
    }
    var syncResourceTD = new GlideTableDescriptor(tableName);
    var resourceSchema = syncResourceTD.getSchema();
    var fieldList = fields.split(',');
    fieldList.forEach(function(fieldName) {
        var fieldED = resourceSchema.get(fieldName);
        if (SyncTypeUtil.isBlacklistedField(fieldED.getName()) || !SyncTypeUtil.isSupportedField(fieldED)) {
            unsupportedFieldMap[fieldName] = fieldED.getLabel();
        }
    });
    return unsupportedFieldMap;
};

/**
 * @param tableName: table name selected by the user
 * @param fields: ID Fields selected by the user for generating federated id
 * Return a map<field_name,field_label> of mandatory fields not part to ID Fields
 */
SyncTypeUtil.checkRequiredFields = function(tableName, fields) {
    var missingRequiredFieldMap = {};
    var requiredFieldsMap = {
        "sys_user": ["user_name"],
        "sys_user_role": ["name"]
    };
    var requiredFields = requiredFieldsMap[tableName];
    var td = new GlideTableDescriptor(tableName);
    var tableSchema = td.getSchema();
    for (var i = 0; i < requiredFields.length; i++) {
        var requiredField = requiredFields[i];
        if (JSUtil.nil(fields) || fields.split(',').indexOf(requiredField) == -1) {
            missingRequiredFieldMap[requiredField] = tableSchema.get(requiredField).getLabel();
        }
    }
    return missingRequiredFieldMap;
};

/**
 * @param fieldName: column name of the table
 * Return true if the field is a system field or federated_id
 */
SyncTypeUtil.isBlacklistedField = function(fieldName) {
    var blacklistedFields = ['sys_domain_path', 'federated_id', 'sys_id', 'sys_tags', 'sys_class_path', 'sys_class_name', 'sys_mod_count', 'sys_updated_by', 'sys_updated_on', 'sys_created_by', 'sys_created_on'];
    return blacklistedFields.indexOf(String(fieldName)) != -1;
};

/**
 * @param fieldED: Element Descriptor of the column
 * @return: true if the field is eligible for federated id generation
 */
SyncTypeUtil.isSupportedField = function(fieldED) {
    return fieldED.isString() &&
        fieldED.isActive() &&
        !'password'.equals(fieldED.getInternalType()) &&
        !'password2'.equals(fieldED.getInternalType()) &&
        !'user_roles'.equals(fieldED.getInternalType()) &&
        !'user_image'.equals(fieldED.getInternalType()) &&
        !'image'.equals(fieldED.getInternalType()) &&
        !fieldED.isVirtual() &&
        !fieldED.hasAttribute('no_replicate') &&
        !fieldED.hasAttribute('no_data_replicate') &&
        !fieldED.isMetricType() &&
        !fieldED.isEdgeEncrypted();
};

/**
 * @param map: Map<key, value> 
 * @return: comma-separated-string of the map values.
 */
SyncTypeUtil.getCommaSeparatedValues = function(map) {
    var commaSeparatedValue = '';
    Object.keys(map).forEach(function(key) {
        commaSeparatedValue += map[key];
        if (key != Object.keys(map).slice(-1)) {
            commaSeparatedValue += ', ';
        }
    });
    return commaSeparatedValue;
};

SyncTypeUtil.prototype = {
    type: 'SyncTypeUtil'
};
