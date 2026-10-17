(function executeQuery(v_table, v_query) {

    var defaultPortalID = FavoriteConstants.MESP_PORTAL;
    var portalID = v_query.getParameter('portal') || defaultPortalID;
    var encodedQuery = v_query.getEncodedQuery();

    var contentType = getFilterQuery(encodedQuery) || "";
    var sortQuery = getSortQuery(encodedQuery);

    var isMobile = false;
    var versioningEnabled = GlidePluginManager.isActive('com.snc.knowledge_advanced') && gs.getProperty("glide.knowman.versioning.enabled", "true") === "true";
    if (portalID) {
        var portalGr = new GlideSPScriptable(portalID);
        if (portalGr.getValue('enable_favorites') == 'false') {
            return;
        }
        isMobile = portalGr.getValue('url_suffix') == "mesp" ? true : false;
        var PAGINATION_WINDOW_SIZE = 20;
        var start = v_query.getFirstRowWanted() || 0;
        var end = v_query.getLastRowWanted() || getFavoriteCount();
        v_query.setFirstRowWanted(0);
        v_query.setLastRowWanted(end - start);

        var favoriteConfig = new FavoriteContentConfigAPI(isMobile, contentType, portalGr);
        var configTables = favoriteConfig.getConfigTables() || [];


        if (isMobile) {
            getFavoritesForMobile(PAGINATION_WINDOW_SIZE);
        } else {
            getFavoritesForDesktop(start, end);
        }
    }

    function getFavoritesForMobile(windowSize) {

        var index = -1;
        var startWindow = 0;
        var endWindow = windowSize;
        while (true) {
            var favoriteGr = new GlideRecord("sp_favorite");

            favoriteGr.addEncodedQuery(sortQuery);
            favoriteGr.chooseWindow(startWindow, endWindow);
            favoriteGr.addQuery("user", gs.getUserID());
            favoriteGr.addQuery("reference_table", "IN", configTables);
            favoriteGr.query();
            if (!favoriteGr.hasNext())
                break;

            while (favoriteGr.next()) {
                var referenceTable = favoriteGr.getValue('reference_table').toString();
                if (isKBClass(referenceTable) && versioningEnabled) {

                    replaceFavoriteWithLatestArticle(favoriteGr);

                }
                if (!canView(favoriteGr, isMobile))
                    continue;

                var favoriteDetails = getFavoriteDetails(favoriteGr) || {};

                var favorite = favoriteConfig.applyConfig(favoriteDetails) || [];

                if (favorite.length == 0)
                    continue;

                index++;

                //skip all records to start of window
                if (index < start)
                    continue;

                if (index < end)
                    v_table.addRow(getRowData(favorite[0]));
                else
                    break;
            }

            //Check if bucket is full 
            if (index >= end)
                break;

            startWindow = endWindow;
            endWindow = endWindow + windowSize;
        }
    }

    function getFavoriteDetails(favoriteGr) {
        var favoriteInfo = {
            "fav_sys_id": favoriteGr.getValue("sys_id") || "",
            "sys_id": favoriteGr.getValue("reference_document"),
            "sys_updated_on": favoriteGr.getValue("sys_updated_on"),
            "table_name": favoriteGr.getValue("reference_table"),
            "sys_created_on": favoriteGr.getValue("sys_created_on"),
            "last_viewed": favoriteGr.getValue("last_viewed") ? favoriteGr.getValue("last_viewed") : favoriteGr.getValue("sys_created_on")
        };
        var refTable = favoriteGr.getValue("reference_table");
        var favorite = {};
        favorite[refTable] = [];
        favorite[refTable].push(favoriteInfo);
        return favorite;
    }

    function getFavoritesForDesktop(start, end) {
        var favorites = getFavorites(start, end);
        var response = favoriteConfig.applyConfig(favorites);
        for (var i = 0; i < response.length; i++) {
            var row = {};
            row.portal = portalID;
            row.start = start;
            row.end = end;
            populateRow(row, response[i]);
            v_table.addRow(row);
        }
    }

    function getFavorites(start, end) {

        var favorites = {};
        var favoriteGr = new GlideRecord('sp_favorite');
        favoriteGr.addQuery("user", gs.getUserID());
        favoriteGr.addQuery("reference_table", "IN", configTables);
        favoriteGr.addEncodedQuery(sortQuery);
        favoriteGr.chooseWindow(start, end);
        favoriteGr.query();
        while (favoriteGr.next()) {
            var referenceTable = favoriteGr.getValue('reference_table').toString();
            if (isKBClass(referenceTable) && versioningEnabled) {

                replaceFavoriteWithLatestArticle(favoriteGr);

            }
            if (canView(favoriteGr, isMobile)) {

                if (!favorites[referenceTable]) {
                    favorites[referenceTable] = [];
                }

                var favorite = {
                    "fav_sys_id": favoriteGr.getValue("sys_id") || "",
                    "sys_id": favoriteGr.getValue("reference_document"),
                    "sys_updated_on": favoriteGr.getValue("sys_updated_on"),
                    "table_name": referenceTable,
                    "sys_created_on": favoriteGr.getValue("sys_created_on"),
                    "last_viewed": favoriteGr.getValue("last_viewed") ? favoriteGr.getValue("last_viewed") : favoriteGr.getValue("sys_created_on")
                };
                favorites[referenceTable].push(favorite);
            }
        }
        return favorites;
    }

    /**
     * Find the latest published version of the favorited knowledge article and update the sp_favorite record with that version.
     * @param {GlideRecord} favoriteGr - GlideRecord on sp_favorite table.
     **/
    function replaceFavoriteWithLatestArticle(favoriteGr) {
        var kbId = favoriteGr.getValue('reference_document');
        var originalKbGr = new GlideRecord('kb_knowledge');
        originalKbGr.get(kbId);
        var publishedKbGr = new GlideRecord('kb_knowledge');
        publishedKbGr.addQuery('article_id', originalKbGr.getValue('article_id'));
        publishedKbGr.addQuery('workflow_state', 'published');
        publishedKbGr.orderByDesc('sys_created_on');
        publishedKbGr.setLimit(1);
        publishedKbGr.query();
        if (publishedKbGr.next()) {
            favoriteGr.setValue('reference_document', publishedKbGr.getUniqueValue());
            favoriteGr.update();
        }
    }

    function canView(gr, isMobile) {
        var refRecord = new GlideRecord(gr.reference_table);
        if (refRecord.get(gr.reference_document)) {
            if (FavoriteSecurityUtil.canView(refRecord, isMobile)) {
                return true;
            }
        }
        return false;
    }

    function populateRow(row, obj) {
        for (key in obj) {
            row[key] = obj[key];
        }
    }

    function getFavoriteCount() {
        var count = 0;
        var favoriteGr = new GlideAggregate("sp_favorite");
        favoriteGr.addAggregate("COUNT");
        favoriteGr.addQuery("user", gs.getUserID());
        favoriteGr.query();
        if (favoriteGr.next()) {
            count = favoriteGr.getAggregate("COUNT");
        }
        return count;
    }

    function getSortQuery(query) {
        if (query.indexOf('ORDERBYsys_created_on') > -1) {
            return 'ORDERBYsys_created_on';
        } else if (query.indexOf('ORDERBYDESClast_viewed') > -1) {
            return 'ORDERBYDESClast_viewed^ORDERBYsys_created_on';
        }
        return 'ORDERBYDESCsys_created_on';

    }

    function getFilterQuery(query) {
        var index = query.indexOf('categoryIN');
        if (index == -1) {
            if (query.indexOf('categoryISEMPTY') > -1)
                return "ISEMPTY";
            return "";
        }
        var categoriesEndIndex = query.substring(index).indexOf('^');
        return query.substring(index + 10, index + categoriesEndIndex);
    }

    function isKBClass(tableName) {
        var table = new GlideTableHierarchy(tableName);
        return ("kb_knowledge" === table.getRoot());
    }

    function getRowData(response) {
        var row = {};
        row.portal = portalID;
        for (key in response) {
            row[key] = response[key];
        }
        return row;
    }
})(v_table, v_query);
