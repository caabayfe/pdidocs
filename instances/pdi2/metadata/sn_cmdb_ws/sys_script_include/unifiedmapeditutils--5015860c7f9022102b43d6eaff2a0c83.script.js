var UnifiedMapEditUtils = Class.create();
UnifiedMapEditUtils.prototype = {

    EDIT_TYPE_SHOW: "show",
    EDIT_TYPE_HIDE: "hide",
    EDIT_TYPE_UPSERT: "upsert",
    EDIT_TYPE_DELETE: "delete",

    MESSAGE_TEXT: "message",
    MESSAGE_SEVERITY: "severity",
    MESSAGE_TYPE_INFO: "info",
    MESSAGE_TYPE_ERROR: "error",


    initialize: function() {},

    /**
     * Save user edits.  Note that SHOW and HIDE are meaningful only to the
     * displayed map - which applies to all nodes.  As such, this function
     * will only process edge UPSERT and DELETE.
     */
    saveEdits: function(editHistoryEntry) {
        var edges = editHistoryEntry.edges;
        var edgesToUpsert = [];
        var edgesToDelete = [];
        var alerts = {
            info: [],
            error: []
        };

        var pThis = this;
        edges.forEach(function(edge) {
            if (edge.editType === pThis.EDIT_TYPE_DELETE) {
                edgesToDelete.push(edge);
            } else if (edge.editType === pThis.EDIT_TYPE_UPSERT) {
                edgesToUpsert.push(edge);
            }
        });

        var deleteSummary = this._processEdgeDeletes(edgesToDelete, alerts);
        var upsertSummary = this._processEdgeUpserts(edgesToUpsert, alerts);


        this._addSummaryMessage(deleteSummary, upsertSummary, alerts);
        return alerts;
    },

    _processEdgeUpserts: function(edges, alerts) {
        var pThis = this;
        var summary = {
            upsertSuccessCount: 0,
            upsertFailedCount: 0,
            upsertIgnoredCount: 0
        };

        edges.forEach(function(edge) {
            var skipRecord = false;
            var edgeSysId = edge.id;
            var sourceId = edge.sourceId;
            var targetId = edge.targetId;
            var relationshipType = edge.relTypeId;

            if (!pThis._ciExists(sourceId)) {
                pThis._addErrorMessage(gs.getMessage("Specified source CI does not exists, sysid: {0}", [sourceId]), alerts);
                skipRecord = true;
            }
            if (!pThis._ciExists(targetId)) {
                pThis._addErrorMessage(gs.getMessage("Specified target CI does not exists, sysid: {0}", [targetId]), alerts);
                skipRecord = true;
            }
            if (gs.nil(relationshipType)) {
                pThis._addErrorMessage(gs.getMessage("Relationship type not provided"), alerts);
                skipRecord = true;
            }
            if (skipRecord) {
                summary.upsertFailedCount++;
            }

            if (pThis._hasPreexistingEdge(edge)) {
                pThis._addInfoMessage(gs.getMessage("Relationship already exists"), alerts);
                summary.upsertIgnoredCount++;
                skipRecord = true;
            }

            if (skipRecord) {
                return;
            }


            var cmdbRelCiGr = new GlideRecordSecure('cmdb_rel_ci');
            if (!edgeSysId || !cmdbRelCiGr.get(edgeSysId)) {
                cmdbRelCiGr.newRecord();
            }

            cmdbRelCiGr.setValue('parent', sourceId);
            cmdbRelCiGr.setValue('child', targetId);
            cmdbRelCiGr.setValue('type', relationshipType);
            cmdbRelCiGr.update();

            var errMessage = cmdbRelCiGr.getLastErrorMessage();
            if (!gs.nil(errMessage)) {
                pThis._addErrorMessage(gs.getMessage("Failed to update edge, cause: {0}", [errMessage]), alerts);
                summary.upsertFailedCount++;
            } else {
                summary.upsertSuccessCount++;
            }
        });

        return summary;
    },

    _processEdgeDeletes: function(edges, alerts) {
        var pThis = this;
        var summary = {
            deleteSuccessCount: 0,
            deleteFailedCount: 0,
            deleteIgnoredCount: 0
        };

        edges.forEach(function(edge) {
            var edgeSysId = edge.id;
            var cmdbRelCiGr = new GlideRecordSecure('cmdb_rel_ci');
            if (edgeSysId && cmdbRelCiGr.get(edgeSysId)) {
                cmdbRelCiGr.deleteRecord();
                var errMessage = cmdbRelCiGr.getLastErrorMessage();
                if (!gs.nil(errMessage)) {
                    pThis._addErrorMessage(gs.getMessage("Failed to delete edge, cause: {0}", [errMessage]), alerts);
                    summary.deleteFailedCount++;
                } else {
                    summary.deleteSuccessCount++;
                }
            } else {
                pThis._addInfoMessage(gs.getMessage("Unable to locate edge with SysID {0}", [edgeSysId]), alerts);
                summary.deleteIgnoredCount++;
            }
        });

        return summary;
    },

    _hasPreexistingEdge: function(edge) {
        var edgeSysId = edge.id;
        var sourceId = edge.sourceId;
        var targetId = edge.targetId;
        var relationshipType = edge.relTypeId;

        var cmdbRelCiGr = new GlideRecordSecure('cmdb_rel_ci');
        cmdbRelCiGr.addQuery('parent', sourceId);
        cmdbRelCiGr.addQuery('child', targetId);
        cmdbRelCiGr.addQuery('type', relationshipType);
        if (!gs.nil(edgeSysId)) {
            cmdbRelCiGr.addQuery('sys_id', '!=', edgeSysId);
        }
        cmdbRelCiGr.setLimit(1);
        cmdbRelCiGr.query();

        return cmdbRelCiGr.hasNext();
    },

    _addSummaryMessage: function(deleteSummary, upsertSummary, alerts) {
        var message = "Save operation summary: ";
        Object.keys(deleteSummary).forEach(function(key) {
            message += key + '=' + deleteSummary[key] + ',';
        });
        Object.keys(upsertSummary).forEach(function(key) {
            message += key + '=' + upsertSummary[key] + ',';
        });
        message.slice(message.length - 2);
        this._addInfoMessage(message, alerts);
    },

    _addInfoMessage: function(message, alerts) {
        alerts.info.push(this._getMessage(message, this.MESSAGE_TYPE_INFO, alerts));
    },

    _addErrorMessage: function(message, alerts) {
        alerts.error.push(this._getMessage(message, this.MESSAGE_TYPE_ERROR, alerts));
    },

    _getMessage: function(message, severity, alerts) {
        var msgObj = {};
        msgObj[this.MESSAGE_SEVERITY] = severity;
        msgObj[this.MESSAGE_TEXT] = message;
        return msgObj;
    },

    _ciExists: function(ciSysId) {
        var cmdbCiGr = new GlideRecord('cmdb_ci');
        return cmdbCiGr.get(ciSysId);
    }
};
