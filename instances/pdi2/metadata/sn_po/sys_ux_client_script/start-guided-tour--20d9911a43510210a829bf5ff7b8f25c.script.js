/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  
api.emit("SN_GUIDED_TOURS#START_TOUR", {
  tourId: "43776cd243110210a829bf5ff7b8f24b"
});

}
