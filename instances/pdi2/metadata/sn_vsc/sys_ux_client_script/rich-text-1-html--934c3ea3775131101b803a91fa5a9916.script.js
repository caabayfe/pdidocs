/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var tableName = api?.context?.props?.table;
    var pageName = helpers.translateSync("Findings");
    var pageLink = `<a href='now/security-center-configuration/record/scan_table_check/${api?.context?.props?.sysId}/params/selected-tab-index/2/page/scan_checks' target='_blank' rel='noopener'>${pageName}</a>`;
    if (tableName === "scan_check_suite" && api?.context?.props?.sysId != "-1") {
        pageName = helpers.translateSync("Results");
        pageLink = `<a href='/now/security-center-configuration/security_scan_results' target='_blank' rel='noopener'>${pageName}</a>`;
        return '<p>' + helpers.translateSync("The scan is being executed. You may leave this page or review the progress in the {0} page. Note: If a record is inactive, the checks don't generate any findings for that record.", pageLink) + '</p>';
    } else if (tableName === "scan_check" || tableName === "scan_script_only_check" || tableName === "scan_table_check" || tableName === "scan_column_type_check") {
        return '<p>' + helpers.translateSync("The check is being tested. You may leave this page or review progress in the {0} tab. Note: If a record is inactive, no findings will be generated.", pageLink) + '</p>';
    }
}
