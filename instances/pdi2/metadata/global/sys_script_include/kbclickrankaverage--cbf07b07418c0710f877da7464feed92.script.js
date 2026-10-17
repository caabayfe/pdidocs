var KBClickRankAverage = Class.create();
KBClickRankAverage.prototype = {
    initialize: function() {
    },

	/**
     * Returns the average of the highest click rank from ts_query_kb
     * for records created in the last 30 days where top_click_rank is not empty.
     *
     * @return {Number} average top_click_rank value, or 0 if no data
     */
    getAvg: function() {
        var agg = new GlideAggregate('ts_query_kb');
        agg.addEncodedQuery('top_click_rankISNOTEMPTY^sys_created_on>=javascript:gs.beginningOfLast30Days()');
        agg.addAggregate('AVG', 'top_click_rank');
        agg.setGroup(false);
        agg.query();
        var avg = 0;
        if (agg.next()) {
            if (!gs.nil(agg.getAggregate('AVG', 'top_click_rank')))
                avg = agg.getAggregate('AVG', 'top_click_rank');
        }
        return avg;
    },

    type: 'KBClickRankAverage'
};
