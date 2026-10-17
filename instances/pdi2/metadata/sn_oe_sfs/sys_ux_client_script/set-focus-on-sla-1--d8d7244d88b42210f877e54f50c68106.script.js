/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
helpers.timing.setTimeout(() => {
                helpers.focus('card_base_container_2');
          }, 0);
}
