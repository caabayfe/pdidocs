/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        "loading": true,
        "label": "Loading...",
        "action": null,
        "nonBlocking": false
    });
    api.setState("announcementsPageNumber", () => event.payload.value + 1);
    if(!event.payload.value) {
        api.setState("announcementsPageCursor", api.state.pageCursors[0]);
        return;
    }
    if(event.payload.value < api.state.pageCursors.length) {
        api.setState("announcementsPageCursor", api.state.pageCursors[event.payload.value]);
    } else {
        api.setState("announcementsPageCursor", api.state.announcementsData.page_cursor);
        const pageCursors = api.state.pageCursors;
        pageCursors.push(api.state.announcementsData.page_cursor);
        api.setState("pageCursors", pageCursors);
    }
}
