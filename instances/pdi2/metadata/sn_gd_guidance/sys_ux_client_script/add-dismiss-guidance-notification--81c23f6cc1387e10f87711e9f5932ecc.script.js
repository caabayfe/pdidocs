/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const translatedActionDismissed = await helpers.translate('Action dismissed');
    const translatedDismissMessage = await helpers.translate('The recommended action has been dismissed');
    const messageHtml = `<span><b>${translatedActionDismissed} </b>${translatedDismissMessage}</span>`;

    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "guidance_dismissed",
            status: "info",
            icon: "circle-info-outline",
            content: {
                type: "html",
                value: messageHtml,
            },
            action: {
                type: "dismiss"
            },
        }]
    });

    helpers.timing.setTimeout(() => {
        api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: 'guidance_dismissed'
            }]
        });
    }, 5000);
}
