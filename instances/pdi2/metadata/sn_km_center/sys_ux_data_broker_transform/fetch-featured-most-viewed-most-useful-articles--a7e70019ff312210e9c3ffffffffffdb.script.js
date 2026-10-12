function transform() {
    // map the secondary_fields array into an object where each field (number, views, rating) is a field
    // so that it's easier to use the object's values in UIB
    function createFieldsObject(articles) {
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            var fieldsObject = {};
            for (var j = 0; j < article['secondary_fields'].length; j++) {
                var field = article['secondary_fields'][j];
                fieldsObject[field['name']] = field['display_value'];
            }
            article['fields'] = fieldsObject;
        }
    }

    function formatFeaturedArticlesData(articles, fields) {
        var results = articles['results'];
        for (var i = 0; i < results.length; i++) {
            var article = results[i];
            var fieldsObject = {};
            for (var j = 0; j < fields.length; j++) {
                var currentField = fields[j];
                var articleCurrentField = article['meta'][currentField];
                fieldsObject[currentField] = articleCurrentField['display_value'];
            }
            article['fields'] = fieldsObject;
            article['sys_id'] = article['id'].split(':')[1];
        }
        orderItems(results, false);
    }

    // the portal widget controller re-orders the articles by their 'count' field
    // we do the same here for parity 
    function orderItems(items, reverse) {
        const cmp = (a, b) => {
            return a.count - b.count;
        };
        return reverse ? items.sort(cmp).reverse() : items.sort(cmp);
    }

    var kbPortal = new global.KBPortalServiceImpl();
    var displayField = 'short_description';
    var limit = '4';

    var fields = [];
    var showAuthor = gs.getProperty('glide.knowman.search.show_author', 'false');
    var showArticle = gs.getProperty('glide.knowman.search.show_article_number', 'false');
    var showViewCount = gs.getProperty('glide.knowman.search.show_view_count', 'false');
    var showRating = gs.getProperty('glide.knowman.search.show_rating', 'false');
    if (showAuthor == 'true') {
        fields.push('author');
    }
    if (showArticle == 'true') {
        var kbMod = new global.KBViewModel();
        if (kbMod.isVersioningEnabled()) {
            fields.push('display_number');
        } else {
            fields.push('number');
        }
    }
    if (showViewCount == 'true') {
        fields.push('sys_view_count');
    }
    if (showRating == 'true') {
        fields.push('rating');
    }

    var featured = kbPortal.getFeaturedArticles(limit, displayField, fields, '');
    formatFeaturedArticlesData(featured, fields);

    var mostViewed = kbPortal.getMostViewedArticles(limit, displayField, fields, '');
    orderItems(mostViewed, true);
    createFieldsObject(mostViewed);

    var mostUseful = kbPortal.getMostUsefulArticles(limit, displayField, fields, '');
    orderItems(mostUseful, true);
    createFieldsObject(mostUseful);
    return {
        articles: {
            featured,
            mostViewed,
            mostUseful
        },
        props: {
            showAuthor,
            showArticle,
            showViewCount,
            showRating
        }
    };
}
