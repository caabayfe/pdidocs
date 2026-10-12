/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {eventName, eventPayload} = event.payload;
    switch(eventName) {
        case "blockContextUpdated": 
            let blockcontext = eventPayload.blockcontext || {};
            let updatedBlockContext = {};
            Object.keys(blockcontext).map((blockContextKey) => {
                if(blockContextKey != "provider_name") {
                    updatedBlockContext[blockContextKey] = blockcontext[blockContextKey];
                }
            });
            api.setState("blockcontext", {...updatedBlockContext});
            break;
        case "contentTreeChanged": 
            api.setState("contentBlocks", eventPayload.contentTree);
            break;   
        case "modalContentsUpdated": 
            api.setState("contentBlocks", eventPayload.contents);
            break;           
    }
    
}
