/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */

async function handler({ api, event, helpers, imports }) {

    if (!event || !event.payload) {
        return;
    }

    const { items, table, sysId, options } = event.payload;
    const userRoles = api.context.session.user.roles;
    if (userRoles && (userRoles.includes("admin") || userRoles.includes("workspace_admin"))) {
        //only emit for "workspace_admin" and "admin" role
        let newItems = [];

        //filter out "Contextual Side Panel" and "Related Items"
        let tranlatedLabel1, translatedLabel2;
        await helpers.translate("Contextual Side Panel").then((value1) => {
            tranlatedLabel1 = value1;
        });
        await helpers.translate("Related Items").then((value2) => {
            translatedLabel2 = value2;
        });

        items.forEach(item => {
            if (item && item.label != tranlatedLabel1 && item.label != translatedLabel2) {
                newItems.push(item);
            }
        });

        api.emit("CONTENT_ITEMS_SELECTED", {
            table,
            sysId,
            options,
            items: newItems
        });
    }
}
