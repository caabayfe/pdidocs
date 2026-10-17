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
    const {
        cardProps = {},
        customExpProps = {},
    } = api.context.props;
    if (customExpProps && Object.keys(customExpProps).length != 0) {
        api.emit("CUSTOM_EXP_PROPS_FOUND", {
            customExpProps: customExpProps
        });
        return;
    }
}
