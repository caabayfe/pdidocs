(function() {
    data.content = options;
    data.favoriteWidget = $sp.getWidget('ec_favorite', {
        'table': data.content.tableName,
        'sys_id': data.content.sysId,
        'broadcastFavoriteRecord': true,
        'overrideFavoriteEvaluation': true,
        'isFavorite': true,
        'common_page': true
    });
})();
