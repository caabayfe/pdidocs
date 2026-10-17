api.controller = function($window, $location, recentlyViewedFavorites) {
    /* widget controller */
    var c = this;

    c.redirect = function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        recentlyViewedFavorites.updateLastViewedForFavorite(c.table, c.sysId);

        if (c.url) {
            c.target = c.target ? c.target : "_self";
            if (c.target === "_self") {
                $location.search(c.url.substring(1));
            } else {
                $window.open(c.url, c.target);
            }
        }
    };

    if (c.data && c.data.content) {
        var cardData = c.data.content;
        c.listType = cardData.listType;
        c.table = cardData.table;
        c.sysId = cardData.sysId;
        c.iconClass = cardData.iconClass;
        c.primaryField = cardData.primaryField;
        c.type = cardData.type;
        c.favoriteTitle = cardData.favoriteTitle;
        c.url = cardData.url;
        c.target = cardData.target;
    }
};
