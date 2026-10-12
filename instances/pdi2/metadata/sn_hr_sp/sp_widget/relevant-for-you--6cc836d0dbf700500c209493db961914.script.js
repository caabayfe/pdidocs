(function() {
    if (input && input.widgetOptions)
        options = input.widgetOptions;
    data.load_config = options.load_config;
    data.asyncLoad = options.async_load || false;

    if (data.load_config === "async" && !input && !data.asyncLoad)
        return;

    var maxDisplayCount = 10;
    data.instanceId = $sp.getDisplayValue("sys_id");
    var stats = {};
    stats.callerId = data.instanceId;
    stats.textPrefix = 'Relevant for you';
    stats.startTime = new GlideDateTime();
    stats.shortDesc = 'Load Data';
    stats.guid = gs.generateGUID();

    data.title = gs.getMessage(options.title);
    data.userPredictionCount = options.user_prediction_count;
    data.cardType = (options.list_type === 'Card List') ? options.card_behaviour + '' : '';
    data.listType = (options.list_type === 'Card List') ? 'card-list' : 'simple-link';
    data.showEmptyState = options.show_empty_state;
    var knowledgeBases = String($sp.getKnowledgeBases());

    var displayCount = options.limit > maxDisplayCount ? maxDisplayCount : options.limit;
    data.viewType = (displayCount > 3) ? 'max-view' : 'min-view';
    var recentActivityCutoffInDays = gs.getProperty('recent.activity.cutoff.days') || options.recent_activity_cut_off_in_days;
    var recentActivityCutoffDate = new GlideDateTime();
    recentActivityCutoffDate.addDaysLocalTime(-recentActivityCutoffInDays);

    var relevantForYouWidgetSysId = '6cc836d0dbf700500c209493db961914';

    var RelevantForYouUtil = new sn_hr_sp.RelevantForYouUtil(data.instanceId, stats.guid);

    var taxonomyId = $sp.getTaxonomies();
    var catalogPayload = {
        users: null,
        catalogCount: displayCount,
        ignoredCatalogs: null,
        recentActivityCutoffDate: recentActivityCutoffDate,
        taxonomyId: taxonomyId
    };
    var articlesPayload = {
        users: null,
        knowledgeBases: knowledgeBases,
        kbRecords: $sp.getAllKBRecords(knowledgeBases),
        articleCount: displayCount,
        recentActivityCutoffDate: recentActivityCutoffDate,
        taxonomyId: taxonomyId
    };

    if (options.category === 'knowledge')
        data.dataItems = RelevantForYouUtil.getRelevantArticlesAndCatalogs(articlesPayload, null, displayCount, data.userPredictionCount, taxonomyId);
    else if (options.category === 'catalog')
        data.dataItems = RelevantForYouUtil.getRelevantArticlesAndCatalogs(null, catalogPayload, displayCount, data.userPredictionCount, taxonomyId);
    else
        data.dataItems = RelevantForYouUtil.getRelevantArticlesAndCatalogs(articlesPayload, catalogPayload, displayCount, data.userPredictionCount, taxonomyId);
    data.widgetsData = getWidgetsData(data.dataItems, data.listType);

    new sn_ex_sp.PerformanceIndicatorUtil().postInstanceHotspot(stats);

    function getWidgetsData(dataResults, listType) {
        listType = (listType === 'card-list') ? 'card' : 'simple_link';
        var dataPayload = [];
        dataResults.forEach(function(article) {
            var itemPayload = {};
            var widgetName = article.category == 'catalog' ? 'catalog-content' : 'kb-content';
            itemPayload.widgetTitle = options.title;
            itemPayload.content = article.sys_id;
            itemPayload.content_table = article.category == 'catalog' ? 'sc_cat_item' : 'kb_knowledge';
            itemPayload.listType = listType;
            itemPayload.widgetSysId = relevantForYouWidgetSysId;
            itemPayload.widgetData = $sp.getWidget(widgetName, itemPayload);
            dataPayload.push(itemPayload.widgetData);
        });
        return dataPayload;
    }
})();
