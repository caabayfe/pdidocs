/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var targetUrl = "";
    var indicatorId = event?.payload?.params?.indicatorSysid || '';
    if (indicatorId == '3d100b0e778b31101b803a91fa5a999a') {
        targetUrl = '/now/security-center-monitoring/sec_center_kpi_details/3d100b0e778b31101b803a91fa5a999a';
    } else {
        var breakdownId = '3830b5da778331101b803a91fa5a99fe';
        var elementId = api?.data?.get_maturity_level_element_id_1?.output.sysId;
        var params = encodeURIComponent('[{"sysId":"' + breakdownId + '","elements":["' + elementId + '"]}]');
        targetUrl = '/now/security-center-monitoring/sec_center_kpi_details/a47ea15a778331101b803a91fa5a9985/params/breakdown/' + params;
    }
    api.emit('NAV_ITEM_SELECTED', {
        external: {
            url: targetUrl,
            "target": "_self"
        }
    });
}
