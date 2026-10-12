function transform(input) {
    const startTime = new GlideDateTime().getNumericValue();

    // -------------------- Helper to standardize all responses --------------------
    function buildResponse(success, data, errorMsg, config, stats) {
        const endTime = new GlideDateTime().getNumericValue();
        return {
            success: success,
            error: errorMsg || null,
            data: data || [],
            config: config || {},
            stats: stats || {},
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: endTime - startTime
        };
    }

    try {
        // -------------------- Input Parameters --------------------
        const sourceApplicationId = input.source_application;
        const domainPath = input.sys_domain_path;
        const domainFilterOperator = input.domain_filter_operator || '=';
        const numCategories = parseInt(input.num_categories) || 10;
        const includeIgnored = input.include_ignored !== 'false';
        const includeOthers = input.include_others !== 'false';
        const daysBack = parseInt(input.days_back) || 7;

        if (!sourceApplicationId)
            return buildResponse(false, [], 'source_application parameter is required');

        // -------------------- Step 1: Get Oldest Available Date --------------------
        const categoryTimeseriesGR = new GlideRecord('sys_error_cat_timeseries_stats');
        categoryTimeseriesGR.addQuery(EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION, sourceApplicationId);

        if (domainPath && domainPath !== 'all')
            categoryTimeseriesGR.addQuery('sys_domain_path', domainFilterOperator, domainPath);
        
        categoryTimeseriesGR.orderBy('occurred_on');
        categoryTimeseriesGR.setLimit(1);
        categoryTimeseriesGR.query();

        const requestedStartDate = new GlideDate();
        requestedStartDate.addDaysUTC(-daysBack);
        const endDate = new GlideDate();
        endDate.addDaysUTC(1);
        let oldestAvailableDate;

        if (categoryTimeseriesGR.hasNext()) {
            categoryTimeseriesGR.next();
            oldestAvailableDate = new GlideDate();
            oldestAvailableDate.setValue(categoryTimeseriesGR.getValue('occurred_on'));
        } else {
            return buildResponse(true, [], null, {
                source_application: sourceApplicationId,
                domain_path: domainPath,
                domain_filter_operator: domainFilterOperator,
                num_categories: numCategories,
                include_ignored: includeIgnored,
                include_others: includeOthers,
                days_back_requested: daysBack,
                actual_days_returned: 0
            }, {
                total_categories_found: 0,
                top_categories: [],
                others_category_count: 0,
                continuous_timeline: {
                    start_date: null,
                    end_date: null,
                    total_days: 0
                }
            });
        }

        // -------------------- Step 2: Determine Actual Start Date --------------------
        const actualStartDate = requestedStartDate.getValue() < oldestAvailableDate.getValue() ?
            oldestAvailableDate : requestedStartDate;

        // -------------------- Step 3: Get Top Categories --------------------
        const categoryAggregate = new GlideAggregate('sys_error_cat_timeseries_stats');
        categoryAggregate.addQuery(EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION, sourceApplicationId);

        if (domainPath && domainPath !== 'all')
            categoryAggregate.addQuery('sys_domain_path', domainFilterOperator, domainPath);
        
        categoryAggregate.addQuery('occurred_on', '>=', actualStartDate);
        categoryAggregate.addQuery('occurred_on', '<', endDate);
        categoryAggregate.groupBy('error_category');
        categoryAggregate.addAggregate('SUM', 'error_count');
        categoryAggregate.orderByAggregate('SUM', 'error_count');
        categoryAggregate.query();

        const topCategories = [];
        const topCategoryMap = {};
        let othersCount = 0,
            categoryCount = 0;

        while (categoryAggregate.next()) {
            const categoryName = categoryAggregate.getDisplayValue('error_category') || 'Unknown';
            const totalErrorCount = parseInt(categoryAggregate.getAggregate('SUM', 'error_count')) || 0;

            if (categoryCount < numCategories) {
                topCategories.push({
                    name: categoryName,
                    total: totalErrorCount
                });
                topCategoryMap[categoryName] = true;
            } else othersCount += totalErrorCount;
            categoryCount++;
        }

        // -------------------- Step 4: Create Continuous Timeline --------------------
        const continuousData = {},
            dateRange = [];
        const currentDate = new GlideDate();
        currentDate.setValue(actualStartDate.getValue());
        const today = new GlideDate();

        // Safety limit to prevent infinite loops (max 365 days)
        const maxIterations = 365;
        let iterations = 0;

        while (currentDate.getValue() <= today.getValue() && iterations < maxIterations) {
            const dateKey = currentDate.getValue();
            dateRange.push(dateKey);
            const timestamp = new GlideDateTime();
            timestamp.setDisplayValue(dateKey);
            continuousData[dateKey] = {
                timestamp: timestamp.getNumericValue().toString(),
                categories: {},
                totalIgnored: 0,
                othersTotal: 0
            };
            topCategories.forEach(c => continuousData[dateKey].categories[c.name] = 0);
            currentDate.addDaysUTC(1);
            iterations++;
        }

        // -------------------- Step 5: Fetch and Process Time-Series Data --------------------
        let processedRecords = 0;

        const timeseriesGR = new GlideRecord('sys_error_cat_timeseries_stats');
        timeseriesGR.addQuery(EFConstants.ERROR_CATEGORY_TIMESERIES_STATS_FIELDS.APPLICATION, sourceApplicationId);

        if (domainPath && domainPath !== 'all')
            timeseriesGR.addQuery('sys_domain_path', domainFilterOperator, domainPath);
        
        timeseriesGR.addQuery('occurred_on', '>=', actualStartDate);
        timeseriesGR.addQuery('occurred_on', '<', endDate);
        timeseriesGR.query();

        while (timeseriesGR.next()) {
            const occurredDate = timeseriesGR.getValue('occurred_on');
            const categoryName = timeseriesGR.getDisplayValue('error_category') || 'Unknown';
            const errorCount = parseInt(timeseriesGR.getValue('error_count')) || 0;
            const ignoredCount = parseInt(timeseriesGR.getValue('error_ignored_count')) || 0;

            if (continuousData[occurredDate]) {
                if (topCategoryMap[categoryName]) continuousData[occurredDate].categories[categoryName] += errorCount;
                else if (includeOthers) continuousData[occurredDate].othersTotal += errorCount;
                if (includeIgnored) continuousData[occurredDate].totalIgnored += ignoredCount;
                processedRecords++;
            }
        }

        // -------------------- Step 6: Build Time-Series Data --------------------
        const timeSeriesData = [],
            seriesConfig = [];

        dateRange.forEach((dateKey, index) => {
            const dayData = continuousData[dateKey];
            const dataPoint = {
                timestamp: dayData.timestamp
            };

            topCategories.forEach((cat, i) => {
                const fieldId = 'cat' + (i + 1);
                dataPoint[fieldId] = dayData.categories[cat.name].toString();
                if (index === 0) seriesConfig.push({
                    label: cat.name,
                    id: fieldId,
                    type: 'value'
                });
            });

            if (includeIgnored) {
                dataPoint.ignored = dayData.totalIgnored.toString();
                if (index === 0) seriesConfig.push({
                    label: 'Ignored Errors',
                    id: 'ignored',
                    type: 'value'
                });
            }

            if (includeOthers && othersCount > 0) {
                dataPoint.others = dayData.othersTotal.toString();
                if (index === 0) seriesConfig.push({
                    label: 'Other Categories (' + (categoryCount - numCategories) + ')',
                    id: 'others',
                    type: 'value'
                });
            }

            timeSeriesData.push(dataPoint);
        });

        // -------------------- Return Final Response --------------------
        return buildResponse(true, [{
            data: timeSeriesData,
            metadata: {
                dataSourceLabel: 'Error Trends by Category - ' + topCategories.length + ' Categories',
                series: seriesConfig,
                aggregate: {
                    fieldType: 'integer'
                },
                format: {
                    unitFormat: '{0}',
                    frequency: 'daily',
                    precision: 0
                }
            }
        }], null, {
            source_application: sourceApplicationId,
            domain_path: domainPath,
            domain_filter_operator: domainFilterOperator,
            num_categories: numCategories,
            include_ignored: includeIgnored,
            include_others: includeOthers,
            days_back_requested: daysBack,
            actual_days_returned: dateRange.length
        }, {
            total_categories_found: categoryCount,
            top_categories: topCategories.map(c => c.name),
            others_category_count: Math.max(0, categoryCount - numCategories),
            continuous_timeline: {
                start_date: actualStartDate.getValue(),
                end_date: today.getValue(),
                total_days: dateRange.length
            },
            total_records_processed: processedRecords
        });


    } catch (error) {
        return buildResponse(false, [], error.toString());
    }
}
