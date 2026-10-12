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
    const table = api.context.props.table;
    const sysId = api.context.props.sysId;

    const output = api.data.check_editor_type_1.output;
   if (!output) {
        return;
    }

    if (!output.showNotification) {
        return;
    }

    const item = {
        "id": "editor_type_mismatch_notification",
        "status": "warning",
        "content": "This article was created using a newer article editor which may display this article in a better format. Edit this article using the new knowledge center editor application.",
        "expanded": true,
        "enableFocus": true,
        "action": {
            "type": "dismiss"
        },
        "autoDismiss": {
            "enabled": false
        },
    };

    if (output.shouldRedirect) {
        item.textLinkProps = {
            "label": "Knowledge Center",
            "href": `now/knowledge-center/record/${table}/${sysId}`,
            "variant": "primary",
            "iconEnd": "open-link-right-outline",
            "opensWindow": true
        };
    }

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [item]
    });
}
