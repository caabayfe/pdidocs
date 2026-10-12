var ZTSDEvalIncidentCloneUtil = Class.create();
ZTSDEvalIncidentCloneUtil.prototype = {
    initialize: function() {
        this.INCIDENT_TABLE = "incident";
        this.AIA_CLONE_RECORDS_MAPPING_TABLE = "aia_clone_records_mapping";
        this.SYS_AUDIT_TABLE = "sys_audit";
        this.SYS_ATTACHMENT_TABLE = "sys_attachment";

        this.ASSIGNED_TO_FIELD = "assigned_to";
        this.DESCRIPTION_FIELD = "description";
        this.SHORT_DESCRIPTION_FIELD = "short_description";
        this.SYS_CREATED_ON_FIELD = "sys_created_on";

        // SYS_ATTACHMENT_FIELDS
        this.TABLE_NAME = "table_name";
        this.TABLE_SYS_ID = "table_sys_id";
        this.FILE_NAME = "file_name";
        this.CONTENT_TYPE = "content_type";

        // AIA CLONE MAPPING FIELDS
        this.BATCH_RUN_FIELD = "batch_run";
        this.SOURCE_DOCUMENT_TABLE_FIELD = "source_document_table";
        this.SOURCE_DOCUMENT_ID_FIELD = "source_document_id"
        this.TARGET_DOCUMENT_ID_FIELD = "target_document_id";
        this.TARGET_DOCUMENT_TABLE_FIELD = "target_document_table";

        // SYS AUDIT FIELDS
        this.TABLENAME = "tablename";
        this.DOCUMENT_KEY = "documentkey";
        this.FIELD_NAME = "fieldname";
        this.OLD_VALUE = "oldvalue";
    },

    getSupportedAgents: function() {
        return "793518d12f397610940c232bcfa4e340";
    },

    getEvalSamplingMetaData: function(workerId) {
        if (!workerId) {
            return null;
        }

        var aiAgentAPI = new sn_skill_builder.AIAgentAPI();
        return aiAgentAPI.getEventSamplingPayloadFromWorker(workerId);
    },

    canCreateRecord: function(sourceTable) {
        var gr = new GlideRecord(sourceTable);
        return gr.canCreate();
    },

    cloneRecords: function(usecaseId, table, maxRowLimit, filter, batchRunId) {
        var script = "new global.ZTSDEvalIncidentCloneUtil().cloneRecordsInGlobalScope('" + usecaseId + "','" + table + "'," + maxRowLimit + ",'" + filter + "','" + batchRunId + "');";
        var map = new Packages.java.util.HashMap();
        var clonedRecordsIdList = new GlideEvaluator().evaluateStringWithGlobals(script, map) || {};

        return clonedRecordsIdList ? clonedRecordsIdList : null;
    },

    cloneRecordsInGlobalScope: function(usecaseId, table, maxRowLimit, filter, batchRunId) {
        var cloneMetaData = this.getEvalSamplingMetaData(usecaseId);
        var isCloningNeeded = cloneMetaData ? (cloneMetaData).is_sample_cloning_needed : true;
        if (!isCloningNeeded)
            return null;
        var clonedRecordsIdList = this.copyRecords(usecaseId, cloneMetaData, table, maxRowLimit, filter, batchRunId);

        return clonedRecordsIdList ? clonedRecordsIdList : null;
    },

    isFieldAvailable: function(tableName, fieldName) {
        var gr = new GlideRecord(tableName);
        return gr.isValidField(fieldName);
    },

    copyRecords: function(usecaseId, cloneMetadata, table, maxRowLimit, filter, batchRunId) {

        if (!this.canCreateRecord(table))
            return null;

        var fieldOverrides = (cloneMetadata || {}).field_overrides || {};
        var fieldsToClone = (cloneMetadata || {}).fields_to_predict || [];
        var clonedRecordsIdList = [];
        var sourceGR = new GlideRecord(table);
        sourceGR.addEncodedQuery(filter);
        sourceGR.setLimit(maxRowLimit);
        sourceGR.query();

        // TO DO: This has to come from worker confid
        var excludedColumns = [];
        if (table == "incident") {
            excludedColumns = this.fetchExcludedColumnsForIncidentTable();
        }
        if (this.isFieldAvailable(table, this.ASSIGNED_TO_FIELD)) {
            var assigned_to = this.getAssignedToFromSpecialist(usecaseId);
            if (assigned_to) {
                fieldOverrides.assigned_to = assigned_to;
            }
        }

        // Set the value of state and incident_state to New Explicitly
        fieldOverrides.state = 1;
        fieldOverrides.incident_state = 1;

        while (sourceGR.next()) {
            try {
                var clonedRecordId = this.copyRecordFromSourceToTarget(sourceGR, table, fieldOverrides, batchRunId, excludedColumns, fieldsToClone);
                if (clonedRecordId)
                    clonedRecordsIdList.push(clonedRecordId);
            } catch (e) {
                gs.error("AISpecialistCloneSampleRecordsUtility: Error cloning record " + sourceGR.getUniqueValue() + ": " + e.message);
            }
        }
        if (clonedRecordsIdList.length > 0)
            return clonedRecordsIdList.toString();
        return null;
    },

    copyRecordFromSourceToTarget: function(srcGr, targetTable, newProps, batchRunId, excludedColumns = [], fieldsToClone = []) {
        var gr = new GlideRecord(targetTable);
        gr.initialize();
        var fieldList = [];
        var elementList = srcGr.getElements();

        if (fieldsToClone.length != 0) {
            fieldList = fieldsToClone;
        } else if (typeof elementList.size != 'undefined') {
            // we are in global scope, so iterate
            for (var i = 0; i < elementList.size(); i++) {
                var element = elementList.get(i);
                fieldList.push(element.getName());
            }
        } else {
            // we are in app scope, so loop over the array
            elementList.forEach(function(element) {
                fieldList.push(element.getName());
            });
        }

        var fieldsToExclude = ["sys_class_name", "sys_update_name", "sys_updated_on", "sys_updated_by", "sys_created_on", "sys_created_by", "sys_id", "sys_mod_count", "sys_tags"];
        if (Array.isArray(excludedColumns)) {
            fieldsToExclude = fieldsToExclude.concat(excludedColumns);
        }
        fieldList.forEach(function(field) {
            if (fieldsToExclude.includes(field)) {
                return;
            }
            gr.setValue(field, srcGr.getValue(field));
        });

        //override some of the fields in source record while copying
        for (var key in newProps) {
            gr.setValue(key, newProps[key]);
        }

        // Fetch original values for Short description and description
        var originalShortDesc = this.getOriginalFieldValue(targetTable, srcGr.getUniqueValue(), this.SHORT_DESCRIPTION_FIELD);
        if (originalShortDesc) {
            gr.setValue(this.SHORT_DESCRIPTION_FIELD, originalShortDesc);
        }
        var originalDescription = this.getOriginalFieldValue(targetTable, srcGr.getUniqueValue(), this.DESCRIPTION_FIELD);
        if (originalDescription) {
            gr.setValue(this.DESCRIPTION_FIELD, originalDescription);
        }

        gr.setWorkflow(false);
        var clonedRecordId = gr.insert();

        if (clonedRecordId) {
            if (!this.addRecordMapping(batchRunId, srcGr.getTableName(), srcGr.getUniqueValue(), targetTable, clonedRecordId)) {
                return null;
            }
            this.copyAttachmentsExistedAtIncidentCreation(srcGr, gr);
            return clonedRecordId;
        }
        return null;
    },

    addRecordMapping: function(batchRunId, sourceDocumentTableName, sourceDocumentId, targetDocumentTableName, targetDocumentId) {
        var mappingGR = new GlideRecord(this.AIA_CLONE_RECORDS_MAPPING_TABLE);
        mappingGR.initialize();
        mappingGR.setValue(this.BATCH_RUN_FIELD, batchRunId);
        mappingGR.setValue(this.SOURCE_DOCUMENT_TABLE_FIELD, sourceDocumentTableName);
        mappingGR.setValue(this.SOURCE_DOCUMENT_ID_FIELD, sourceDocumentId);
        mappingGR.setValue(this.TARGET_DOCUMENT_TABLE_FIELD, targetDocumentTableName);
        mappingGR.setValue(this.TARGET_DOCUMENT_ID_FIELD, targetDocumentId);
        return mappingGR.insert();
    },

    // TO DO: This has to come from worker confid
    fetchExcludedColumnsForIncidentTable: function() {
        var excludedColumns = ["number", "state", "assignment_group", "incident_state", "close_code", "close_notes", "closed_by", "closed_at", "resolved_by", "resolved_at", "reopened_time", "reopened_by", "notify", "hold_reason", "origin_table", "work_notes_list", "approval_history", "comments", "work_notes", "follow_up", "time_worked", "additional_assignee_list", "universal_request", "route_reason", "business_duration", "expected_start", "delivery_task", "rejection_goto", "work_start", "upon_reject", "delivery_plan", "cause", "business_stc", "sla_due", "route_reason", "correlation_display", "due_date", "service_offering", "calendar_duration", "reassignment_count"];
        return excludedColumns;
    },

    // TO DO this has to come from worker config
    getAssignedToFromSpecialist: function(workerId) {
        var aiAgentAPI = new sn_skill_builder.AIAgentAPI();
        return aiAgentAPI.getUserFromWorker(workerId);
    },

    getOriginalFieldValue: function(tableName, recordSysId, fieldName) {
        var auditGR = new GlideRecord("sys_audit");
        auditGR.addQuery(this.TABLENAME, tableName);
        auditGR.addQuery(this.DOCUMENT_KEY, recordSysId);
        auditGR.addQuery(this.FIELD_NAME, fieldName);
        auditGR.orderBy(this.SYS_CREATED_ON_FIELD); // oldest first
        auditGR.setLimit(1);
        auditGR.query();
        if (auditGR.next()) {
            return auditGR.getValue(this.OLD_VALUE);
        }
        return ""; // no audit record found
    },

    copyAttachmentsExistedAtIncidentCreation: function(sourceIncidentGR, clonedIncidentGR) {
        try {
            var incidentCreatedTime = new GlideDateTime(sourceIncidentGR.getValue(this.SYS_CREATED_ON_FIELD));

            var startTime = new GlideDateTime(incidentCreatedTime.getValue());
            startTime.add(-120000);

            var endTime = new GlideDateTime(incidentCreatedTime.getValue());
            endTime.add(300000);

            var attachmentGR = new GlideRecord(this.SYS_ATTACHMENT_TABLE);
            attachmentGR.addQuery(this.TABLE_NAME, this.INCIDENT_TABLE);
            attachmentGR.addQuery(this.TABLE_SYS_ID, sourceIncidentGR.getUniqueValue());
            attachmentGR.addQuery(this.SYS_CREATED_ON_FIELD, '>=', startTime);
            attachmentGR.addQuery(this.SYS_CREATED_ON_FIELD, '<=', endTime);
            attachmentGR.orderBy(this.SYS_CREATED_ON_FIELD);
            attachmentGR.query();

            var gsa = new GlideSysAttachment();
            var copiedCount = 0;
            while (attachmentGR.next()) {
                var attachmentStream = gsa.getContentStream(attachmentGR.getUniqueValue());
                if (attachmentStream != null) {
                    var newAttId = gsa.writeContentStream(
                        clonedIncidentGR,
                        attachmentGR.getValue(this.FILE_NAME),
                        attachmentGR.getValue(this.CONTENT_TYPE),
                        attachmentStream
                    );
                    if (newAttId) {
                        copiedCount++;
                        gs.debug('Copied: ' + attachmentGR.getValue(this.FILE_NAME));
                    }
                }
            }

            if (copiedCount > 0) {
                gs.debug('Copied ' + copiedCount + ' attachments to ' + clonedIncidentGR.getUniqueValue());
            } else {
                gs.debug('No attachments found in creation window for ' + sourceIncidentGR.getUniqueValue());
            }

        } catch (e) {
            gs.error("Attachments duplication error: " + e);
        }
    },

    type: 'ZTSDEvalIncidentCloneUtil'
};
