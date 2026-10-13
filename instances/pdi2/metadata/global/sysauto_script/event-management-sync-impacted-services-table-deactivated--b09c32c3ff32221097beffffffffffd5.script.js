/* This scheduled job was deactivated intentionally after synchronized the severities of em_impacted_service table. Do not activate this job */ 
var syncImpactedServices = new global.EmSyncSeveritiesInImpactedServices();
        syncImpactedServices.execute();
