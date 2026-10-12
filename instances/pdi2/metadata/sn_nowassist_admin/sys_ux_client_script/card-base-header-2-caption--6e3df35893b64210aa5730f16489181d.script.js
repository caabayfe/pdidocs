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
    return {
        "label": `Ask the Panel to give you ${skillConfigTitle}`,
        "size": "md"
    }
}
