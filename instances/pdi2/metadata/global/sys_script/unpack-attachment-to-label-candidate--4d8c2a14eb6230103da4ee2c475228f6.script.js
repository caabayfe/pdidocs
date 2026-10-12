(function executeRule(current, previous /*null when async*/ ) {
    function getAttachmentContent(attachment) {
        var is = new GlideSysAttachment().getContentStream(attachment.getValue('sys_id'));
        var reader = new GlideTextReader(is);
        var docString = "";
        while ((ln = reader.readLine()) != null) {
            docString = docString + ln;
        }
        var parsedData = JSON.parse(docString);
        gs.debug('[ACLE] Report attachment content loaded: ' + docString.substring(0, 200) + '...');
        return parsedData;
    }
	
	
    gs.debug('[ACLE] Attachment inserted ' + current.table_sys_id);
    try {
        var definitionId = current.getValue('table_sys_id');
        var modelArtifactRecord = new GlideRecord("ml_model_artifact");
        modelArtifactRecord.get(definitionId);
        
        //constants
        var ACTIVE_LEARNING_REPORT = "active_learning_report";
        var ML_LABEL_CANDIDATE_TABLE = "labelling_candidates_table";
        var ROWS_KEY = "rows";
        var ADD_KEY = "add";
        var DELETE_KEY = "delete";
        var UPDATE_KEY = "update";

        if (modelArtifactRecord.getValue("model_id") == ACTIVE_LEARNING_REPORT) {
            var parsedData = getAttachmentContent(current);
            if (parsedData) {

                // Add section
                if (ADD_KEY in parsedData && ROWS_KEY in parsedData.add) {
                    parsedData.add.rows.forEach(MLLabelCandidate.createRecord);
                }
                
                // Delete section
                if (((DELETE_KEY in parsedData) && (ML_LABEL_CANDIDATE_TABLE in parsedData[DELETE_KEY]) && (ROWS_KEY in parsedData[DELETE_KEY][ML_LABEL_CANDIDATE_TABLE]))) {
                    var sysIdList = [];
                    parsedData[DELETE_KEY][ML_LABEL_CANDIDATE_TABLE][ROWS_KEY].forEach(function(obj){sysIdList.push(obj["sys_id"]);});
                    filter = "sys_id IN ".concat(sysIdList.toString());
                    MLLabelCandidate.deleteRecords(filter);
                }
                
                // Update section
                if (((UPDATE_KEY in parsedData) && (ML_LABEL_CANDIDATE_TABLE in parsedData[UPDATE_KEY]) && (ROWS_KEY in parsedData[UPDATE_KEY][ML_LABEL_CANDIDATE_TABLE]))) {
                    parsedData[UPDATE_KEY][ML_LABEL_CANDIDATE_TABLE][ROWS_KEY].forEach(function(obj) {
                        new MLLabelCandidate(obj["sys_id"]).updateData(obj);
                    });
                }
            }
        }

    } catch (e) {
        gs.warn('[ACLE] Error processing attachment report: ' + e.message + ' \n' + JSON.stringify(e, null, 2));
    }
})(current, previous);
