var cxs_TableFieldTypes = Class.create();
cxs_TableFieldTypes.prototype = {
    _FIELD_TYPE_ARRAY: [ "string", "string_full_utf8" ],
    _FIELD_TYPE_MAP: {
        "string": true,
        "string_full_utf8": true
    },

    process: function() {
        return this._FIELD_TYPE_ARRAY;
    },

    isValid: function(fieldType) {
        return this._FIELD_TYPE_MAP[fieldType + ""] ? true : false;
    },

    type: 'cxs_TableFieldTypes'
}
