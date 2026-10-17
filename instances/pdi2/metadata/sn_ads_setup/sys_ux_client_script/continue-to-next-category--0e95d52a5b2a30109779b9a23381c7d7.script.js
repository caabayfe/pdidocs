function handler({
    api,
    event,
    helpers
}) {
    const categories = api.data.get_all_categories.results;
    categories.sort((cat1, cat2) => cat1.order.value - cat2.order.value);
    const currentIndex = categories.findIndex(category => category._row_data.uniqueValue === api.context.props.categoryId);
    helpers.modal.open('next_category_modal', {
        bare: true
    });
    var interval = helpers.timing.setInterval(function() {
        helpers.timing.clearInterval(interval);
        helpers.modal.close('next_category_modal');
        helpers.navigate.to("step", {
            "setupId": api.context.props.setupId,
            "categoryId": categories[currentIndex + 1]._row_data.uniqueValue
        });
        return;
    }, 4000);
    return;
}
