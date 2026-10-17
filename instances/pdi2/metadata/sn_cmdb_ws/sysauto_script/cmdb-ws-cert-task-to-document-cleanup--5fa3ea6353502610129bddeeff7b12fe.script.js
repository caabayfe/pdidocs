var tableToClean = 'sn_cmdb_ws_dm_certification_task_to_document';
var targetColumnName = 'ci';
var targetColumnTable = 'table';
var jobContextName = 'workspaceDMCertCleanUpIterationSysId';
var cmdbTableCleanup = new global.CMDBTableCleanup('', tableToClean, targetColumnName, targetColumnTable, jobContextName);
cmdbTableCleanup.cleanRecords();
