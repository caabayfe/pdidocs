(function refineQuery(current, parent) {
    var parallelJobTranscationIds = getUniqueTranscationIds(parent.sys_id);
	//Added transaction id of concurrent import set to get the outbound http logs during parallel jobs insert
    parallelJobTranscationIds.push(parent.transaction_id);
    current.addQuery('transaction_id', 'IN', parallelJobTranscationIds);
    current.addQuery('sys_created_on', '>=', parent.sys_created_on);
    current.addNotNullQuery('transaction_id');
})(current, parent);

function getUniqueTranscationIds(concurrentImportSetSysId) {
    var transcationIds = [];
    var encodedQuery = "job_execution_context.ref_sys_parallel_data_loader_execution_context.concurrent_import_set=" + concurrentImportSetSysId;
    var parallelJobGr = new GlideRecord("sys_parallel_job");
    parallelJobGr.addEncodedQuery(encodedQuery);
    parallelJobGr.query();
    while (parallelJobGr.next()) {
        transcationIds.push(parallelJobGr.getValue('transaction_id'));
    }
    return new ArrayUtil().unique(transcationIds);
}
