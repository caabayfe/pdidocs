var KMRecordPageUtilsSNC = Class.create();
KMRecordPageUtilsSNC.prototype = {
    PREFIX: "KMRecordPageScratchpad_",

    initialize: function() {},

    setEmbeddedQueries: function(recordSysId, fields) {
        var key = this.PREFIX + recordSysId;
        var fieldNamesList = [];
        for (var fieldName in fields) {
            fieldNamesList.push(fieldName);
            gs.getSession().putClientData(key + "_" + fieldName, fields[fieldName]);
        }
        gs.getSession().putClientData(key, fieldNamesList.join(','));
    },

    getEmbeddedQueries: function(recordSysId) {
        var key = this.PREFIX + recordSysId;
        var fieldNamesList = gs.getSession().getClientData(key);

        var outputFields = {};
        if (!gs.nil(fieldNamesList)) {
            var fieldNames = fieldNamesList.split(',');
            for (var i = 0; i < fieldNames.length; i++) {
                var fieldKey = key + "_" + fieldNames[i];
                var fieldContent = gs.getSession().getClientData(fieldKey);
                outputFields[fieldNames[i]] = fieldContent;
                // Should be cleared out of the session once used but will keep it for now to support a form glitch
                //  where HTML editors won't load on the form and have to refresh manually.
                // gs.getSession().putClientData(fieldKey, null);
            }
            // gs.getSession().putClientData(key, null);
            return outputFields;
        }
        return null;
    },

    type: 'KMRecordPageUtilsSNC'
};
