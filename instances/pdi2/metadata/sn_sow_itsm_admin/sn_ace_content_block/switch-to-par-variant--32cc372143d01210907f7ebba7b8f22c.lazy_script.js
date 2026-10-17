(function(context, pageParams, blockcontext) {
    var sowChartMigrationUtil = new sn_sow_itsm_admin.SOWChartMigrationUtil();
    var minLandingPageVariantOrder;
    var uxScreenGR = new GlideRecord('sys_ux_screen');
    uxScreenGR.addQuery('screen_type', 'dc44f57a0b1001106237818393673a02'); // UX screen collection = Home
    uxScreenGR.orderBy('order');
    uxScreenGR.query();
    if (uxScreenGR.next()) {
        minLandingPageVariantOrder = uxScreenGR.getValue('order');
    }

    var TIER_1_PAR_DASHBOARD_VARIANT = 'ad0e332c470c5210632ef855516d43ed';
    var TIER_2_PAR_DASHBOARD_VARIANT = '002732ff47409210632ef855516d43b7';

    uxScreenGR.initialize();
    uxScreenGR.get(TIER_1_PAR_DASHBOARD_VARIANT);
    uxScreenGR.setValue('order', minLandingPageVariantOrder - 200);
    uxScreenGR.update();

    uxScreenGR.initialize();
    uxScreenGR.get(TIER_2_PAR_DASHBOARD_VARIANT);
    uxScreenGR.setValue('order', minLandingPageVariantOrder - 100);
    uxScreenGR.update();

    sowChartMigrationUtil.updateTier1ChartMigartionStatus("complete");
    sowChartMigrationUtil.updateTier2ChartMigartionStatus("complete");

    return {
        tier1MigrationStatus: "complete",
        tier2MigrationStatus: "complete",
        showChartsMigratedAlert: true,
        showPreviewMigrationAlert: false
    };
})(context, pageParams, blockcontext);
