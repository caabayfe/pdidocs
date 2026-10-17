// This scheduled job performs same query as the one for usageanalytics_count_cfg 'DEF1000115'
var serverGr = new GlideAggregate('cmdb_ci_server');
serverGr.addAggregate('COUNT');
serverGr.addQuery('duplicate_of', 'NULL');
serverGr.addQuery('discovery_source', 'IN', 'ServiceNow, Service-now, ServiceWatch');
serverGr.addQuery('last_discovered', 'ON', 'Last 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()');
serverGr.query();

var serverCount = serverGr.next() ? parseInt(serverGr.getAggregate('COUNT')) : 0;
var licenseUtils = new sn_itom_license.ITOMLicensingUtils();
licenseUtils.updateProductCount('Discovery', serverCount);
