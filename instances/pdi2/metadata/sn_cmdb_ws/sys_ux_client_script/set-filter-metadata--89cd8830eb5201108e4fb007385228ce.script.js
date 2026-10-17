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
    const {
        tabsMetadata,
        cardsMetadata
    } = api.data.page_filter_metadata.output;
    let selectedCard = cardsMetadata[0];
    
    // Loop through the cards and localize the number
    cardsMetadata.forEach(c => {
        c.value = Number(c.value).toLocaleString();
    });

    // Loop through the tabs and localize the number
    tabsMetadata.forEach(t => {
        t.count = Number(t.count).toLocaleString();
    });
    
    // if a card was already selected, preserve the selection
    if (api.state.cardFilters && api.state.cardFilters.length > 0) {
        let _selectedCard = api.state.cardFilters.filter(c => c.selected)[0];
        if (_selectedCard) {
            cardsMetadata.forEach(c => {
                if (c.key === _selectedCard.key) {
                    c.selected = true;
                    selectedCard = c;
                } else {
                    c.selected = false;
                }
            });
            tabsMetadata.forEach(t => {
                // set the tab filter based on card selected
                t.fields.filter = selectedCard.filter + "^" + t.fields.tabFilter;
                // set the list action config based on card selection
                var actionConfigMetadata = t.fields.actionConfigMetadata;
                var actionConfig = t.fields.actionConfig;
                if (actionConfigMetadata[selectedCard.key]) {
                    actionConfig = actionConfigMetadata[selectedCard.key];
                } else {
                    actionConfig = actionConfigMetadata.default;
                }
                t.fields.actionConfig = actionConfig;
            });
        }
    }
    api.setState('cardFilters', cardsMetadata);
    api.setState('selectedCardFilter', selectedCard.filter);
    api.setState('tabs', tabsMetadata);
    api.setState('selectedSysIds', []);
}
