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
    try {
        const executeDelete = (sys_id) => {
            api.data.delete_record_1.execute({
                table: "sys_ui_bookmark",
                recordId: sys_id
            });
            api.setState("deleteSysId", sys_id);
        }
        const executeAdd = () => {
                const toolsListCopy = [...api.state.toolsList.toolsList.output];
                api.data.create_record_1.execute({
                    table: "sys_ui_bookmark",
                    templateFields: `url=${toolsListCopy[itemIndex].linkUrl}^title=${toolsListCopy[itemIndex].headerText}^color=fuschia^user=${api.context.session.user.sys_id}^window_name=_blank^icon=${toolsListCopy[itemIndex].favouritesIcon}`
                });
        }
        const itemIndex = event.context.item.index;
        const addOrDelete = event.context.item.value?.sys_id;

        if (addOrDelete) {
            executeDelete(addOrDelete);
        } else {
            executeAdd();
        }
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Bookmark Button clicked", e);
    }
}
