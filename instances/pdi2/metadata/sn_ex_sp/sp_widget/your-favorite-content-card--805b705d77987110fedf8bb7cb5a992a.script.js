(function() {
    data.content = options;
    data.favoriteWidget = $sp.getWidget('ec_favorite', {
        'table': data.content.table,
        'sys_id': data.content.sysId,
        'common_page': true
    });
})();
