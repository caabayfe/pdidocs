
/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
*/
function handler({api, event}) {
    const { updates } = event.payload;
    if(updates && api.state.listId === api.context.props.listId) {
        updates.forEach(update => {
            const { path, value } = update;
            api.setState(path, value);
        });
    }
}
    
