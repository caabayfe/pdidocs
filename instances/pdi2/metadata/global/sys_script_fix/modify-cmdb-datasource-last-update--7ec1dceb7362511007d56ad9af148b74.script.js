
gs.log('Fix Script: Running fix script to modify the columns for cmdb_data_source_last_update');
var modifyColumn = new ModifyColumnsForCMDBDataSourceLastUpdate();
modifyColumn.scheduleModifyDictionary();
gs.log('Fix Script: Scheduled modify columns for the cmdb_data_source_last_update table');

gs.log("Fix Script: Starting to schedule index creation for cmdb_datasource_last_update");
var indexCreator = new AddIndexesForCMDBTables();
indexCreator.createIndex('cmdb_datasource_last_update', 'record, attribute', 'record_attribute_index');
gs.log("Fix Script: Scheduled index creation for cmdb_datasource_last_update");
