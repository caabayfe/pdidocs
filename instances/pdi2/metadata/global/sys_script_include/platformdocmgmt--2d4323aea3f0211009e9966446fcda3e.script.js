var PlatformDocMgmt = Class.create();
var DOCUMENT_CREATION_ERROR = "Cannot create document record - ";
var DOCUMENT_CREATION_SUCCESS = "Document created successfully";
PlatformDocMgmt.prototype = {
    initialize: function() {
        this.tableDescriptors = new Array();
    },

    /**
     * This method will compare two objects by checking that their attributes are equals.
     * If the attributes array is provided, it will then check only the attributes that are in the array.
     * Otherwise, it will check all their attributes.
     * 
     * @param Object object1
     * @param Object object2
     * @param Array attributes
     * @return Boolean 
     */
    areObjectAttributesEqual: function(object1, object2, attributes) {
        if (!attributes || attributes.length == 0) {
            attributes = new Array();
            for (attribute in object1) {
                attributes.push(attribute);
            }
        }

        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (object1[attribute] != object2[attribute]) {
                return false;
            }
        }
        return true;
    },

    _getTableDescriptor: function(tablename) {
        if (this.tableDescriptors[tablename]) {
            return this.tableDescriptors[tablename];
        }

        this.tableDescriptors[tablename] = new GlideTableDescriptor(tablename);
        return this.tableDescriptors[tablename];
    },

    createObject: function(glideRecord) {
        var tableDescriptor = this._getTableDescriptor(glideRecord.getTableName());
        var fields = this._getFieldNamesFromString(tableDescriptor.getSchema());
        var object = new Object();
        object.scriptType = glideRecord.getTableName();
        for (var i = 0; i < fields.length; i++) {
            object[fields[i]] = glideRecord.getValue(fields[i]);
        }
        return object;
    },

    _getFieldNamesFromString: function(fieldsString) {
        var fields = new Array();
        fieldsString = fieldsString.toString().replace("{", "");
        fieldsString = fieldsString.replace("}", "");
        var tmpfields = fieldsString.toString().split(",");
        for (var i = 0; i < tmpfields.length; i++) {
            var fieldNameArray = tmpfields[i].toString().split("=");
            var fieldName = fieldNameArray[1].toString();
            fields.push(fieldName);
        }
        return fields;
    },

    populateGlideRecordAttributesWithObjectAttributes: function(glideRecord, object) {
        var tableDescriptor = this._getTableDescriptor(glideRecord.getTableName());
        var fields = this._getFieldNamesFromString(tableDescriptor.getSchema());
        object.scriptType = glideRecord.getTableName();
        for (var i = 0; i < fields.length; i++) {
            if (object[fields[i]]) {
                glideRecord.setValue(fields[i], object[fields[i]]);
            }
        }
        return glideRecord;
    },

    type: 'PlatformDocMgmt'
};

PlatformDocMgmt.canVersionBeSubmitted = function(documentVersionGR) {
    if (documentVersionGR.version_state == "draft")
        return true;
    return false;
};
PlatformDocMgmt.isLatestVersion = function(versionId, documentId) {
    var db = new PlatformDocMgmtDB();
    var latestVersion = db.getLatestVersionByDocument(documentId);
    if (latestVersion.sys_id == versionId)
        return true;
    else
        return false;
};

PlatformDocMgmt.publishVersion = function(versionId, documentId) {
    var documentMgmtDB = new PlatformDocMgmtDB();

    var version = documentMgmtDB.getVersionById(versionId);
    var versions = documentMgmtDB.getVersionsByDocumentId(documentId);

    for (var i = 0; i < versions.length; i++) {
        if (versions[i].sys_id == version.getUniqueValue()) {
            continue;
        }

        var versionGR = documentMgmtDB.getVersionById(versions[i].sys_id);
        PlatformDocMgmt.cancelWorkflow(versionGR, "Review and Approval Workflow for Document Version");
        versionGR.setValue("version_state", "retired");
        versionGR.update();
    }

    PlatformDocMgmt.setDefaultVersion(versionId, documentId);

    version.setValue("version_state", "published");
    return version.update();
};

PlatformDocMgmt.notifyDocumentOwner = function(documentSysId, versionSysId) {

    var documentGr = new GlideRecord("ds_document");
    if (!documentGr.get(documentSysId))
        return;

    var owner = documentGr.getValue("owner");
    if (!owner)
        return;

    gs.eventQueue(
        "ds.document.version.added.to.expired",
        documentGr,
        owner,
        versionSysId
    );

};

PlatformDocMgmt.submitVersion = function(versionId, documentId) {
    var documentGr = GlideRecord("ds_document");
    documentGr.get(documentId);
    documentGr.setValue("state", "active");
    documentGr.update();

    var documentDB = new PlatformDocMgmtDB();
    var numberOfApprovers = documentDB.getNumberOfApprovers(documentId);
    var numberOfReviewers = documentDB.getNumberOfReviewers(documentId);

    var versionGr = GlideRecord("ds_document_version");
    versionGr.get(versionId);
    if (numberOfReviewers > 0) {
        versionGr.version_state = "awaiting_review";
    } else if (numberOfReviewers == 0 && numberOfApprovers > 0) {
        versionGr.version_state = "awaiting_approval";
    } else {
        versionGr.version_state = "awaiting_review";
    }
    return versionGr.update();
};

PlatformDocMgmt.cancelWorkflow = function(record, flowName) {
    var flow = new GlideRecord("sys_flow_context");
    flow.addQuery('name', flowName);
    flow.addQuery('source_record', record.getUniqueValue());
    flow.addEncodedQuery('stateINWAITING,IN_PROGRESS,QUEUED');
    flow.query();
    while (flow.next()) {
        sn_fd.FlowAPI.cancel(flow.getUniqueValue(), 'Canceling this flow');
    }
};

PlatformDocMgmt.setDefaultVersion = function(versionId, documentId) {
    var docGR = new GlideRecord("ds_document");
    if (docGR.get(documentId)) {
        docGR.setValue("default_version", versionId);
        docGR.update();
    }
};
/**
 * This method will create a document record, create a version for that document record and 
 * link this documnet record to a parent record.
 * 
 * @param String documentName - name of the document
 * @param String documentOwner - owner of the document 
 * @param String parentRecordTableName - table name of the record to which we need to link this document
 * @param String parentRecordSysId - sys_id of the record to which we need to link this document
 * @param Object documentFields - Key, Value map of additional fields in ds_document table. This is an optional param
 *   
 * @return Object with message, status, documentSysId, documentVersionSysId, referenceRecordSysId
 */
PlatformDocMgmt.createDocument = function(documentName, documentOwner, parentRecordTableName, parentRecordSysId, documentFields) {
    var response = {};
    if (!documentName || !documentOwner || !parentRecordTableName || !parentRecordSysId) {
        response["message"] = DOCUMENT_CREATION_ERROR + "One or more mandatory parameters are NULL or Empty.";
        response["status"] = "failure";
        return response;
    }

    var parentRecordGr = new GlideRecordSecure(parentRecordTableName);
    if (!parentRecordGr.get(parentRecordSysId)) {
        response["message"] = DOCUMENT_CREATION_ERROR + "Cannot find record with sys_id " + parentRecordSysId + " in " + parentRecordTableName + " table";
        response["status"] = "failure";
        return response;
    }

    var documentRecordSysId = null;
    var versionRecordSysId = null;
    var referenceRecordSysId = null;
    try {
        var docGr = new GlideRecordSecure("ds_document");
        docGr.setWorkflow("false");
        docGr.initialize();
        docGr.name = documentName;
        docGr.owner = documentOwner;
        documentRecordSysId = docGr.insert();
        if (documentFields) {
            var docMgmt = new PlatformDocMgmt();
            docMgmt.populateGlideRecordAttributesWithObjectAttributes(docGr, documentFields);
        }
        docGr.update();

        // updating "application" column using GlideRecord since there is a strict ACL on that column
        docGr = new GlideRecord("ds_document");
        if (docGr.get(documentRecordSysId)) {
            if (documentFields && documentFields["application"])
                docGr.application = documentFields["application"];
            else
                docGr.application = "global";
            docGr.update();
        }

        var versionGr = new GlideRecordSecure("ds_document_version");
        versionGr.setWorkflow("false");
        versionGr.initialize();
        versionGr.document = documentRecordSysId;
        versionRecordSysId = versionGr.insert();

        var referenceGr = new GlideRecordSecure("ds_document_references");
        referenceGr.setWorkflow("false");
        referenceGr.initialize();
        referenceGr.document = documentRecordSysId;
        referenceGr.table_name = parentRecordTableName;
        referenceGr.target_record = parentRecordSysId;
        referenceRecordSysId = referenceGr.insert();

        response["documentSysId"] = documentRecordSysId;
        response["documentVersionSysId"] = versionRecordSysId;
        response["referenceRecordSysId"] = referenceRecordSysId;
        response["message"] = DOCUMENT_CREATION_SUCCESS;
        response["status"] = "success";
        return response;
    } catch (ex) {
        if (documentRecordSysId) {
            docGr = new GlideRecordSecure("ds_document");
            docGr.get(documentRecordSysId);
            docGr.deleteRecord();
        }
        response["message"] = DOCUMENT_CREATION_ERROR + ex;
        response["status"] = "failure";
        return response;
    }
};
