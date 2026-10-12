/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        const toolsListCopy = [...api.state.toolsList.toolsList.output];
        
        for(let i=0;i<toolsListCopy.length;i++) {
            if(toolsListCopy[i]?.sys_id === api.state.deleteSysId) {
                toolsListCopy[i].sys_id = "";
                break;
            }
        }
        api.setState("toolsList", {
            toolsList: {
                output: toolsListCopy
            }
        });
        
        api.emit('FAVORITES_BEHAVIOR#FAVORITE_ENTRY_REMOVED', { 
            removedFavorites: [ { id: api.state.deleteSysId}]
        });
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Delete bookmark record succeeded", e);
    }
}
