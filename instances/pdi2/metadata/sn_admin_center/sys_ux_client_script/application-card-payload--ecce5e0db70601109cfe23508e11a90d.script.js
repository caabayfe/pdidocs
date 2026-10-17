/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        type: {
            route: 'application-card'
        },
        ...api.item.value,
        isHighlighted: api.item.value.applicationId === api.context.props.nextUpApplicationId,
        businessObjective: {
            businessObjectiveId: api.context.props.payload.pageParams.businessObjectiveId,
            businessObjectiveName: api.item.value.businessObjectiveName
        },
        userInfo: api.data.get_user_info
    };
}
