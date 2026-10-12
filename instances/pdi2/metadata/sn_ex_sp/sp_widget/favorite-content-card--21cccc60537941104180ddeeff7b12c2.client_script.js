api.controller = function($window, $location, $scope, recentlyViewedFavorites) {
    var c = this;

    c.redirect = function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        recentlyViewedFavorites.updateLastViewedForFavorite(c.tableName, c.sysId);

        if (c.url) {
            if (c.target === "_self") {
                $location.search(c.url.substring(1));
            } else {
                $window.open(c.url, c.target);
            }
        }
    };

    c.iconClass = "";
    c.type = "";
    c.image = "";
    c.primaryField = "";
    c.secondaryField = "";
    c.url = "";
    c.view = 'card';
    if (c.data && c.data.content) {
        var favCardData = c.data.content;
        c.sysId = favCardData.sysId;
        c.tableName = favCardData.tableName;
        c.iconClass = favCardData.iconClass;
        c.type = favCardData.type;
        c.primaryField = favCardData.primaryField;
        c.image = favCardData.image;
        c.secondaryField = favCardData.secondaryField;
        c.url = favCardData.url;
        c.target = favCardData.target ? favCardData.target : "_self";
        c.view = favCardData.view;
    }

    $scope.$on("fav-card-view", function($evt, view) {
        c.view = view;
    });
};
