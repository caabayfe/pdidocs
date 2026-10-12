api.controller = function($window, $location, snAnalytics, recentlyViewedFavorites) {
    var c = this;
    var relevantForYouWidgetSysId = '6cc836d0dbf700500c209493db961914';

    c.isValidLocalDate = function(dateString) {
        var localDateTimeFormat = g_user_date_time_format;
        return getDateFromFormat(dateString, localDateTimeFormat) !== 0;
    };

    c.redirect = function($event) {
        $event.preventDefault();
        c.contentCardClicked();
        recentlyViewedFavorites.updateLastViewedForFavorite(c.table, c.sysId);

        if (c.url) {
            if (c.target === "_self") {
                $location.search(c.url.substring(1));
            } else {
                //As we are stopping propagation of event zoom and teams will not be able to open the items that are external, so use window.open override.
                $window.open(c.url, c.target);
            }
            c.createAppseeEvent();
        }
    };

    c.contentCardClicked = function() {
        $rootScope.$broadcast('CONTENT_CARD_CLICKED', {
            id: c.sysId,
            rank: c.data.content.index,
        });
    };

    c.createAppseeEvent = function() {
        if (c.widgetSysId && c.widgetSysId == relevantForYouWidgetSysId) {
            var itemTypeTitle = c.getItemTypeTitle(c.table);
            var payload = {};
            payload.name = c.widgetTitle;
            payload.data = {};
            payload.data[itemTypeTitle] = c.title;
            snAnalytics.addEvent(payload);
        }
    };

    c.getItemTypeTitle = function(tableName) {
        if (tableName == 'kb_knowledge')
            return '${Article Title}';
        else if (tableName == 'sc_cat_item')
            return '${Catalog Title}';
    };

    c.iconClass = "";
    c.type = "";
    c.isFeatured = false;
    c.image = "";
    c.title = "";
    c.description = "";
    c.url = "";
    c.additionalInfo = "";
    c.additionalInfoIsDate = false;
    c.viewType = 'card';
    c.table = '';
    c.ariaLabel = '';

    if (c.data && c.data.content) {
        var cardData = c.data.content;
        c.sysId = cardData.sysId;
        c.widgetTitle = cardData.widgetTitle;
        c.iconClass = cardData.iconClass;
        c.type = cardData.type;
        c.isFeatured = cardData.isFeatured;
        c.image = cardData.image;
        c.title = (cardData.title ? cardData.title : ' ').replaceAll('highlight>', 'mark>');
        c.tooltipTitle = (cardData.title ? cardData.title : ' ').replace(/<\/highlight>/g, '').replace(/<highlight>/g, ''),
        c.description = (cardData.description ? cardData.description : '').replaceAll('highlight>', 'mark>');
        c.url = cardData.url;
        c.target = cardData.target ? cardData.target : "_self";
        c.additionalInfoIsDate = c.isValidLocalDate(cardData.additionalInfo);
        //if additionalInfo contains date we are converting it to a standard date format.
        if (c.additionalInfoIsDate) {
            var formattedDate = c.data.formattedAdditionalInfoDate;
            c.additionalInfo = formattedDate;
        } else {
            c.additionalInfo = cardData.additionalInfo;
        }
        c.viewType = cardData.viewType;
        c.widgetSysId = cardData.widgetSysId;
        c.table = cardData.table;
        c.ariaLabel = c.type + ' ' + c.tooltipTitle;
    }
};
