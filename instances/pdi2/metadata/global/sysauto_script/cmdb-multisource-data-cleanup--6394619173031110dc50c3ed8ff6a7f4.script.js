// if target record (cmdb or non-cmdb) no longer exists then delete cmdb multisource record.
		 // Cloning of this job will not help with faster cleanup (DO NOT CLONE).
var limitPropertyName = 'glide.cmdb.multisourceData_cleanup';
var tableToClean = 'cmdb_multisource_data';
var targetColumnName = 'ci';
var targetColumnTable = 'class';
var jobContextName = 'cmdbMultisourceDataCleanUpIterationSysId';
var cmdbTableCleanup = new CMDBTableCleanup(limitPropertyName, tableToClean,
  targetColumnName, targetColumnTable, jobContextName);
cmdbTableCleanup.cleanRecords();
