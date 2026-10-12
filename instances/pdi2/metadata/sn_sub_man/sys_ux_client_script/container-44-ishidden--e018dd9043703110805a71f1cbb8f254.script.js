/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    const isUnconfirmedCardShown = (api.context.props.shouldShowUnconfirmedUsers && (api.context.props.unconfirmedUserNumber > 0));
    const isOverAllocatedCardShown = Boolean(api.state.over_allocated_subs);
    const isAvailableSubsCardShown = Boolean(api.state.available_subs);
    // true - hide | false - show
    return !(isUnconfirmedCardShown || isOverAllocatedCardShown || isAvailableSubsCardShown);
}
