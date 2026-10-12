var FavoritesPageSNC = Class.create();
FavoritesPageSNC.prototype = {
    initialize: function(portalID) {
        this.portalID = portalID;
        this.FAVORITES_REMOTE_TABLE = "sn_ex_sp_st_favorite";
    },

    /**
     * @param {String} portalId - Portal record sys_id
     * @param {String} contentTypes - Favorite content type sys_ids
     * @param {Integer} start - Initial row number
     * @param {Integer} end - Final row number
     * @param {String} sortBy - sortBy option
     * @returns favorites array with content and navigation
     **/
    getAllFavoritesWithContent: function(start, end, inNewestOrder, contentTypes, sortBy, instanceId, statsParentId) {
        var stats = {};
        stats.callerId = instanceId;
        stats.callerTable = instanceId ? 'sp_instance' : '';
        stats.parentId = statsParentId;
        stats.textPrefix = 'Get All Favorites With Content';
        stats.userId = gs.getUserID();
        var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();

        sortBy = (!sortBy && inNewestOrder) ? "newest" : sortBy;
        var favorites = [];
        var favoritesGr = new GlideRecord(this.FAVORITES_REMOTE_TABLE);
        favoritesGr.addQuery("portal", this.portalID);
        switch (sortBy) {
            case "newest":
                favoritesGr.orderByDesc("sys_created_on");
                break;
            case "oldest":
                favoritesGr.orderBy("sys_created_on");
                break;
            case "recVisited":
                favoritesGr.orderByDesc("last_viewed");
                break;
        }

        if (contentTypes) {
            favoritesGr.addQuery("category", "IN", contentTypes);
        }
        favoritesGr.chooseWindow(start, end);
        favoritesGr.query();
        while (favoritesGr.next()) {
            stats.startTime = new GlideDateTime();
            var image_url = favoritesGr.getDisplayValue("fav_image_url");
            var image = favoritesGr.getDisplayValue("fav_image");
            var favorite = {
                "sysId": favoritesGr.getUniqueValue() || '',
                "tableName": favoritesGr.getValue("table_name") || '',
                "iconClass": favoritesGr.getValue("badge_icon") ? 'fa-' + favoritesGr.getValue("badge_icon") : '',
                "type": favoritesGr.getDisplayValue("category") || '',
                "primaryField": favoritesGr.getDisplayValue("primary_display") || '',
                "image": image || (image_url || ''),
                "secondaryField": favoritesGr.getValue("secondary_display") || '',
                "url": favoritesGr.getValue("url") || '',
                "target": favoritesGr.getValue("target") || '',
                "end": favoritesGr.getValue("end") || ''
            };
            favorites.push(favorite);
            stats.refTable = this.FAVORITES_REMOTE_TABLE;
            stats.refRecordId = favoritesGr.getUniqueValue();
            stats.shortDesc = '';
            performanceIndicatorUtil.postHotspot(stats);
        }
        return favorites;
    },

    type: 'FavoritesPageSNC'
};
