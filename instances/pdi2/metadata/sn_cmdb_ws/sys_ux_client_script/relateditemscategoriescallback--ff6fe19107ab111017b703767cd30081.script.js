function script({ api, event, helpers, imports }) {
    let records = api.data.get_related_list_categories.output.relatedLists.result;
    api.setState("relatedItemsAllCategories", records);
}
