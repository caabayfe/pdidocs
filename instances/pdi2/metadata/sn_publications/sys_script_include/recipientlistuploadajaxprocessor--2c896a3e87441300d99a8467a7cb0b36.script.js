var RecipientListUploadAJAXProcessor = Class.create();
RecipientListUploadAJAXProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * Start the Scripted Hierarchical Worker if one does not already exist.
     */
    start: function() {

        var totalRecords = this.getParameter("sysparm_ajax_processor_entity_record_count");
        
        // Validate before starting the worker
        var validationResult = this._validate(totalRecords);
        if (validationResult !== 'success') {
            return validationResult;
        }
        
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Uploading file"));
        worker.setScriptIncludeName("sn_publications.RecipientListUploadProcessor");
        worker.setScriptIncludeMethod("trackValidateUploadProgress");
        worker.putMethodArg("totalRecords", totalRecords + "");
        worker.setBackground(true);
        worker.start();
        return worker.getProgressID();
    },

    validateUpload: function() {
        var totalRecords = this.getParameter('sysparm_total_records');
        return this._validate(totalRecords);
    },

    _validate: function(totalRecords) {
        var maxRecords = parseInt(gs.getProperty("sn_publications.max_recipient_list_file_upload_records"));
        if (parseInt(totalRecords) > maxRecords) {
            return gs.getMessage("The file exceeds the maximum number of records. Reduce the number of records and upload again.");
        }

        // --- Per-User Concurrency Limit ---
        var maxUploads = parseInt(gs.getProperty("sn_publications.max_worker_per_user"));

        var activeWorkers = new GlideAggregate("sys_progress_worker");
        activeWorkers.addQuery("sys_created_by", gs.getUserName());
        activeWorkers.addQuery("state", "IN", "running,starting"); 
        activeWorkers.addQuery("name", gs.getMessage("Uploading file"));
        activeWorkers.addAggregate("COUNT");
        activeWorkers.query();
        var activeWorkerCount = activeWorkers.next() ? parseInt(activeWorkers.getAggregate("COUNT")) : 0;

        if (activeWorkerCount >= maxUploads) {
            return gs.getMessage("You have reached the maximum number of uploads. Please wait for existing uploads to complete.");
        }
       
        // Return success if validation passes
        return 'success';
    },

    type: 'RecipientListUploadAJAXProcessor'
});
