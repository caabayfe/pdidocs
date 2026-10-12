/**
 * This method is used to remove a card from it's original position and put back at a new position based on the new
 * laneId, swimlaneId and the order that are passed as function parameters.
 */
function include({
    imports
}, {
    allCards,
    cardId,
    laneId,
    swimlaneId = '',
    order
}) {
    const {
         'sn_vtb.loadashUtil': loadashUtil
    } = imports;
     const {
        cloneDeep
     } = loadashUtil();

    const cards = cloneDeep(allCards);
    const cardData = cards.find((c) => c.sys_id === cardId);
    if (cardData) {
        cardData.lane_id = laneId;
        cardData.swim_lane_id = swimlaneId;
        const destinationLaneCards = cards
            .filter((card) => card.lane_id === laneId && card.swim_lane_id === swimlaneId)
            .sort((a, b) => a.order - b.order);

        cardData.order = order;
        destinationLaneCards.forEach((card, idx) => {
            if (card.sys_id !== cardData.sys_id) {
                if (idx < order) card.order = idx;
                else if (idx > order) card.order = idx + 1;
                else card.order = order - 1 >= 0 ? order - 1 : order + 1;
            }
        });
    }

    return cards;
}
