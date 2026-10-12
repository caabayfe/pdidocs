function include({
    imports
}) {class SowPerfHeaderUtilsSNC {
        /**
                Data frame returns data for breakdown and breakdown relation
                filter and get scores for logged in user
             */
        static getScoresForUser(rows, userId) {
            if (!rows || rows.length === 0)
                return;
            for (let i = 0; i < rows.length; i++) {
                const userBreakdown = Object.keys(rows[i].breakdowns).filter(b => b == userId);
                if (userBreakdown && userBreakdown.length == 1)
                    return rows[i].scores;
            }
        }
        
        static getPerfMetricsExceedingTarget(kpiDetails, scores) {
            if (!kpiDetails || !scores)
                return;
            let validPerfMetrics = {},
                score = '0';
            for (let i in scores) {
                if (kpiDetails[i] && !isNaN(scores[i].average) && scores[i].average != 0) {
                    if (kpiDetails[i].displayAggregate === 'average')
                        score = scores[i].formattedAverage;
                    if (kpiDetails[i].displayAggregate === 'sum')
                        score = scores[i].stats.formattedSumOfScores;
                    if (kpiDetails[i].target && kpiDetails[i].target.value)
                        if (parseFloat(score) > parseFloat(kpiDetails[i].target.value))
                            validPerfMetrics[kpiDetails[i].displayValue] = score;
                }
            }
            return validPerfMetrics;
        }
    }
    return SowPerfHeaderUtilsSNC;
}
