gs.include('EvtMgmtMetricCacheHandler');

EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_map', '', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_map_deleted_detail', 'sa_metric_map', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_source_metric_type', '', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_source_metric_type_deleted', 'sa_source_metric_type', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_registration', '', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_registration_deleted', 'sa_metric_registration', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_type', '', 'updated_on_milliseconds');
EvtMgmtMetricCacheHandler.checkTableForUpdateSendEccReq('sa_metric_type_deleted', 'sa_metric_type', 'updated_on_milliseconds');

//We don't need to Sync the maintenance tables using this jobs, since they are allready synced in the java code that calculate the maintenance itself on ImpactMaintenanceHandler.callCheckTableForAddedToTable()
