/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("releaseNotesUrl", `https://www.servicenow.com/docs/bundle/${api?.context?.props?.patch?.toLowerCase() || "xanadu"}-release-notes/page/release-notes/family-release-notes.html`);
}
