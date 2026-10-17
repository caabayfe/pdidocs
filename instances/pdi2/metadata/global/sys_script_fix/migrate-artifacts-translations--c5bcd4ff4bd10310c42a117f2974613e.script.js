function migrateTranslations(currentTableName, newTableName) {
    if (pm.isZboot())
        return;

    var translatedGR = new GlideRecord('sys_translated');
    translatedGR.addQuery('name', currentTableName);
    var qc = translatedGR.addQuery('element', 'name');
    qc.addOrCondition('element', 'description');
    translatedGR.setValue('name', newTableName);
    translatedGR.updateMultiple();
}

migrateTranslations('pa_dashboards', 'analytics_dashboard');
migrateTranslations('par_dashboard', 'analytics_dashboard');
migrateTranslations('sys_report', 'analytics_visualization');
migrateTranslations('par_visualization', 'analytics_visualization');
