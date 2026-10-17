api.controller = function($scope, $timeout) {
    var c = this;

    $scope.requestCards = c.data.requestCards;

    $scope.$on(c.data.draftDeleteEventName, function($event, data) {
        c.server.get({
            action: 'deleteDraft',
            draftItemId: data
        }).then(function(resp) {
            var reqCardId = "#reqCard-" + resp.data.draftItemId;
            $(reqCardId).css('display', 'none');
            var reqCardsLength = !$('.request-card').is(":visible");
            if (reqCardsLength) {
                c.data.hasContent = false;
            }
        });
    });

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

    $scope.loadMoreKeydown = function(event) {
        if (event.which === 32 || event.which === 13) {
            c.getMoreRequests(true);
        }
    };

};
