function recentlyViewedFavorites($http) {
    this.updateLastViewedForFavorite = function(table, recordId) {
        $http.post('/api/sn_ex_sp/recent_favorites_api?table=' + table + '&recordId=' + recordId).then(function(response) {
            return response.status;
        });
    }
}
