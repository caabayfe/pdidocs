function transform(input) {
    var data = {};
    var indicators = [];
    var categories = [];
    var bu = new sn_benchmarks.BenchmarkScoreUtil();

    function isOptIn() {
        return bu.getOptIn();
    }

    function getCategories(category) {
        data.categories = bu.getOrderedCategoryByRoles();
        if (category)
            return [category];
        return data.categories;
    }

    function getBreakdown(breakdown) {
        if (breakdown == 'all')
            return '';
        return breakdown ? breakdown : '';
    }

    function getIndicators(indicator, category) {
        if (indicator)
            return [indicator];
        return bu.getActiveGlobalIndicatorsByCategory(category);
    }

    /* If not opted; don't query scores */
    if (!isOptIn())
        return {
            'optedIn': false
        };

    data['optedIn'] = true;

    categories = getCategories(input.category);

    data.breakdowns = bu.getBreakdowns();
    data.activeIndustry = bu.getActiveIndustry();

    var category = input.category ? input.category : Object.keys(categories)[0];
    var breakdownValue = getBreakdown(input.value);

    var scoreData = {};
    indicators = getIndicators(input.iid, category);
    if (input.iid) {
        scoreData = bu.getScoreForTrend(input.iid, breakdownValue);
    } else {
        scoreData = bu.getScoreByIndicators(indicators, breakdownValue);
    }
    data.currentMonth = scoreData.currentMonth;
    data.groups = scoreData.groups;
    data.indicators = scoreData.indicators;
    data.i18n = {};
    data.i18n.kpiDisplay = {
        hours: gs.getMessage('{0} hours'),
        days_hours: gs.getMessage('{0}d {1}h'),
        days: gs.getMessage('{0} days')
    };
    data.i18n.recoText = gs.getMessage("Recommendation '{0}' is implemented on {1}");
    data.i18n.alertMsg = gs.getMessage('No breakdown score exist for {0} in {1}');
    data.i18n.noRankText = gs.getMessage('(Percentile rank is not available for this KPI)');
    data.i18n.noPAScoreText = gs.getMessage('(Data unavailable in Performance Analytics scorecard)');
    data.i18n.alertSimilarCompany = gs.getMessage('Showing Benchmark score according to your industry and user size bucket.');
    data.i18n.chart = {
        ourTrendNoPA: gs.getMessage('{0}: Your Instance, {1} (Data unavailable in Performance Analytics scorecard), Percentile rank, {2}'),
        ourTrend: gs.getMessage('{0}: Your Instance, {1}, Percentile rank, {2}'),
        miniTrend: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, {2}'),
        miniTrendIncreased: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, Increased by {2}%'),
        miniTrendDecreased: gs.getMessage('{0}: Your Instance, {1}, Monthly Change, Decreased by {2}%'),
        theirTrend: gs.getMessage('{0}: {1}, {2}')
    };
    data.i18n.viewToggles = {
        cardView: {
            selected: gs.getMessage('Card view, selected'),
            unselected: gs.getMessage('Card view')
        },
        listView: {
            selected: gs.getMessage('List view, selected'),
            unselected: gs.getMessage('List view')
        }
    };
    data.i18n.score = {
        better: gs.getMessage('Better than Benchmark'),
        worse: gs.getMessage('Worse than Benchmark')
    };
    var config = bu.getClientConfig();
    data.sizeBucket = "";
    var size_bucket_gr = new GlideRecord('sn_bm_common_size_bucket');
    if (size_bucket_gr.get(config.sn_bm_common_size_bucket))
        data.sizeBucket = size_bucket_gr.getDisplayValue('name');
    var client_region_gr = new GlideRecord('sn_bm_client_region');
    data.region = "";
    if (client_region_gr.get(config.sn_bm_client_region))
        data.region = client_region_gr.getDisplayValue('name');
    return data;
}
