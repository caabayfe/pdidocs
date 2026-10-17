function script({ api, event, helpers, imports }) {
    //cardClicked script in relatedItemsController; fired when card clicked event is passed into the controller
    api.emit('SN_UNIFIED_MAP_CTRL#FIND_ON_MAP', { findData: {
        nodes: [event.payload.cardData.ciSysId]
    }});
}
