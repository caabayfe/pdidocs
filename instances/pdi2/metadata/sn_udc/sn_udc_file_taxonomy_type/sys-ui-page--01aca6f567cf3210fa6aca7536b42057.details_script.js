(function(record, taxonomyRecord) {
    const endpoint = record.getValue('endpoint');
    return {
        endpoint: !gs.nil(endpoint) ? `${endpoint}` : `${record.getValue('name')}.do`,
        subtitle: gs.getMessage('{0} - Preview • {1}', [taxonomyRecord.getDisplayValue("label"), fileObjectRecord.sys_scope.getDisplayValue()])
    };
})(fileObjectRecord, taxonomyRecord);
