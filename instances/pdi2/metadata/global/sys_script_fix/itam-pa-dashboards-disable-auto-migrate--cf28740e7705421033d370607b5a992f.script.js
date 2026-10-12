var paDashboardSysIds = ['fa5fe3e1773130107384c087cc5a99d5'/* Asset Overview */, '2bbf2161770230107384c087cc5a9924'/* My Assets */, '68ee1f30770230107384c087cc5a992e'/* Asset Contract Overview */];
var paDashboardsRecord = new GlideRecord('pa_dashboards');
paDashboardsRecord.addQuery('sys_id', 'IN', paDashboardSysIds);
paDashboardsRecord.query();
while (paDashboardsRecord.next()) {
	paDashboardsRecord.no_bulk_migration = true;
	paDashboardsRecord.update();
}
