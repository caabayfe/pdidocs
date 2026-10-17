/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const skillConfigTitle = api.context.props.payload.guided_context.skill_config_title;
    const skillFamily = api.context.props.payload.guided_context.skill_family;
    return {
        "label": `${skillConfigTitle} will show up in all ${skillFamily} products `,
        "size": "md"
    };

}
