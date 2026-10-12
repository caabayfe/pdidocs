(function() {
    var portalId = $sp.getPortalRecord().getUniqueValue();
    data.sortBy = $sp.getParameter('sortBy');
    var cardWidget = "favorite-content-card";
    var favoritePage = new sn_ex_sp.FavoritesPage(portalId);
    data.pageLimit = 5;
    data.favoriteCountPerPage = 24;

    var sortOptions = [{
            id: "newest",
            name: gs.getMessage("Date added (newest)")
        }, {
            id: "oldest",
            name: gs.getMessage("Date added (oldest)")
        },
        {
            id: "recVisited",
            name: gs.getMessage("Recently accessed")
        }
    ];
    data.sortOptions = sortOptions;

    if (!input) {
        data.favoriteTitle = gs.getMessage("My favorites");
        data.browseFavoritesTitle = gs.getMessage("Browse favorites");
        data.filterTitleResponsive = gs.getMessage("Filter by");
        data.sortTitle = gs.getMessage("Sort by");
        data.cardViewTitle = gs.getMessage("Card View");
        data.listViewTitle = gs.getMessage("List View");
        //When there is no content available on page load, completeEmptyState is displayed. 
        data.completeEmptyStateMessage = gs.getMessage("You haven't favorited anything yet");
        //When user unfavorites all content of a specific type using the favorite icon while staying on the favorites page, emptyState is displayed.    
        data.emptyStateMessage = gs.getMessage("You've removed all favorited items from here");
        var favoriteApi = new sn_ex_sp.FavoriteAPI();
        var qsConfig = $sp.getValue('quick_start_config');
        var favoriteIcon = favoriteApi.getFavoriteIcon(qsConfig);
        data.emptyStateIcon = favoriteIcon.checkIcon;
        data.contentTypes = favoriteApi.getFavoriteContentTypeWithCount();
        data.totalContentCount = data.contentTypes[0].count;
        if (data.totalContentCount == 0) {
            return;
        }
        data.contentList = favoritePage.getAllFavoritesWithContent(0, data.favoriteCountPerPage, true, '', data.sortBy);
        setPaginationParameters();
        addContentWidget(data.contentList, "card");
    }


    if (input && input.action === "getFavorites") {
        var favoriteApi = new sn_ex_sp.FavoriteAPI();
        var totalCount = 0;
        //update the count of all the contentTypes when we switch between filters
        for (var i = 1; i < input.contentTypes.length; i++) {
            input.contentTypes[i].count = parseInt(favoriteApi.getFavoriteTypeCount(input.contentTypes[i].sys_id));
            totalCount = totalCount + input.contentTypes[i].count;
        }
        input.contentTypes[0].count = totalCount;
        data.contentTypes = input.contentTypes;
        data.contentList = favoritePage.getAllFavoritesWithContent(input.start, input.end, input.inNewestOrder, input.contentTypeId, input.sortBy);
        setPaginationParameters(input.contentTypeId);
        addContentWidget(data.contentList, input.view);
    }

    function setPaginationParameters(contentTypeId) {
        var totalCount = getTotalCountOfFavorites(contentTypeId);
        //Total favorite count for the content type
        data.totalFavoritesCount = totalCount;
        //Number of pages to be displayed at once
        data.pageCount = Math.ceil(totalCount / data.favoriteCountPerPage);
        //Page array storing the page numbers
        data.pages = [];
        for (var i = 0; i < data.pageCount && i < data.pageLimit; i++) {
            data.pages.push(i + 1);
        }
    }

    function getTotalCountOfFavorites(contentTypeId) {
        var totalCount = 0;
        //Get the total number of favorites for a given content type excluding security
        for (var i = 0; i < data.contentTypes.length && contentTypeId; i++) {
            if (data.contentTypes[i].sys_id === contentTypeId) {
                totalCount = data.contentTypes[i].countWithoutCondition;
                break;
            }
        }
        if (!contentTypeId) {
            totalCount = data.contentTypes[0].countWithoutCondition;
        }
        return totalCount;
    }

    function addContentWidget(contentList, view) {
        contentList.map(function(content) {
            //send the view down to each card
            content.view = view;
            content.widgetData = $sp.getWidget(cardWidget, content);
        });
    }
})();
