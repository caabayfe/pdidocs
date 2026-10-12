/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const link = `<a href="/promin_activity_def.do?sys_id=${api.state.alertActivityId}">${helpers.translateSync('advanced options for this activity')}</a>`;
    return {
        type: 'html',
        value: '<span>' + helpers.translateSync('Certain activities like dot walked fields or compound activities are not editable in the project builder. Please navigate to the {0} to update it.', link) + '</span>',
    };
}
