function include() {
    var _getApplicationServicesCategories = function (data) {
        var categories = [];
        for (var item in data) {
            categories.push(data[item]['categoryLabel']);
        }
        categories.sort();
        return categories;
    };

    return {
        getApplicationServicesCategories: _getApplicationServicesCategories,
        getRecommendationDescription: _getRecommendationDescription
    }
}
