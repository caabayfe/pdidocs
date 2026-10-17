var CMDBDynamicIREFeatureTableField = Class.create();
CMDBDynamicIREFeatureTableField.prototype = {

    DEFAULT_TABLE: 'cmdb_ci',
    DUPLICATE_OF: 'duplicate_of',
    SYS_FIELD: 'sys_',

    initialize: function() {},

    process: function(tableName) {
        var references = [];
        var td = new GlideTableDescriptor.get(tableName || this.DEFAULT_TABLE);
        if (!td.isValid())
            return references;

        var elements = td.getSchemaList();
        for (var i = 0; i < elements.size(); i++) {
            var el = elements.get(i);
			var name = el.getName();
            if (el.isReference() && name != this.DUPLICATE_OF && !name.startsWith(this.SYS_FIELD))
                references.push(name);
        }

		references.push('sys_id');
        return references;
    },

    type: 'CMDBDynamicIREFeatureTableField'
};
