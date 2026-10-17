/**
* @param {params} params
* @param {api} params.api
* @param {any} params.trigger
* @param {any} params.properties
*/
function configureProps(obj) {
    var trigger = obj.trigger;
    var api = obj.api;
    var properties = obj.properties;
    const _updatePropertiesVisibility = function() {
        const allProperties = ["showHeader", "showAttachments", "showAuthorInformation", "showStarRatingAction", "showArticleVersion", "showLanguageSelector", "showComments", "showHelpfulAction", "showRelatedArticles","showArticleNumber","showBackButton"];
        allProperties.forEach(function(property) {
            togglePropertyDisplay(api, property, properties.overridePageProperties);
            if (property == "showHeader") {
                _updateHeaderPropertiesVisibility(properties.overridePageProperties);
            }
            if (property == "showHelpfulAction") {
                _updateHelpfulPropertiesVisibility(properties.overridePageProperties);
            }
        });
    }
    const _updateHeaderPropertiesVisibility = function(allowOverride) {
        allowOverride = (typeof allowOverride !== 'undefined') ? allowOverride : true;
        const headerProperties = ["showArticleActions", "showViewCount", "showAverageRating", "showLastUpdated", "showReadingTime","showArticleNumber","showBackButton"];
        headerProperties.forEach(function(property) {
            togglePropertyDisplay(api, property, properties.showHeader && allowOverride);
        });
    }

    const _updateHelpfulPropertiesVisibility = function(allowOverride) {
        allowOverride = (typeof allowOverride !== 'undefined') ? allowOverride : true;
        togglePropertyDisplay(api, "showHelpfulPercentage", properties.showHelpfulAction && allowOverride);
    }

    // onLoad actions
    if (!trigger) {
        _updatePropertiesVisibility();
    }
    switch (trigger) {
        case 'overridePageProperties':
            _updatePropertiesVisibility();
            break;
        case 'showHeader':
            _updateHeaderPropertiesVisibility();
            break;
        case 'showHelpfulAction':
            _updateHelpfulPropertiesVisibility();
            break;
        default:
            break;
    }

    function togglePropertyDisplay(api, property, value) {
        api.updateVisibility(
            property,
            value
        );
    }
}
