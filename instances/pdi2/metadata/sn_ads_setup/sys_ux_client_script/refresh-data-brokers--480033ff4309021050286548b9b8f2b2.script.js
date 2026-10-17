/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
  if(event.payload.name === "customId" && event.payload.value) {
        const { setupId,interactionId } = api.context.props;
        api.data.guided_setup_player_on_load_handler_1.execute({
            setupId: setupId,
            interactionId: interactionId
        });
    }
}
