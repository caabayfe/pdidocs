var ProminUIActionClient = Class.create();
ProminUIActionClient.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getRelatedProcessConfigList: function() {
        var modelDefTable = this.getParameter("sysparm_modelDefTable");
        var grProcessConfig = new GlideRecordSecure('promin_process_def');
        if (grProcessConfig.get("table", modelDefTable)) {
            return '/' + grProcessConfig.getLink();
        } else {
            return '/' + grProcessConfig.getTableName() + "_list.do";
        }
    },
    isAuditEnabledTable: function(table) {
        if (!table) {
            table = this.getParameter("sysparm_table");
        }
        if (this._isExternalTable(table)) {
            return true;
        }
        if (this._isArchivedTable(table)) {
            return true;
        }
        var sysDictGr = new GlideRecord("sys_dictionary");
        sysDictGr.addQuery("name", table);
        sysDictGr.addQuery("internal_type", "collection");
        sysDictGr.addQuery("audit", true);
        sysDictGr.setLimit(1);
        sysDictGr.query();
        return sysDictGr.hasNext();
    },
    _isExternalTable: function(table) {
        var grDataSet = new GlideRecord("sn_po_extdata_dataset");
        if (grDataSet.isValid()) {
            grDataSet.addQuery("status", "READY");
            grDataSet.addQuery("case_table", table);
            grDataSet.setLimit(1);
            grDataSet.query();
            return grDataSet.hasNext();
        } else {
            return false;
        }
    },
    _isArchivedTable: function(table) {
        var entity = new GlideRecord("promin_project_entity");
        entity.addQuery('table', table);
        entity.addQuery('source_type', 'ARCHIVED_DATA');
        entity.query();
        return entity.hasNext();
    },
    type: 'ProminUIActionClient'
});
