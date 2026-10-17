api.controller = function(cabrillo, $rootScope, $scope) {
    var c = this;
    c.disableIcon = false;
    //send current url to server to compare it with favorite config navigation url and mark favorite as recently viewed if they match.
    c.markAsRecentlyViewed = function() {
        c.server.get({
            "action": "markAsRecentlyViewed",
            "table": c.data.table,
            "recordId": c.data.sys_id,
            "isFavorite": c.data.isFavorite,
            "currentUrl": window.location.href
        }).then(function(resp) {
            return;
        });
    };
    if (!c.data.callerPage)
        c.markAsRecentlyViewed();

    c.toggleFav = function($event) {

        //prevent clicking the parent widget card
        $event.preventDefault();
        if ($event.stopPropagation) {
            $event.stopPropagation();
        }
        if (c.disableIcon)
            return;
        var markFavorite = !c.data.isFavorite;
        //make the icon readonly until we get the response from server.
        c.disableIcon = true;
        c.server.get({
            "action": "toggleFavorite",
            "markFavorite": markFavorite,
            "table": c.data.table,
            "recordId": c.data.sys_id,
        }).then(function(resp) {
            c.data.isFavorite = resp.data.isFavorite;
            c.broadcastFavorite();
            if (c.data.broadcastFavoriteRecord) {
                c.broadcastFavoriteRecord(c.data.isFavorite);
            }

            var srId = "favorite_sr_" + c.data.sys_id;
            document.getElementById(srId).innerHTML = c.data.isFavorite ? c.data.addedToFavoritesMessage : c.data.removedFromFavoritesMessage;
            
            // DEF0700321 - destroy and reinitialize tooltip with updated text
            var tooltipElement = $('[data-favorite-id = "favorite_button_' + c.data.sys_id + '"]');
            tooltipElement.tooltip('destroy');
            tooltipElement.attr('data-original-title', c.data.isFavorite ? c.data.unFavoriteTitle : c.data.favoriteTitle);
            tooltipElement.tooltip();
            
            c.disableIcon = false;
            c.markAsRecentlyViewed();
        });
    };
    c.broadcastFavoriteRecord = function(addToFavorite) {
        var favoriteRecord = {
            "recordId": c.data.sys_id,
            "table": c.data.table,
            "addToFavorite": c.data.isFavorite
        };
        $rootScope.$broadcast('favoriteRecord', favoriteRecord);
    };
    c.broadcastFavorite = function() {
        var favorite = {
            "showFavorite": c.data.show_favorite,
            "isFavorite": c.data.isFavorite
        };
        $rootScope.$broadcast('favorite', favorite);
    };
    c.broadcastFavorite();

    $scope.$on('$destroy', function() {
        $('[data-favorite-id = "favorite_button_' + c.data.sys_id + '"]').tooltip('destroy');
    });

    $scope.$on('toggleFavorite', function($event) {
        c.toggleFav($event);
    });

    // Handle keyboard accessibility for favorite button
    c.handleFavoriteKeydown = function($event) {
        if ($event.key === 'Enter' || $event.key === ' ') {
            $event.preventDefault();
            c.toggleFav($event);
        }
    };
};
