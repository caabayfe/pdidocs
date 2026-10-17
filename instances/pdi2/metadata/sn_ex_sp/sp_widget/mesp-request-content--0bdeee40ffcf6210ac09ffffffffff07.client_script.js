api.controller = function($scope, $timeout, cabrillo) {
    /* widget controller */
    var c = this;

    $scope.requestCards = c.data.requestCards;

    c.openRequestDetail = function(requests) {

        var screenId = requests.options.screenId;
        var recordId = requests.options.sysID;
        var table = requests.options.tableName;

        cabrillo.nowapp.openScreenWithRecordContext(screenId, table, recordId);

    };

    c.getMoreRequests = function(shouldFocus) {
        $scope.isLoading = true;
        var focusIndex = $scope.requestCards.length;
        c.server.get({
            action: 'loadMoreRequests',
            tabId: c.data.tabId,
            uiFilters: c.data.uiFilters,
            limit: c.data.limit,
            searchParam: c.data.searchParam,
            lastRenderedCard: c.data.lastRenderedCard,
            isDraftTab: c.data.isDraftTab,
            offset: c.data.offset
        }).then(function(resp) {
            c.data.lastRenderedCard = resp.data.lastRenderedCard;
            c.data.showMore = resp.data.showMore;
            $scope.requestCards = $scope.requestCards.concat(resp.data.nextRequestCards);
            $scope.isLoading = false;
            if (shouldFocus) {
                $timeout(function() {
                    $('.request-card-title').get(focusIndex).focus();
                }, 100);
            }
        });
    };

};
