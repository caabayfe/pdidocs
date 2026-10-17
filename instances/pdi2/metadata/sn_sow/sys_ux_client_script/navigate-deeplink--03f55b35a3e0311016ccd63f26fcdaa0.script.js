/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  let url;
  switch(event.elementId){
      case "email_button":
        url = api.state.userDetails.emailDeepLink;
        break;
      case "teams_button":
        url = api.state.userDetails.teamsDeepLink;
        break;
  }
    api.emit("NAV_ITEM_SELECTED", {
        "external": {
            "url": url
        }
    });
}
