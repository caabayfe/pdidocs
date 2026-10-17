(function(query, facetService, searchResults) {

    /* Calculate your facets here using facetService */
    /* var stateFacet = facetService.createFacet('State', 'state'); */
    /* stateFacet.addFacetItem('Facet Item Label', '123'); */

    // If no facets selected and no results, don't show any facets
    if (searchResults.length == 0 && Object.keys(facets).length == 0)
        return;

    var kbLabelMap = {
        more_than_500: "More Than 500",
        more_than_200: "More Than 200",
        more_than_100: "More Than 100",
        more_than_50: "More Than 50",
        more_than_10: "More Than 10",
        less_than_10: "Less Than 10",
        more_ago: "Past 2 Years",
        year_ago: "Past Year",
        month_ago: "Past Month",
        week_ago: "Past Week",
        day_ago: "Past 24 Hours"
    };

    var kbArray = [];
    var kbQuery = '';
    var kbQueryDataObj = {};
    var kbQueryData = '';
    var taxonomyId = $sp.getTaxonomies();
    if (taxonomyId) {
        kbQuery = "taxonomy_topic.active=true^taxonomy_topic.taxonomyIN" + taxonomyId;
        kbQueryDataObj = {
            value: 'kb',
            dynamic: false,
            filters: [{
                id: 'kb',
                label: 'Knowledge base',
                order: 1,
                query: [{
                    display_value: kbQuery,
                    table: 'kb_knowledge',
                    value: kbQuery
                }]
            }]
        };
        kbQueryData = JSON.stringify(kbQueryDataObj);
    } else {
        var kbs = $sp.getKnowledgeBases();
        if (!gs.nil(kbs)) {
            kbArray = kbs.split(',');
            kbQuery = 'kb_knowledge_baseIN' + kbs;
            kbQueryDataObj = {
                value: 'kb',
                dynamic: false,
                filters: [{
                    id: 'kb',
                    label: 'Knowledge base',
                    order: 1,
                    query: [{
                        display_value: kbQuery,
                        table: 'kb_knowledge',
                        value: kbQuery
                    }]
                }]
            };
            kbQueryData = JSON.stringify(kbQueryDataObj);
        }
    }

	var honourSearchOrder = gs.getProperty('glide.sp.honour.kb.search.order', false);
	var searchOrderBy = honourSearchOrder === 'true' ? '' : 'sys_view_count,true';
	
    var kbFacets = new KBPortalServiceImpl().getAllFacets(query, '',
        '{"kb_knowledge_base":{"aggregate":false,"include_null":false,"orderby":"label","table":"kb_knowledge","value":[]},"author":{"aggregate":false,"include_null":false,"orderby":"label","table":"kb_knowledge","value":[]},"kb_category":{"aggregate":false,"include_null":true,"orderby":"label","table":"kb_knowledge","value":[]},"taxonomy_topic":{"aggregate":false,"include_null":false,"orderby":"label","table":"kb_knowledge","value":[]}}',
        '{' + (kbQueryData ? 'kb:' + kbQueryData + "," : "") + '"modified":{"dynamic":false,"filters":[{"id":"more_ago","label":"Past 2 Years","order":5,"query":[{"display_value":"sys_updated_onRELATIVEGT@year@ago@2^sys_updated_onRELATIVELT@year@ago@1","table":"","value":"sys_updated_onRELATIVEGT@year@ago@2"}]},{"id":"year_ago","label":"Past Year","order":4,"query":[{"display_value":"sys_updated_onRELATIVEGT@year@ago@1^sys_updated_onRELATIVELT@month@ago@1","table":"","value":"sys_updated_onRELATIVEGT@year@ago@1"}]},{"id":"month_ago","label":"Past Month","order":3,"query":[{"display_value":"sys_updated_onRELATIVEGT@month@ago@1^sys_updated_onRELATIVELT@dayofweek@ago@7","table":"","value":"sys_updated_onRELATIVEGT@month@ago@1"}]},{"id":"week_ago","label":"Past Week","order":2,"query":[{"display_value":"sys_updated_onRELATIVEGT@dayofweek@ago@2^sys_updated_onRELATIVELT@dayofweek@ago@1","table":"","value":"sys_updated_onRELATIVEGT@dayofweek@ago@7"}]},{"id":"day_ago","label":"Past 24 Hours","order":1,"query":[{"display_value":"sys_updated_onRELATIVEGT@dayofweek@ago@1","table":"","value":"sys_updated_onRELATIVEGT@dayofweek@ago@1"}]}],"value":""},"resources":{"dynamic":true,"filters":"","value":"Knowledge"},"view_count":{"dynamic":false,"filters":[{"id":"more_than_500","label":"More Than 500","order":6,"query":[{"display_value":"sys_view_count>500","table":"kb_knowledge","value":"sys_view_count>500"}]},{"id":"more_than_200","label":"More Than 200","order":5,"query":[{"display_value":"sys_view_count>200^sys_view_count<500","table":"kb_knowledge","value":"sys_view_count>200"}]},{"id":"more_than_100","label":"More Than 100","order":4,"query":[{"display_value":"sys_view_count>100^sys_view_count<200","table":"kb_knowledge","value":"sys_view_count>100"}]},{"id":"more_than_50","label":"More Than 50","order":3,"query":[{"display_value":"sys_view_count>50^sys_view_count<100","table":"kb_knowledge","value":"sys_view_count>50"}]},{"id":"more_than_10","label":"More Than 10","order":2,"query":[{"display_value":"sys_view_count>10^sys_view_count<50","table":"kb_knowledge","value":"sys_view_count>10"}]},{"id":"less_than_10","label":"Less Than 10","order":1,"query":[{"display_value":"sys_view_count<11","table":"kb_knowledge","value":"sys_view_count<11"}]}],"value":""}}',
        searchOrderBy);

    var kbFacetObj = JSON.parse(kbFacets);

    if (taxonomyId) {
        createMultiChoiceFacetFromKB("UppercaseTopic", "topic", kbFacetObj.taxonomy_topic, 'order');
    } else {
        if (kbFacetObj.kb_knowledge_base && kbFacetObj.kb_knowledge_base.length > 1)
            createVariableFacetFromKB("Knowledge Base", "kb_knowledge_base", kbFacetObj.kb_knowledge_base, 'label');
        createMultiChoiceFacetFromKB("Category", "category", kbFacetObj.kb_category, 'order');
    }

    createVariableFacetFromKB("Author", "author", kbFacetObj.author, 'label');

    createVariableFacetFromKB("Last Modified", "updated", kbFacetObj.modified, 'order');
    createVariableFacetFromKB("View Count", "viewcount", kbFacetObj.view_count, 'order');

    function createVariableFacetFromKB(label, variable, values, orderBy) {
        if (!values || values.length == 0)
            return;

        var kbFacet = facetService.createFacet(label, variable);

        if (orderBy)
            values.sort(function(a, b) {
                if (a[orderBy] < b[orderBy])
                    return -1;
                if (a[orderBy] > b[orderBy])
                    return 1;
                return 0;
            });

        if (facets.author && variable == 'author')
            kbFacet.addFacetItem(getLabel(values, facets[variable]), facets[variable]);
        else if (facets.updated && variable == 'updated' && kbLabelMap[facets.updated])
            kbFacet.addFacetItem(kbLabelMap[facets.updated], facets.updated);
        else if (facets.viewcount && variable == 'viewcount' && kbLabelMap[facets.viewcount])
            kbFacet.addFacetItem(kbLabelMap[facets.viewcount], facets.viewcount);
        else if (facets.kb_knowledge_base && variable == 'kb_knowledge_base')
            kbFacet.addFacetItem(getLabel(values, facets[variable]), facets[variable]);
        else {
            for (var i in values)
                kbFacet.addFacetItem(values[i].label, values[i].id);
        }
    }

    function createMultiChoiceFacetFromKB(label, variable, values, orderBy) {
        if (!values || values.length == 0)
            return;

        var kbFacet = facetService.createMultiChoiceFacet(label, variable);
        var kbMap = {};
        for (var i in values) {
            var key = values[i].label;
            var value = values[i].id;
            var parent = new KBParentData().getParentCategory(value, key);
            key = parent.join(' > ');
            kbMap[key] = value;
        }

        var labels = Object.keys(kbMap).sort();
        for (i = 0; i < labels.length; i++) {
            var currentLabel = labels[i];
            kbFacet.addFacetItem(currentLabel, kbMap[currentLabel]);
        }
    }

    function getLabel(values, id) {
        for (var i in values) {
            if (values[i].id == id)
                return values[i].label;
        }
        return "";
    }
})(query, facetService, searchResults);
