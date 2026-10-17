var bsBucketMapUtil = new global.EvtMgmtBsBucketMapUtils();
// sync between em_service_bucket_map and cmdb_ci_service_auto by deleting all deleted or un-operational BSs 
bsBucketMapUtil.syncBucketMapping();
