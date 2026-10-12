var TableExtensionsProcessor = Class.create();
TableExtensionsProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * Check if table extends another table.
     */
    doesTableExtend: function() {
        var tableName = this.getParameter('sysparm_table_name');
        var baseTableName = this.getParameter('sysparam_base_table_name');
        return this._doesExtend(tableName, baseTableName);
    },

    /**
     * Check if table extends specified base table
     */
    _doesExtend: function(tableName, baseTableName) {
        var objectGR = new GlideRecord('sys_db_object');
        if (!objectGR.canRead()) {
            MobileMessageUtil.addSecurityErrorForTable('sys_db_object');
            return false;
        }

        objectGR.get('name', tableName);
        var parentTable = objectGR.super_class;
        while (parentTable) {
            if (parentTable.name == baseTableName)
                return true;

            parentTable = parentTable.super_class;
        }
        return false;
    },

    type: 'TableExtensionsProcessor'
});
