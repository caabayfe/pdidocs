// Delete sys object source if target record no longer exists.
		// Cloning of this job will not help with faster cleanup (DO NOT CLONE).

var limitPropertyName = 'glide.cmdb.sysObjectSource_cleanup';
var tableToClean = 'sys_object_source';
var targetColumnName = 'target_sys_id';
var targetColumnTable = 'target_table';
var jobContextName = 'sysObjectSrcCleanUpIterationSysId';
var cmdbTableCleanup = new CMDBTableCleanup(limitPropertyName, tableToClean,
  targetColumnName, targetColumnTable, jobContextName);
cmdbTableCleanup.cleanRecords();
