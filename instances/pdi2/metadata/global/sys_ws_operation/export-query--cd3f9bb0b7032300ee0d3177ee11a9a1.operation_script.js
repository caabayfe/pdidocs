(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryList = request.queryParams.queryID + "";
	queryList = queryList.split(',');
	
	var exported = [];
	var newUpdateSetName = 'QueryExport ' + new GlideDateTime().toString();
	var exportSysId = "";
	var exporterlogger = {

        init: function() {
            this.exportlog = '';
        },

        log: function(logMessage) {
            var formattedMsg = 'LOG: ' + logMessage + '\n';
            this.exportlog = this.exportlog + formattedMsg;
            gs.log(formattedMsg);
        },
        error: function(errorMessage){
            var formattedMsg = 'ERROR: ' + errorMessage + '\n';
            this.exportlog = this.exportlog + formattedMsg;
            gs.log(formattedMsg);
        },

        getLog: function(){
            return this.exportlog;
        }
    };
    var publisher = new CMDBUpdateSetPublisher(newUpdateSetName, exporterlogger);
	try{
		exportData();
	}catch(error){
		exporterlogger.error('Fail to export due to:' + error);
		exportComplete(false);
	}
	exportComplete(true);
	
    function exportData() {
       for(var queryIndex in queryList) {
           var querySysId = queryList[queryIndex];
           if (_contains(querySysId)) continue;
           var record = getQueryRecord(querySysId);
           publisher.publishSingle(record);
           exported.push(querySysId);
           record.next();
           _exportDependentQuery(record.dependencies);
       }
    }

    function getQueryRecord(queryId){
        var gr = new GlideRecord('qb_saved_query');
        gr.addQuery('sys_id', queryId);
        gr.query();
        return gr;
    }

    function _exportDependentQuery(dependencies) {
        var queryID = dependencies.split(',');
        for (var i = 0; i < queryID.length; i++) {
            var id = queryID[i];
            if (_contains(id)) continue;
 		    exporterlogger.log("Exporting query: " + _getQueryName(id));
            publisher.publishSingle(getQueryRecord(id));
            exported.push(id);
        }
    }

    function _contains(s) {
        for (var i = 0; i < exported.length; i++) {
            if (exported[i] == s) return true;
        }
        return false;
    }

	function _getQueryName(queryId){
		var gr = new GlideRecord('qb_saved_query');
        if (gr.get(queryId))
			return gr.name;
		return null;
	}
	
	function exportComplete(isSuccess){
        exporterlogger.log('exportComplete');
        if (isSuccess){
            publisher.complete();
            exporterlogger.log('UpdateSet id is: ' + publisher.getUpdateSetId());
            var gr = GlideRecord('sys_update_set');
            gr.addQuery("sys_id", publisher.getUpdateSetId());
            gr.addQuery("state", "complete");
            gr.query();

            var updateSetExport = new UpdateSetExport();
            if(gr.hasNext()) {
                gr.next();
                var currentGr = gr;
                exporterlogger.log('Exporting UpdateSet: ' + newUpdateSetName + ' to file');
                exportSysId = updateSetExport.exportHierarchy(currentGr);
                exporterlogger.log('Export XML sys_id: ' + exportSysId);    
            } else{
                exporterlogger.error('Exporting UpdateSet: ' + this.newUpdateSetName + ' to file failed');                
            }
        }
        
        gs.log(exporterlogger.getLog());
        publisher.accomplish();
    }
	return exportSysId;
})(request, response);
