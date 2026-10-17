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
    var findingId = api.context.props.sysId;
    var res = api?.data?.access_findings_state_mark_resolved?.refresh({
        sys_id: findingId
    });
    api.data.look_up_a_single_record.refresh();
    this.document.location.reload();
}
