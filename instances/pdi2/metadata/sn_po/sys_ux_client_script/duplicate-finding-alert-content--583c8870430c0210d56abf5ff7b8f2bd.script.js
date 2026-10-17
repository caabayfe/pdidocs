/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const link = `<a href="now/experience/promin/configure-finding-pattern/${api.context.props.projectId}/params/finding-id/${api.state.duplicateFindingId}">${helpers.translateSync('Click here')}</a>`;
    return {
        type: 'html',
        value: '<span>' + helpers.translateSync('Duplicate Record: {0} to view the existing record.', link) + '</span>',
    };
}
