var QueryGenIndicatorGlobalAccessUtil = {
    /**
     * Gets aggregates available for the given indicator.
     * Returns an encoded-query fragment suitable for GlideRecord.addEncodedQuery(...)
     * on pa_aggregate. Results are backed by PA_AGGREGATES_CACHE and apply
     * pa_indicator_aggregate_excl exclusions and frequency/unit compatibility.
     *
     * @param {String} indicatorSysId - Indicator sys_id
     * @returns {String} encoded-query fragment, e.g. "sys_idINabc,def,..."
     *                   or '' if indicatorSysId is nil
     */
    getAvailableAggregates: function(indicatorSysId) {
        if (gs.nil(indicatorSysId)) {
            return '';
        }
        var result = PAIndicator.getAvailableAggregates(indicatorSysId);
        return result.replace('sys_idIN', '');
    }
};
