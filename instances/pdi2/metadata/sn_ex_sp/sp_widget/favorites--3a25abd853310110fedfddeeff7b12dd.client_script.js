api.controller = function($scope, $timeout, $rootScope) {
    /* widget controller */
    var c = this;
    $scope.loading = false;
    var CARD_VIEW = "card";
    var LIST_VIEW = "list";
    c.view = "card";
    c.sortBy = c.data.sortBy || "newest";
    //contentTypes list contains "All" at 0th position. So when contentTypes length is 2, it actually has just one real content type. So we don't need to display any filters.
    c.displayFilters = (c.data.contentTypes.length > 2);
    c.activeFilterId = c.displayFilters ? c.data.contentTypes[0].sys_id : "";
    c.displayInfoMessage = true;


    c.setInaccessibleFavoriteCount = function(end) {
        if (c.data.contentList) {
            c.inaccessibleFavoriteCount = (end - c.start) - c.data.contentList.length;
        } else {
            c.inaccessibleFavoriteCount = (end - c.start);
        }
    };

    c.handleFilterKeydown = function($event, contentType, $index) {
        if ($event.keyCode === 13 || $event.keyCode === 32) { // Enter or Space
            $event.preventDefault();
            if (c.activeFilterId !== contentType.sys_id) {
                c.getFilteredContent(contentType.sys_id);
            }
        } else if ($event.keyCode === 37 || $event.keyCode === 38) { // Left or Up arrow
            $event.preventDefault();
            var prevIndex = Math.max(0, $index - 1);
            document.getElementById('tab-' + c.data.contentTypes[prevIndex].sys_id).focus();
        } else if ($event.keyCode === 39 || $event.keyCode === 40) { // Right or Down arrow
            $event.preventDefault();
            var nextIndex = Math.min(c.data.contentTypes.length - 1, $index + 1);
            document.getElementById('tab-' + c.data.contentTypes[nextIndex].sys_id).focus();
        } else if ($event.keyCode === 36) { // Home
            $event.preventDefault();
            document.getElementById('tab-' + c.data.contentTypes[0].sys_id).focus();
        } else if ($event.keyCode === 35) { // End
            $event.preventDefault();
            document.getElementById('tab-' + c.data.contentTypes[c.data.contentTypes.length - 1].sys_id).focus();
        }
    };

    c.resetPagination = function() {
        c.page = 1;
        c.start = 0;
        c.end = c.data.favoriteCountPerPage;
        c.pageLimit = c.data.pageLimit;
        c.unfavoritedCount = 0;
    };

    c.setPaginationParameters = function() {
        c.resetPagination();
        if (c.data.totalFavoritesCount > c.data.favoriteCountPerPage) {
            c.setInaccessibleFavoriteCount(c.data.favoriteCountPerPage);
        } else {
            c.setInaccessibleFavoriteCount(c.data.totalFavoritesCount);
        }
    };

    c.getPageAction = function(page) {
        return page < c.page ? "prev" : "next";
    };

    c.resetPageNumbers = function() {

        c.data.totalFavoritesCount = c.data.totalFavoritesCount - c.unfavoritedCount;
        c.data.pageCount = Math.ceil(c.data.totalFavoritesCount / c.data.favoriteCountPerPage);
        c.pageStart = c.data.pages[0];
        c.data.pages = [];
        for (var i = c.pageStart; i <= c.data.pageCount && i < c.pageStart + c.data.pageLimit; i++) {
            c.data.pages.push(i);
        }

    };

    c.getFavorites = function(page, contentTypeId, sortBy) {

        $scope.loading = true;

        var pageAction = page ? c.getPageAction(page) : "";
        c.page = page ? page : c.page;
        //Start and end count of the page should continue when filter or sorting option is not changed
        if (!contentTypeId && !sortBy) {
            if (c.unfavoritedCount) {
                //Refresh page numbers when items are unfavorited
                c.resetPageNumbers();
            }
            //Update start and end values for each page only except when the entire content of the previous page is favorited
            if (!(pageAction === 'next' && c.unfavoritedCount >= c.data.contentList.length)) {
                c.start = parseInt((page - 1) * c.data.favoriteCountPerPage);
                c.end = parseInt(c.start + c.data.favoriteCountPerPage) > c.data.totalFavoritesCount ? c.data.totalFavoritesCount : parseInt(c.start + c.data.favoriteCountPerPage);
            }
            c.unfavoritedCount = 0;
        } else {
            //Page start should point to first when there is a change in filter or sorting option
            c.resetPagination();
        }


        $scope.server.get({
            "action": "getFavorites",
            "contentTypeId": c.activeFilterId,
            "contentTypes": c.data.contentTypes,
            "inNewestOrder": c.sortBy === "newest",
            "sortBy": c.sortBy,
            "start": c.start,
            "end": c.end,
            "view": c.view
        }).then(function(response) {
            c.data.contentList = response.data.contentList;
            c.data.totalFavoritesCount = response.data.totalFavoritesCount;
            c.data.pageCount = response.data.pageCount;
            c.data.contentTypes = response.data.contentTypes;
            //Page count should be updated only when entire data is refreshed
            if (contentTypeId || sortBy) {
                c.data.pages = response.data.pages;
            }
            if (c.data.totalFavoritesCount < c.end) {
                c.setInaccessibleFavoriteCount(c.data.totalFavoritesCount);
            } else
                c.setInaccessibleFavoriteCount(c.end);

            $scope.loading = false;
        });
    };

    c.getFilteredContent = function(contentTypeId) {
        c.activeFilterId = contentTypeId;
        if (!contentTypeId) {
            contentTypeId = "All";
        }
        c.getFavorites('', contentTypeId);
    };

    c.changeView = function(view) {
        c.view = view;
        $rootScope.$broadcast('fav-card-view', c.view);
    };
    c.redirect = function($event) {
        $event.stopPropagation();
        $timeout(function() {
            $($event.currentTarget).find('.content-card').click();
        }, 20);
    };

    c.switchTab = function($event) {
        if ($event.which == 37 || $event.which == 39) {
            $event.preventDefault();
            $event.stopPropagation();
            var layout = c.view === CARD_VIEW ? LIST_VIEW : CARD_VIEW;
            c.changeView(layout);
            $('#tab-' + layout).focus();
        }
    };
    c.getSortedContent = function() {
        c.getFavorites('', c.activeFilterId, c.sortBy);
    };

    c.getFavoritesOnPagination = function(page) {
        c.getFavorites(page);
    };
    c.getNextPageRecords = function() {
        var pages = c.data.pages;
        if (c.data.pageCount <= c.page) {
            return;
        }

        $('page-item-link.active').removeClass('active').next().addClass('active');
        if (pages.indexOf(c.page) === c.pageLimit - 1) {
            pages.push(pages[c.pageLimit - 1] + 1);
            pages.shift();
        }
        c.getFavorites(c.page + 1);
    };
    c.getPrevPageRecords = function() {
        if (c.page <= 1) {
            return;
        }
        var pages = c.data.pages;
        $('page-item-link.active').removeClass('active').prev().addClass('active');
        if (pages.indexOf(c.page) === 0) {
            pages.unshift(c.page - 1);
            pages.pop();
        }
        c.getFavorites(c.page - 1);
    };

    c.getActivePageClass = function(page) {
        return page === c.page ? "active" : "";
    };

    /* Add border radius to first and last li elements for the pages */
    c.getPageClass = function(index) {
        var pageClass = "page-link";
        if (index === 0) {
            pageClass = pageClass + " page-first-index";
        } else if (index === c.data.pageLimit - 1 || index === c.data.pages.length - 1) {
            pageClass = pageClass + " page-last-index";
        }
        return pageClass;
    };

    c.getOrderByParameter = function() {
        return c.sortBy === 'newest' ? '-sys_updated_on' : 'sys_updated_on';
    };

    c.removeInfoMessage = function() {
        c.displayInfoMessage = false;
        $('.msg-close-btn').tooltip('hide');
    };

    $scope.$on("favoriteRecord", function($evt, favoriteRecord) {
        var contentTypeTables = [];
        //Creating a list of content type tables corresponding to the favorites configuration
        for (var index = 1; index < c.data.contentTypes.length; index++) {
            contentTypeTables.push(c.data.contentTypes[index].table);
        }
        for (var i = 0; i < c.data.contentTypes.length; i++) {
            if (c.data.contentTypes[i].tables.indexOf(favoriteRecord.table) != -1 && (contentTypeTables.indexOf(favoriteRecord.table) == -1 || c.data.contentTypes[i].table == favoriteRecord.table) || c.data.contentTypes[i].sys_id == '') {
                c.data.contentTypes[i].count = parseInt(c.data.contentTypes[i].count) + (favoriteRecord.addToFavorite ? 1 : -1);
            }
        }
        c.unfavoritedCount = c.unfavoritedCount + (favoriteRecord.addToFavorite ? -1 : 1);
    });

    c.setPaginationParameters();
};
