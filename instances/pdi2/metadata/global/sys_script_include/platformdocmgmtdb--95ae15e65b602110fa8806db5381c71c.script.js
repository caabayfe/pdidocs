var PlatformDocMgmtDB = Class.create();

PlatformDocMgmtDB.prototype = {

    document_version_table: "ds_document_version",
    document_approver_table: "ds_document_approver",
    document_reviewer_table: "ds_document_reviewer",

    initialize: function() {
        this.platformDocMgmt = new PlatformDocMgmt();
    },

    getLatestVersionByDocument: function(documentId) {
        var versionGR = new GlideRecord(this.document_version_table);
        versionGR.addQuery("document", documentId);
        versionGR.orderByDesc("sys_created_on");
        versionGR.query();
        if (versionGR.next())
            return this.platformDocMgmt.createObject(versionGR);
        return false;
    },

    getVersionById: function(versionId) {
        return this.getRecordById(versionId, this.document_version_table);
    },
    getVersionCount: function(documentId) {
        var gr = new GlideRecord("ds_document_version");
        gr.addQuery("document", documentId);
        gr.query();
        var count = gr.getRowCount();
        return count;
    },
    getVersionsByDocumentId: function(documentId) {
        var versions = new Array();
        var versionGR = new GlideRecord(this.document_version_table);
        versionGR.addQuery("document", documentId);
        versionGR.query();
        while (versionGR.next()) {
            versions.push(this.platformDocMgmt.createObject(versionGR));
        }
        return versions;
    },

    /**
     * Generic function that inserts an record into a table based on the data contained in the object
     * Object's field must match the table fields 
     * 
     * @param Object object
     * @param String tableName
     * @returns string|boolean (sys_id|false)
     */
    insert: function(object, tablename) {
        var insertGR = new GlideRecord(tablename);
        this.platformDocMgmt.populateGlideRecordAttributesWithObjectAttributes(insertGR, object);
        return insertGR.insert();
    },

    /**
     * Generic method that gets a record from a database table (tableName) with the given sysId
     *  
     * @param String sysId
     * @param String tableName
     * @returns GlideRecord|boolean (glideRecord|false)
     */
    getRecordById: function(sysId, tableName) {
        var glideRecord = new GlideRecord(tableName);
        glideRecord.addQuery('sys_id', sysId);
        glideRecord.query();

        if (glideRecord.next()) {
            return glideRecord;
        }

        return false;
    },

    getNumberOfReviewers: function(documentId) {
        var reviewersGr = new GlideRecord(this.document_reviewer_table);
        reviewersGr.addQuery("document", documentId);
        reviewersGr.query();
        return reviewersGr.getRowCount();
    },

    getNumberOfApprovers: function(documentId) {
        var approverGr = new GlideRecord(this.document_approver_table);
        approverGr.addQuery("document", documentId);
        approverGr.query();
        return approverGr.getRowCount();
    },

    type: 'PlatformDocMgmtDB'
};
