var indexGroup = (typeof indexGroup !== "undefined") ? indexGroup : "portal_index_group";
var queryLocation = queryLocation || 0;
var count = count || 30;
var facets = facets || {};
(function(query, queryLocation, count, facets, indexGroup) {

    return doContextualSearch(query, count, facets, queryLocation);

    function doContextualSearch(query, count, facets, queryLocation) {
        var results = [];
        var taxonomyId = $sp.getTaxonomies();
        var displayAttachments = gs.getProperty('glide.knowman.search.attachment', 'LINK_SNIPPET');
        var kbArray = [];
        var variables = {
            author: [facets.author]
        };
        if (!taxonomyId) {
            if (facets.kb_knowledge_base)
                kbArray.push(facets.kb_knowledge_base);
            else {
                var kbs = $sp.getKnowledgeBases();
                if (!gs.nil(kbs))
                    kbArray = kbs.split(',');
            }
            variables.kb_knowledge_base = kbArray;
            variables.kb_category = facets.category;
        } else {
            variables.taxonomy_topic = facets.topic;
        }

        // Set up request
        var request = {
            keyword: query,
            language: "",
            variables: variables,
            resource: 'Knowledge',
            context: gs.getProperty('glide.knowman.sp.search_context', 'Knowledge Search'),
            kb_query: getFacetQuery(facets, taxonomyId),
            social_query: "",
            order: "relevancy,true",
            start: queryLocation,
            end: count,
            attachment: displayAttachments != "NO_ATTACHMENT",
            knowledge_fields: [
                "number",
                "sys_id",
                "published"
            ],
            index_group: indexGroup
        };

        if (JSUtil.notNil(data.limit) && !isNaN(data.limit))
            request.end = data.limit + queryLocation;

        // execute search return result
        var response = new KBPortalServiceImpl().getResultData(request);

        // Send results back ro UI
        var kbCount = 0;
        for (var i = 0; i < response.results.length; i++) {
            result = response.results[i];
            var article = {};
            article.sys_id = result.meta.sys_id.display_value;
            article.number = result.meta.number.display_value;
            article.short_description = result.title;
            article.published = result.meta.published.display_value;
            article.publishedUTC = result.meta.published.value;
            article.type = "kb";
            article.text = result.snippet || "";
            article.text = $sp.stripHTML(article.text) + "";
            article.text = article.text.substring(0, 200);
            article.score = result.meta.score;
            article.label = article.short_description;
            article.primary = article.short_description;
            article.query_location = queryLocation + kbCount;
            article.table = "kb_knowledge"; // populate the table name for analytics
            article.link = result.link;
            article.attachments = result.meta.attachments || [];
            for (var list = 0; list < article.attachments.length; list++) {
                 if (article.attachments[list].terms)
            		article.attachments[list].terms = $sp.stripHTML(article.attachments[list].terms);
            }
            results.push(article);

            kbCount++;
        }

        if (!data.includeFacets)
            $sp.logSearch('kb_knowledge', query, kbCount, data.searchType, data.portal, data.page);

        if (results.length == 0)
            return results;

        if (results.length < count) {
            var lastResult = results.pop();
            lastResult.isLastResult = true;
            results.push(lastResult);
        }
        return results;
    }

    // Build the kb_query based on facets
    function getFacetQuery(facets, taxonomyId) {
        var kbFacetMap = {
            // updated
            "more_ago": "^sys_updated_onRELATIVEGT@year@ago@2",
            "year_ago": "^sys_updated_onRELATIVEGT@year@ago@1",
            "month_ago": "^sys_updated_onRELATIVEGT@month@ago@1",
            "week_ago": "^sys_updated_onRELATIVEGT@dayofweek@ago@7",
            "day_ago": "^sys_updated_onRELATIVEGT@dayofweek@ago@1",

            // viewcount
            "more_than_500": "^sys_view_count>500",
            "more_than_200": "^sys_view_count>200",
            "more_than_100": "^sys_view_count>100",
            "more_than_50": "^sys_view_count>50",
            "more_than_10": "^sys_view_count>10",
            "less_than_10": "^sys_view_count<10"
        };

        // Fill in facet info into kbQuery
        var kbQuery = "";
        //If portal is assosiated to taxonomy then add topic and taxonomy Filter 
        if (taxonomyId)
            kbQuery = "taxonomy_topic.active=true^taxonomy_topic.taxonomyIN" + taxonomyId;
        if (facets.updated)
            kbQuery += kbFacetMap[facets.updated];
        if (facets.viewcount)
            kbQuery += kbFacetMap[facets.viewcount];

        // return built up query, stripping away leading ^
        return (kbQuery.startsWith("^")) ? kbQuery.substring(1) : kbQuery;
    }
})(query, queryLocation, count, facets, indexGroup);
