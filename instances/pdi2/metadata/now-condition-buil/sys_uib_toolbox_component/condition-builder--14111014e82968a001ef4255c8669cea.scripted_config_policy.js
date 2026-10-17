// eslint-disable-next-line no-unused-vars
function conditionBuilderPolicy({ api, trigger, properties }) {
    // Action bar

    if (trigger === 'hideActionBar') {
        api.updateEnabled('hideSaveFilter', !properties.hideActionBar);
        api.updateEnabled('hideLoadFilter', !properties.hideActionBar);
        api.updateEnabled('hideRecordCount', !properties.hideActionBar);
    }

    // Main body

    if (trigger === 'hideSortBy') {
        api.updateEnabled('hideSortByDescription', !properties.hideSortBy);
    }

    if (properties?.componentVersion !== 2) {
        api.updateVisibility('showReferenceLookup', false);
    } else {
        api.updateVisibility('showReferenceLookup', true);
    }
}
