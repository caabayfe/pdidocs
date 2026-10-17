function script({ api, event, helpers, imports }) {
    const { elementId } = event;
    if (!elementId) {
        return;
    } else if (elementId === "related_items_back_button") {
        api.setState("showDetailView", false);
        api.setState("relatedItemHeading", "");
        api.setState('relatedItemRecords', []);
        api.setState("relatedItemCategorySysId", "");
    } else if (elementId === "related_items_preferences_button") {
        helpers.translate("Related item settings. Select and arrange item categories to view as a list in the related items panel")
        .then(message => {
            helpers.modal.open('related_items_preferences_modal', { ariaLabel: message });
        });
    }
}
