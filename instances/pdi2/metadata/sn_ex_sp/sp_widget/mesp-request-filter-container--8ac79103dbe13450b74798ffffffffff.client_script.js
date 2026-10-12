api.controller = function($scope, $timeout) {
    var c = this;
    c.filtersData = c.data.filterData;
    c.searchText = '';
    c.isSearchIconVisible = true;

    c.onSearchTextChange = function() {

        if (c.searchTimeout) {
            $timeout.cancel(c.searchTimeout);
        }

        c.searchTimeout = $timeout(function() {
            c.search(c.searchText);
        }, 300);
    };

    c.search = function(searchText) {
        if (searchText && searchText.length > 0) {
            c.isSearchIconVisible = false;
            $scope.$emit('sn_ex_sp.applyRequestSearch', c.filtersData, searchText);
        } else {
            c.resetSearch();
        }
    };

    c.resetSearch = function() {
        c.searchText = '';
        $scope.$emit('sn_ex_sp.applyRequestSearch', c.filtersData, "");
    };

    $scope.$on('sn_ex_sp.clearRequestSearch', function() {
        c.resetSearch();
    });
}
