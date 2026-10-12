/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    try {
        const summary = (api.data.get_ipki_migration_list_rows &&
            api.data.get_ipki_migration_list_rows.output &&
            api.data.get_ipki_migration_list_rows.output.summary) || {};

        const eligibleCount = (summary.eligible != null) ? summary.eligible : 0;

        const bannerBody = await helpers.translate('mid_server_list_page.migration_banner.body', { count: eligibleCount });
        api.setState('migrationBannerBody', bannerBody);
        api.setState('migrationEligibleCount', eligibleCount);
    } catch {
        // Migration data unavailable (broker/translate failure) -> safe-hide the banner.
        api.setState('migrationEligibleCount', 0);
    }
}
