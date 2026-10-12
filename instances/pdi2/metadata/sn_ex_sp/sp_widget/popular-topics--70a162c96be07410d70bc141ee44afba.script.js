(function() {
    if (options.widget_behavior_during_high_load === 'lite_view' && new sn_ex_emp_fd.PortalPerformanceUtil().getNodeStatus()) {
        data.isNodeUnderHeavyLoad = true;
        data.isLoading = false;
        var title = [options.widget_title];
        data.widgetTitle = gs.getMessage(title);
        return;
    }
    data.load_config = options.load_config;
    data.asyncLoad = options.async_load || false;
    data.options = options;
    populateOptions(data);
    if (data.load_config === "async" && !input && !data.asyncLoad)
        return;
    var limit = options.topic_limit;
    var taxonomy = $sp.getTaxonomies();
    data.instanceId = $sp.getDisplayValue("sys_id");
    if (!taxonomy || taxonomy.length === 0) {
        return;
    }

    var stats = {};
    stats.callerId = data.instanceId;
    stats.textPrefix = 'Popular topics';
    stats.startTime = new GlideDateTime();
    stats.shortDesc = 'Load Data';
    stats.guid = gs.generateGUID();

    var session = gs.getSession();
    var popularTopicsDataKey = 'sn_ex_sp_popular_topics_data' + taxonomy + session.getLanguage() + gs.getUserID();
    var popularTopicsData = JSON.parse(session.getClientData(popularTopicsDataKey));
    if (popularTopicsData === null || popularTopicsData.length != limit) {
        data.popularTopics = new PopularTopicsUtil().getPopularTopics(taxonomy, limit, false, data.instanceId, stats.guid);
        session.putClientData(popularTopicsDataKey, JSON.stringify(data.popularTopics));
    } else {
        data.popularTopics = popularTopicsData;
    }
    addFavoriteWidget(data.popularTopics);

    new sn_ex_sp.PerformanceIndicatorUtil().postInstanceHotspot(stats);
})();

function addFavoriteWidget(popularTopics) {
    popularTopics.map(function(a) {
        a.favoriteWidget = $sp.getWidget('ec_favorite', {
            'table': 'topic',
            'sys_id': a.topicId,
            'common_page': true
        });
    });
}
/**
 * Read and initialize the options
 * @param {object} data - Data object
 *
 */
function populateOptions(data) {
    var CONST = {
        'HEX': 'hexcode',
        'NORMAL': 'normal',
        'SMALL': 'small',
        'TRUE': 'true',
        'FALSE': 'false',
        'DEFAULT_COLOR': '#FFFFFF',
        'DEFAULT_BORDER_OPTION': 'border-tertiary',
        'REGEX': /^#([0-9A-F]{3}){1,2}$/i
    };
    var option = data.options;
    data.isNormal = (option.display_size.toLowerCase() === CONST.NORMAL);
    data.isSmall = (option.display_size.toLowerCase() === CONST.SMALL);
    data.borderColor = option.border_color.toLowerCase();
    data.icon = option.icon.toLowerCase() === CONST.TRUE;
    data.isHex = (data.borderColor === CONST.HEX);
    data.hexcode = option.hexcode;
    var title = [option.widget_title];
    data.widgetTitle = gs.getMessage(title);

    if (data.isHex) {
        if (!CONST.REGEX.test(option.hexcode)) {
            data.borderColor = CONST.DEFAULT_BORDER_OPTION;
            data.isHex = false;
        }
    }
}
