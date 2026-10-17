/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const now = new Date();
const dateJSON = {};
const formattedPresentTime = now.toTimeString().split(' ')[0];
dateJSON.end = formattedPresentTime.slice(0, 5);
const sixHoursOld = new Date(now.getTime() - 6 * 60 * 60 * 1000);
const formattedPrevTime = sixHoursOld.toTimeString().split(' ')[0];
dateJSON.start = formattedPrevTime.slice(0, 5);
api.setState('dateJSON', dateJSON);
api.setState('isPageLoaded', true);
}
