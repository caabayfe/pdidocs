var CMDBDynamicIREFeatureSetTableField = Class.create();
CMDBDynamicIREFeatureSetTableField.prototype = {

    FEATURE: 'feature',

    initialize: function() {},

    process: function(tableName) {
        var fields = [];
        var td = new GlideRecord(tableName);

        if (td.isValid())
            for (var el in td.getElements())
                if (el.getColumnName().startsWith(this.FEATURE))
                    fields.push(el.getColumnName());

        return fields;
    },

    type: 'CMDBDynamicIREFeatureSetTableField'
};
