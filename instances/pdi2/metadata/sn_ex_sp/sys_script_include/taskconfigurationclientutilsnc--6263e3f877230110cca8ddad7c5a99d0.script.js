var TaskConfigurationClientUtilSNC = Class.create();
TaskConfigurationClientUtilSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getTableList: function() {
        var tableName = this.getParameter('sysparm_tablename');
        var columnName = this.getParameter('sysparm_columnname');
        var tables = [];
        var extensions = new TaskConfigurationServerUtil().process(tableName, columnName);

        extensions.forEach(function(ext) {
            var gt = new GlideRecordSecure(ext);
            var table = {};
            table.name = ext;
            table.label = gt.getLabel();
            tables.push(table);
        });

        tables = tables.sort(function(table1, table2) {
            if (table1.label > table2.label) return 1;
            if (table1.label < table2.label) return -1;
        });

        return new global.JSON().encode({
            columnType: this.getFieldType().columnType,
            tables: tables
        });
    },
    getFieldType: function() {
        var tableName = this.getParameter('sysparm_tablename');
        var columnName = this.getParameter('sysparm_columnname');

        var gr = new GlideRecordSecure(tableName);
        var glideElement = gr.getElement(columnName);
        var descriptor = glideElement.getED();
        var columnType = descriptor.getInternalType();

        return new global.JSON().encode({
            columnType: columnType
        });
    },

    isNonTaskTable: function() {
        var table = this.getParameter('sysparm_table');
        var extensions = new GlideTableHierarchy('task').getAllExtensions();
        if (extensions.indexOf(table) == -1)
            return true;
        return false;
    },

    type: 'TaskConfigurationClientUtilSNC'
});
