/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    const propsDetails = api.context.props.payload.props_details;
    const {
        cards_list_item_payload
    } = propsDetails;

    if (!cards_list_item_payload)
        return;
        
    try {
        let cardsListItemJSON = JSON.parse(cards_list_item_payload);
        const {
            cardListItems
        } = cardsListItemJSON;

        api.setState('cardItemsPayload', cardListItems);

    } catch (error) {
        console.log('[ACE] Exception happened while parsing Dynamic Cards List Payload', error);
    }

}
