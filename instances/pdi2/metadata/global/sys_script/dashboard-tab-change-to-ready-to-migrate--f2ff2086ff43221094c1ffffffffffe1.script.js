(function executeRule(current, previous /*null when async*/) {

   if (!current.isValidField('dashboard'))
        return;

    var id = current.dashboard;
    if (!id) return;

    var ga = new GlideAggregate('pa_m2m_dashboard_tabs');
    ga.addAggregate('COUNT');
    ga.groupBy('dashboard');
    ga.addQuery('dashboard', id);
    ga.queryNoDomain();

    var list = [];
    while (ga.next())
        list.push(ga.getValue('dashboard'));

    var migrator = new PopulateReadyToMigrate();
	migrator.populateSelectedDashboardsReadyToMigrateColumns(list);


})(current, previous);
