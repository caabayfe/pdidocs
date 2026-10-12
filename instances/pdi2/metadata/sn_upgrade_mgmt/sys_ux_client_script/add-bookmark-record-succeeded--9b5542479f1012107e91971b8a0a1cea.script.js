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
        const clickedBookmark = event.payload.data.output.data.GlideRecord_Mutation.insert_sys_ui_bookmark;
        const toolsListCopy = [...api.state.toolsList.toolsList.output];
        
        for(let i=0;i<toolsListCopy.length;i++) {
            if(toolsListCopy[i].headerText === clickedBookmark.title.value) {
                toolsListCopy[i].sys_id = clickedBookmark.sys_id.value;
                break;
            }
        }

        api.setState("toolsList", {
            toolsList: {
                output: toolsListCopy
            }
        });
        api.emit('FAVORITES_BEHAVIOR#FAVORITE_ENTRY_ADDED', {
            favoriteResponse: {
                id: clickedBookmark.sys_id.value,
                title: clickedBookmark.title.value,
                url: clickedBookmark.url.value,
                color: clickedBookmark.color.value,
                icon: clickedBookmark.icon.value
            }
        });
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Add bookmark record succeeded", e);
    }

}
