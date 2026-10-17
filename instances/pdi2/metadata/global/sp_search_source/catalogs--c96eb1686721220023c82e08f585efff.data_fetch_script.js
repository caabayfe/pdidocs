var indexGroup = (typeof indexGroup !== "undefined") ? indexGroup : "portal_index_group";
var queryLocation = (typeof queryLocation != "undefined") ? queryLocation : 0;
(function(query, indexGroup, queryLocation) {
    // To support pagination. The value set to the key query_location on the last item is available in the next iteration here
    queryLocation = queryLocation || 0;
    var limitCount = data.limit;
    var results = [];
    //Here goes the logic. Compute results however you want!
    if (!gs.isLoggedIn())
        return results;

    var taxonomyId = $sp.getTaxonomies();
    var sc;
    if (taxonomyId) {
        //For taxonomy topic based search send catalogs and categories as empty .
        sc = new sn_sc.CatalogSearch().search('', '', query);
        sc.addQuery('taxonomy_topic.active', true);
        sc.addQuery('taxonomy_topic.taxonomy', taxonomyId);
        sc.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
        if (!($sp.getPortalRecord() && $sp.getPortalRecord().getValue('url_suffix') === 'swp')) {
            sc.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
        }
        if (facets.topic)
            sc.addQuery("taxonomy_topic", "IN", facets.topic.join(","));
    } else {
        var portalValue = $sp.getCatalogs().value;
        sc = new sn_sc.CatalogSearch().search(portalValue, '', query);
        sc.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
        if (!($sp.getPortalRecord() && $sp.getPortalRecord().getValue('url_suffix') === 'swp')) {
            sc.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
        }
        if (facets.category)
            sc.addQuery("category", "IN", facets.category.join(","));
        if (facets.catalog)
            sc.addQuery("sc_catalogs", "CONTAINS", facets.catalog);
    }

    if (indexGroup)
        sc.addQuery('123TEXTINDEXGROUP321', indexGroup);

    var newLimitCount = queryLocation + limitCount;
    sc.query();
    var catCount = 0;
    while (sc.next() && catCount < newLimitCount + 1) {
        var catalog_item = new sn_sc.CatItem(sc.getUniqueValue());
        var category = catalog_item.getFirstAccessibleCategoryForSearch(facets.catalog ? facets.catalog : portalValue);
        var canViewItem = catalog_item.canViewOnSearch();
        if (!taxonomyId && !category)
            canViewItem = false;

        if (!canViewItem)
            continue;

        // We compute the first k + r and return the last r items
        if (catCount < queryLocation) {
            catCount++;
            continue;
        }

        var item = {};
        item.type = "sc"; // supported types are "sc" and "sc_content"
        item.page = "sc_cat_item";
        item.table = "sc_cat_item"; // populate the table name for analytics
        item.portal = $sp.getPortalRecord().getValue('url_suffix');
        if (sc.getRecordClassName() == "sc_cat_item_guide")
            item.page = "sc_cat_item_guide";
        else if (sc.getRecordClassName() == "sc_cat_item_content") {
            var gr = new GlideRecord('sc_cat_item_content');
            gr.get(sc.getUniqueValue());
            $sp.getRecordValues(item, gr, 'url,content_type,kb_article');
            item.type = "sc_content";
        }

        $sp.getRecordDisplayValues(item, sc, 'name,short_description,sys_id,sys_class_name');

        item['picture'] = catalog_item.getPicture();
        item['icon'] = catalog_item.getIcon();
        item['price'] = catalog_item.getCompleteItemPrice();
        item.score = parseInt(sc.ir_query_score.getDisplayValue());
        item.label = item.name;
        item.primary = item.name;
        item.legacy = false;
        // determine URL/target and default icon in case item has no picture/icon
        if (item.type == "sc") {
            var itemSummary = catalog_item.getItemSummary(false, "basic");
            if (item.portal == 'catalog' && itemSummary.legacy) {
                item.legacy = true;
                if (itemSummary.type == 'order_guide')
                    item.url = '/cat_item_guide_view.do?sysparm_guide=' + itemSummary.sys_id;
                else
                    item.url = '/cat_item_view.do?sysparm_id=' + itemSummary.sys_id;
            } else {
                item.url = '?id=' + item.page + '&sys_id=' + item.sys_id;
                item.legacy = false;
            }
            item.default_icon = "folder-open-o";
        } else if (item.type == "sc_content") {
            item.default_icon = "book";
            if (item.content_type == "kb") {
                item.url = '?id=kb_article&sys_id=' + item.kb_article;
                item.default_icon = "file-text-o";
            } else if (item.content_type == "external") {
                item.url = item.url + "";
                item.target = '_blank';
            } else if (item.content_type == "dynamic") {
                var itemSummary = catalog_item.getItemSummary(false, "basic");
                var dynamicContentItemConfig = itemSummary.dynamic;
                var portalUrl = new global.DynamicCatalogContentUtil().getServicePortalUrl(dynamicContentItemConfig.model, dynamicContentItemConfig.content);
                if (portalUrl)
                    item.portalUrl = portalUrl;

                item.url = itemSummary.url + "";
            } else
                item.url = '?id=sc_cat_item&sys_id=' + item.sys_id;
        }

        item['query_location'] = catCount;
        results.push(item);
        catCount++;
    }

    if (!data.includeFacets)
        $sp.logSearch('sc_cat_item', query, sc.getRowCount(), data.searchType, data.portal, data.page);

    // We have populated one extra to know if it is the last result in the list
    if (results.length !== 0) {
        if (results.length > limitCount)
            results.pop();
        else
            results[results.length - 1].isLastResult = true;
    }

    return results;
})(query, indexGroup, queryLocation);
