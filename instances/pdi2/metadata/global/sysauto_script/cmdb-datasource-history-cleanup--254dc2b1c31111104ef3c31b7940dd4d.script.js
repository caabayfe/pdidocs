// If the CI (cmdb or non_cmdb) is no longer available then delete
// the datasource history record.Cloning of this job will not help with faster cleanup(DO NOT CLONE).

var limitPropertyName = 'glide.cmdb.cmdb_datasource_last_update_cleanup';
var tableToClean = 'cmdb_datasource_last_update';
var targetColumnName = 'cmdb_ci';
var targetColumnTable = 'class';

if (!GlideTableDescriptor.fieldExists(tableToClean, targetColumnName))
    targetColumnName = "record";

var jobContextName = 'cmdbDataSourceLastUpdateCleanUpIterationSysId';
var cmdbTableCleanup = new CMDBTableCleanup(limitPropertyName, tableToClean,
  targetColumnName, targetColumnTable, jobContextName);
cmdbTableCleanup.cleanRecords();
