function transform(input) {
    const startTime = new GlideDateTime().getNumericValue();

    // -------------------- Helper: Build Response --------------------
    function buildResponse(data = [], errorMessage = null) {
        const metadata = {
            groupBy: [{
                id: "error_category",
                label: "Error Category"
            }]
        };

        if (errorMessage)
            metadata.error = errorMessage;

        return [{
            data,
            metadata
        }];
    }

    try {
        // -------------------- Input Parameters --------------------
        const sourceApplicationId = input.source_application;
        const domainPath = input.sys_domain_path;
        const domainFilterOperator = input.domain_filter_operator || '=';
        let maxCategoriesToShow = parseInt(input.num_categories) || 10;
        const includeIgnored = input.include_ignored !== 'false';
        const includeOthers = input.include_others !== 'false';

        // -------------------- Validation --------------------
        if (!sourceApplicationId)
            return buildResponse([], "source_application parameter is required");

        // -------------------- Fetch Category Stats --------------------
        const categoryStats = [];
        const categoryRecord = new GlideRecord('sys_error_cat_stats');

        categoryRecord.addQuery(EFConstants.ERROR_CATEGORY_STATS_FIELDS.APPLICATION, sourceApplicationId);

        if (domainPath && domainPath !== 'all')
            categoryRecord.addQuery('sys_domain_path', domainFilterOperator, domainPath);
        
        categoryRecord.orderByDesc('error_count');
        categoryRecord.query();

        while (categoryRecord.next())
            categoryStats.push({
                id: categoryRecord.getUniqueValue(),
                name: categoryRecord.getDisplayValue('error_category') || 'Unknown',
                errorCount: parseInt(categoryRecord.getValue('error_count')) || 0,
                ignoredCount: parseInt(categoryRecord.getValue('error_ignored_count')) || 0
            });

        // -------------------- Split Top and Others --------------------
        const topCategories = categoryStats.slice(0, maxCategoriesToShow);
        const otherCategories = categoryStats.slice(maxCategoriesToShow);

        // -------------------- Calculate Totals --------------------
        let othersErrorCount = 0;
        let totalIgnored = 0;

        otherCategories.forEach(category => othersErrorCount += category.errorCount);
        categoryStats.forEach(category => totalIgnored += category.ignoredCount);

        // -------------------- Build Donut Chart Data --------------------
        const chartData = [];

        topCategories.forEach(category =>
            chartData.push({
                error_category: category.name,
                value: category.errorCount.toString()
            })
        );

        if (includeOthers && otherCategories.length > 0)
            chartData.push({
                error_category: `Other Categories (${otherCategories.length})`,
                value: othersErrorCount.toString()
            });

        if (includeIgnored && totalIgnored > 0)
            chartData.push({
                error_category: "Ignored Errors",
                value: totalIgnored.toString()
            });

        // -------------------- Return Final Result --------------------
        return buildResponse(chartData);

    } catch (error) {
        return buildResponse([], error.toString());
    }
}
