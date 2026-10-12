(function(query, facetService, searchResults) {
    var taxonomyId = $sp.getTaxonomies();

    var portalValue = "";
    if (!taxonomyId)
        portalValue = $sp.getCatalogs().value;
    var sc;
    var results = [];
    if (gs.getProperty("glide.sc.largeSet.optimization.enable", "false") == "true")
        return;
    sc = new sn_sc.CatalogSearch().search(portalValue, '', query);
    sc.addQuery('sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
    sc.addEncodedQuery('hide_sp=false^ORhide_spISEMPTY');
    if (taxonomyId) {
        sc.addQuery('taxonomy_topic.active', true);
        sc.addQuery('taxonomy_topic.taxonomy', taxonomyId);
    }

    sc.query();
    var catItemCount = 0;
    if (!taxonomyId) {
        while (sc.next()) {
            var primaryCategory = sc.getValue("category");
            if (GlideStringUtil.isEligibleSysID(primaryCategory)) {
                var primaryCategoryJS = new sn_sc.CatCategory(primaryCategory);
                var catalog_item = new sn_sc.CatItem(sc.getUniqueValue());
                var category = catalog_item.getFirstAccessibleCategoryForSearch(portalValue);
                if (!catalog_item.canViewOnSearch() ||
                    !category || !primaryCategoryJS.canView()) {
                    continue;
                }
                var item = {};
                item.categoryID = primaryCategory;
                var categoryJS = new sn_sc.CatCategory(primaryCategory);
                if (categoryJS) {
                    item.categoryLabel = categoryJS.getTitle();
                    item.catalogID = categoryJS.getCatalog();
                    var catalogJS = new sn_sc.Catalog(item.catalogID);
                    item.catalogLabel = catalogJS.getTitle();
                }
                results.push(item);
            }
        }
        var catalogMap = {};
        var categoryMap = {};
        var catalogCount = 0;
        results.forEach(function(item) {
            var catalogLabel = item.catalogLabel;
            var catalogValue = item.catalogID;
            var categoryLabel = item.categoryLabel;
            var categoryValue = item.categoryID;
            if (!categoryMap[categoryLabel]) {
                categoryMap[categoryLabel] = categoryValue;
            } else if ((categoryMap[categoryLabel] + "").indexOf(categoryValue) < 0) {
                categoryMap[categoryLabel] += "," + categoryValue;
            }
            if (!catalogMap[catalogLabel]) {
                catalogMap[catalogLabel] = catalogValue;
                catalogCount++;
            }
        });

        if (portalValue.split(",").length > 1) {
            var catalogFacet = facetService.createFacet(gs.getMessage('Catalog'), 'catalog');
            for (var label in catalogMap)
                catalogFacet.addFacetItem(label, catalogMap[label]);
        }

        var categoryFacet = facetService.createMultiChoiceFacet(gs.getMessage('ATF:Category_uppercase'), 'category');
        for (var label in categoryMap)
            categoryFacet.addFacetItem(label, categoryMap[label]);
    } else {
        var topics = {};
        while (sc.next()) {
            var primaryTopic = sc.getValue("taxonomy_topic");
            catalog_item = new sn_sc.CatItem(sc.getUniqueValue());

            if (!catalog_item.canViewOnSearch())
                continue;

            var topicLabel = sc.taxonomy_topic.getDisplayValue();
            topics[primaryTopic] = topicLabel;
        }
        var topicFacet = facetService.createMultiChoiceFacet('UppercaseTopic', 'topic');
        for (var id in topics)
            topicFacet.addFacetItem(topics[id], id);

    }



})(query, facetService, searchResults);
