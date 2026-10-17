/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const selectedTabIndex = event && event.payload && event.payload.selectedTabIndex;
     switch(selectedTabIndex) {
          case 0 : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.availableUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.availableUpdates.length && true);
               break;
          case 1 : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.overDueUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.overDueUpdates.length && true);
               break;
          case 2 : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.dueSoonUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.dueSoonUpdates.length && true);
               break;
          case 3 : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.inProgressUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.inProgressUpdates.length && true);
               break;
          case 4 : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.acknowledgeCompleteUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.acknowledgeCompleteUpdates.length && true);
               break;
          default : 
               api.setState("updateCardsData", api.data.critical_updates_data.output.availableUpdates);
               api.setState("hideEmptyState", api.data.critical_updates_data.output.availableUpdates.length && true);
     }
}
