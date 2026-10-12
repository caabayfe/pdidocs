(function() {
    /**
     * @option {String} (mandatory) table
     * @option {String} (mandatory) sys_id
     * @option {Boolean} (optional) boradcastFavoriteRecord - if true, broadcast the record sys_id, table name and isFavorite to the parent widget
     * @option {Boolean} (optional) overrideFavoriteEvaluation - if true, refer to isFavorite value from the next widget @option instead of evaluating it through isFavorite API. 
     * @option {Boolean} (optional) isFavorite - used to display the initial state of favorite button for a record if overridFavoriteEvaluation is true
     * @option {String} (optional) favoriteTitle - used to display aria-label and tootltip when content is not yet favorited
     * @option {String} (optional) unFavoriteTitle - used to display aria-label and tootltip when content is already favorited
     **/
    var isMobile = $sp.getValue('sys_id') === sn_ex_sp.FavoriteConstants.MESP_PORTAL;
    var favorite = new sn_ex_sp.FavoriteAPI(isMobile);

    var isInitialRenderCall = !input || !input.hasOwnProperty('action');
    // runs when the widget is first loaded
    if (isInitialRenderCall) {
        //if the widget is called from server side of the parent widget, widget options are passed into 'options' object
        //if the widget is called from client side of the parent widget, widget options are passed into 'input' object
        var dataFromParentWidget = input || options;
        data.table = dataFromParentWidget.table;
        data.sys_id = dataFromParentWidget.sys_id;
        data.callerPage = dataFromParentWidget.common_page || false;
        data.broadcastFavoriteRecord = dataFromParentWidget.broadcastFavoriteRecord || false;
        data.overrideFavoriteEvaluation = dataFromParentWidget.overrideFavoriteEvaluation || false;
        //if overideFavoriteEvaluation is true, refer to isFavorite value from widget options instead of evaluating it through isFavorite API. 
        data.isFavorite = data.overrideFavoriteEvaluation ? (dataFromParentWidget.isFavorite || false) : false;
        data.favoriteTitle = dataFromParentWidget.favoriteTitle || gs.getMessage('Favorite');
        data.unFavoriteTitle = dataFromParentWidget.unFavoriteTitle || gs.getMessage('Unfavorite');

        if (gs.nil(data.table) || gs.nil(data.sys_id)) {
            data.show_favorite = false;
            return;
        }

        if ($sp.getValue('enable_favorites') != 'true') {
            data.show_favorite = false;
            return;
        }
        // if the content is not configured then don't show the icon
        if (!favorite.configAPI.isRecordConfigured(data.table, data.sys_id)) {
            data.show_favorite = false;
            return;
        }

        data.show_favorite = true;
        if (!dataFromParentWidget.favoriteTitle || !dataFromParentWidget.unFavoriteTitle) {
	    var config = new sn_ex_sp.FavoriteContentConfigAPI().getConfig(data.table, data.sys_id);
            var objectRecord = new GlideRecord(data.table);
            objectRecord.get(data.sys_id);
            var itemTitle = objectRecord.getDisplayValue(config.primary_display);
            data.favoriteLabel = gs.getMessage('Favorite for {0}', itemTitle);
            data.unFavoriteLabel = gs.getMessage('Unfavorite for {0}', itemTitle);
        } else {
            data.favoriteLabel = dataFromParentWidget.favoriteTitle;
            data.unFavoriteLabel = dataFromParentWidget.unFavoriteTitle;
        }
        
  
        data.addedToFavoritesMessage = gs.getMessage('Added to favorites');
        data.removedFromFavoritesMessage = gs.getMessage('Removed from favorites');

        if (!data.overrideFavoriteEvaluation) {
            data.isFavorite = favorite.isFavorite(data.table, data.sys_id);
        }


        var qsConfig = $sp.getValue('quick_start_config');
        var favoriteIcon = favorite.getFavoriteIcon(qsConfig);
        data.checkIcon = favoriteIcon.checkIcon;
        data.unCheckIcon = favoriteIcon.unCheckIcon;
        data.color = favoriteIcon.color;
        data.isMobile = isMobile;
    }
    //update last viewed for the favorite on first load and createFavorite
    if (input && input.action == 'markAsRecentlyViewed' && input.isFavorite) {
        favorite.markAsRecentlyViewed(input.table, input.recordId, input.currentUrl);
    }

    // runs on click of the favorite icon
    if (!isInitialRenderCall && input.action == 'toggleFavorite') {
        data.isFavorite = input.markFavorite ? favorite.createFavorite(input.table, input.recordId) : !favorite.removeFavorite(input.table, input.recordId);
    }
})();
