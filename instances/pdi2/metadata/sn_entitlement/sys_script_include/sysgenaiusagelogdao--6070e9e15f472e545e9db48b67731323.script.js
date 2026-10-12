var SysGenAiUsageLogDao = Class.create();
SysGenAiUsageLogDao.prototype = {
    initialize: function() {},

    getAllNowAssistInfoByGroup: function(endTime, lookbackDays, groupingColumn) {
        // If endTime is not provided, use current time
        if (!endTime) {
            endTime = new GlideDateTime();
        }

        // Calculate date {lookbackDays} prior to endTime
        const lookbackTime = new GlideDateTime(endTime);
        lookbackTime.addDaysLocalTime(-Number(lookbackDays));
        const lookbackTimeStr = lookbackTime.toString();

        const endTimeStr = endTime.toString();

        // Get the data for the specified date range
        const ga = new GlideAggregate('sys_gen_ai_usage_log');
        ga.addAggregate('SUM', 'assists');
        ga.groupBy(groupingColumn);
        ga.addQuery('sys_created_on', ">", lookbackTimeStr);
        ga.addQuery('sys_created_on', "<=", endTimeStr);
        ga.query();

        const computedData = [];

        while (ga.next()) {
            let groupId = ga.getValue(groupingColumn);
            let totalAssists = ga.getAggregate('SUM', 'assists');
            let displayValue = ga.getDisplayValue(groupingColumn);

            computedData.push({
                group: groupId || '',
                totalAssists: totalAssists || '',
                name: displayValue
            });
        }

        return computedData;
    },

    getAllNowAssistInfoByGroupWithStartDate: function(endTime, lookbackStart, groupingColumn) {
        // If endTime is not provided, use current time
        if (!endTime) {
            endTime = new GlideDateTime();
        }

        const lookbackTimeStr = lookbackStart.toString();
        const endTimeStr = endTime.toString();

        // Get the data for the specified date range
        const ga = new GlideAggregate('sys_gen_ai_usage_log');
        ga.addAggregate('SUM', 'assists');
        ga.groupBy(groupingColumn);
        ga.addQuery('sys_created_on', ">", lookbackTimeStr);
        ga.addQuery('sys_created_on', "<=", endTimeStr);
        ga.query();

        const computedData = [];

        while (ga.next()) {
            let groupId = ga.getValue(groupingColumn);
            let totalAssists = ga.getAggregate('SUM', 'assists');
            let displayValue = ga.getDisplayValue(groupingColumn);

            computedData.push({
                group: groupId || '',
                totalAssists: totalAssists || '',
                name: displayValue
            });
        }

        return computedData;
    },

    type: 'SysGenAiUsageLogDao'
};
