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
    const payload = api.context.props.additionalInfo;
    if (!payload || !payload.errorPageDetails) return;

    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();

    const {
        heading,
        subHeading,
        content,
        icon,
        shortDescription,
        actions
    } = payload.errorPageDetails;
    const defaultTemplate = await pwdResetUtil.getErrorPageDetailsTemplate(helpers);

    if (pwdResetUtil.isString(heading)) defaultTemplate.heading = heading;
    if (pwdResetUtil.isString(subHeading)) defaultTemplate.subHeading = subHeading;
    if (pwdResetUtil.isString(content)) defaultTemplate.content = content;
    if (pwdResetUtil.isString(icon)) defaultTemplate.icon = icon;
    if (pwdResetUtil.isString(shortDescription)) defaultTemplate.shortDescription = shortDescription;

    // Preventing the default mechanism if actions are passed
    if (actions && typeof actions === 'object' && Object.keys(actions).length !== 0) defaultTemplate.actions.close.isHidden = true;
    
    // Honoring actions as passed
    for (let action in actions) {
        if (defaultTemplate.actions.hasOwnProperty(action)) {
            if (pwdResetUtil.isBoolean(actions[action].isHidden))
                defaultTemplate.actions[action].isHidden = actions[action].isHidden;
            if (pwdResetUtil.isString(actions[action].variant))
                defaultTemplate.actions[action].variant = actions[action].variant;
        }
    }
    api.setState("errorDetails", defaultTemplate);
}
