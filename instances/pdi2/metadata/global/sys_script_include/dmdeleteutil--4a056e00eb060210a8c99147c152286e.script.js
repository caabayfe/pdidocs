var DMDeleteUtil = Class.create();
DMDeleteUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    //support call from client side
    hasRollbackExcludedTables: function() {
        var sysId = this.getParameter('sysparm_sysId');
        var tablename = this.getParameter('sysparm_tablename');
        return this.getRollbackExcludedTables(sysId, tablename);
    },

    getRollbackExcludedTables: function(dmDeleteSysId, tablename) {
        var list = [];
        var arrayUtil = new global.ArrayUtil();
        var dmAPI = new SNC.DataManagementAPI();
        if (dmAPI.isTableExcludedFromRollback(tablename))
            list.push(tablename);

        //check the preview cascade tables
        if (!dmDeleteSysId.nil()) {
            var previewGr = new GlideRecord("sys_dm_delete_count");
            previewGr.addQuery("dm_delete", dmDeleteSysId);
            previewGr.query();
            while (previewGr.next()) {
                var table = previewGr.getValue("table");
                if (dmAPI.isTableExcludedFromRollback(table) && !arrayUtil.contains(list, table))
                    list.push(table);
            }
        }

        return list.toString();
    },

    type: 'DMDeleteUtil'
});
