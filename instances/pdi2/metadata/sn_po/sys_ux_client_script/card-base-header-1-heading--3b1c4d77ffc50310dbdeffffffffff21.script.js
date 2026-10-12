/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const errorContext = api.state.projectData?.miningSummary?.errorContext;
    // The pre-start block is date-based, not scope-based, so the default heading would misdescribe
    // it — the project scope is irrelevant until the contract starts (DEF0871913).
    const label = errorContext?.contractNotStarted
        ? helpers.translateSync('Process Mining is not available yet')
        : helpers.translateSync('Project scope exceeds entitlement');

    return {
        label: label,
        size: 'sm',
        variant: 'primary',
    };
}
