/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { 
        cards_list_payload
    } = api.context.props.payload.props_details;

    if (!cards_list_payload)
        return;

    try {
        let cardsListJSON = JSON.parse(cards_list_payload);
        const {
            cards_list
        } = cardsListJSON;

        api.setState('cardsListPayload', cards_list);

    } catch (error) {
        console.log('[ACE] Exception happened while parsing Interactive Cards List Payload', error);
    }
}
