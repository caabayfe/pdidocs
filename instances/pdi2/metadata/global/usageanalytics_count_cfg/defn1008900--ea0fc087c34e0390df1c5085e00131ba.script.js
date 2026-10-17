answer = calculateUsageSinceAnniversaryDate();

function calculateUsageSinceAnniversaryDate() {
	var licenseUtils = new sn_po.ProminLicenseCheckUtilsSNC();
    var anniversaryDate = licenseUtils.getAnniversaryDate();

    if (!anniversaryDate) {
        return;
    }

    var cutoff365 = new GlideDateTime();
    cutoff365.addDaysUTC(-365);

    var gr = new GlideAggregate('promin_metered_usage_data');
	gr.addAggregate('COUNT(DISTINCT', 'case_id');
	gr.addQuery('first_mined_on', '>', cutoff365.getValue());
	gr.addQuery('sys_created_on', '>', anniversaryDate.getValue());
        gr.addQuery('annual_burn_down', false);
	gr.setGroup(false);
	gr.query();

    var count = 0;
    if (gr.next()) {
        count = parseInt(gr.getAggregate('COUNT(DISTINCT', 'case_id'), 10) || 0;
    }

    return count;
}
