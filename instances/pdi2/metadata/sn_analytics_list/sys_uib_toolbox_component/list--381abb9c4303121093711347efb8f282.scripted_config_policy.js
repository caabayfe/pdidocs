function policy(args) {
    var api = args.api;
    var properties = args.properties;
    var trigger = args.trigger;

    if (!properties.componentId) {
        api.updateValue('componentId', Math.floor(Math.random() * Date.now()).toString(36));
    }

    const providerId = properties.componentId;

    const HEADER_DEFAULT_COLOR = {
        value: '#FFFFFF',
        themeVariable: '--now-color_background--primary',
    };

    const DEFAULT_TEXT_COLOR = {
        value: '#4F5C62',
        themeVariable: '--now-color_text--tertiary',
    };

    const handleHeaderColorSelector = ({
        api,
        properties
    }) => {
        api.updateInterfaceMetadata(
            'par-header-color-selector',
            'propId',
            'headerColor'
        );

        api.updateInterfaceMetadata(
            'par-header-color-selector',
            'displayColor',
            properties.headerColor
        );

        api.updateInterfaceMetadata(
            'par-header-color-selector',
            'defaultColor',
            HEADER_DEFAULT_COLOR
        );

        api.updateInterfaceMetadata('par-header-color-selector', 'colorCategories', [
            'defaultBackgroundColor',
            'backgroundColors',
        ]);

        api.updateInterfaceMetadata(
            'par-header-color-selector',
            'label',
            'Header background color'
        );

        api.updateInterfaceMetadata(
            'par-header-color-selector',
            'tooltipContent',
            'Choose a header background color to align with your theme, branding, or design preferences. The selected color applies only to the header of this visualization. For better accessibility, ensure sufficient contrast between the header background and title text. Use the contrast ratio checker within the color picker to verify. Note that theming is not supported when selecting a custom color.'
        );

        api.updateVisibility('par-header-color-selector', properties.showHeader);
    };

    const handleTitleColorSelector = ({
        api,
        properties
    }) => {
        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'propId',
            'titleColor'
        );

        api.updateInterfaceMetadata('par-title-color-selector', 'colorCategories', [
            'defaultTextColor',
            'textColors',
        ]);

        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'label',
            'Title color'
        );

        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'comparisonColor',
            properties.headerColor && Object.keys(properties.headerColor).length > 0 ?
            properties.headerColor :
            HEADER_DEFAULT_COLOR
        );

        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'displayColor',
            properties.titleColor
        );

        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'defaultColor',
            DEFAULT_TEXT_COLOR
        );


        api.updateInterfaceMetadata(
            'par-title-color-selector',
            'tooltipContent',
            'Select a color for the chart title to align it with your dashboard theme, branding, or design preferences. The chosen color will apply only to the title of the visualization. For better accessibility, ensure sufficient contrast between the header background and title text. You can verify this by checking the contrast ratio within the color picker. Note that theming is not supported when selecting a custom color.'
        );

        api.updateVisibility(
            'par-title-color-selector',
            !!(properties.showHeader && (properties.title || properties.headerTitle))
        );
    };

    api.updateInterfaceMetadata(
        'par-data-sources',
        'dataSourceProviderId',
        providerId
    );
    api.updateInterfaceMetadata(
        'par-metrics',
        'dataSourceProviderId',
        providerId
    );
    api.updateInterfaceMetadata(
        'par-group-by',
        'dataSourceProviderId',
        providerId
    );
    api.updateInterfaceMetadata(
        'par-additional-group-by',
        'dataSourceProviderId',
        providerId
    );

    // Header
    api.updateVisibility('showHeaderSeparator', properties.showHeader);
    api.updateVisibility('wrapTitle', properties.showHeader);
    api.updateVisibility('lineClamp', properties.showHeader && !properties.wrapTitle);
    api.updateVisibility('headerTitle', properties.showHeader);
    api.updateVisibility('headerTitleAlignment', properties.showHeader);
    api.updateVisibility('headingLevel', properties.showHeader);
    api.updateVisibility('description', properties.showHeader);
    api.updateVisibility('contextMenuActions', properties.showHeader);
    api.updateVisibility('showExportOption',properties.showHeader);
    api.updateVisibility('title', false);

    handleHeaderColorSelector({
        api,
        properties
    });
    handleTitleColorSelector({
        api,
        properties
    });

    if (trigger == 'showHeader' && !properties.showHeader) {
        api.updateValue('headerColor', null);
        api.updateValue('titleColor', null);
    }

    if (trigger == 'headerTitle' && !properties.headerTitle) {
        api.updateValue('titleColor', null);
    }

    if (properties.title && !properties.headerTitle) {
        api.updateValue('title', undefined);

        api.updateValue(
            'headerTitle',
            typeof properties.title === 'object' ?
            properties.title.message :
            properties.title
        );
    }

    // Handle filter icon
    if (trigger === 'followFilters') {
        api.updateValue('showFilterIcon', properties.followFilters);
    }

    api.updateVisibility('showFilterIcon', followFilters);

    // Handle Border
    api.updateVisibility('bareBorder', !properties.showBorder);
    if (properties.showBorder) {
        api.updateValue('bareBorder', false);
    }

    const dataSourcesDynamic = api.isDynamic('dataSources');
    api.updateInterfaceMetadata('par-metrics', 'isDynamic', dataSourcesDynamic);
    api.updateInterfaceMetadata('par-group-by', 'isDynamic', dataSourcesDynamic);

    // Datasources
    api.updateVisibility('par-data-sources', true);
    api.updateInterfaceMetadata('par-data-sources', 'vizType', "group");
    api.updateInterfaceMetadata('par-data-sources', 'maximum', 1);
    api.updateVisibility('table', false);
    api.updateInterfaceMetadata('par-data-sources', 'showConditionBuilderSortBy', true);

    // Only table data source is applicable for analytics list
    api.updateInterfaceMetadata(
        'par-data-sources',
        'chartFeatureConfig', '{"dataCategory":"group","groupBy":{"enabled":true,"min":0,"max":1,"supportedFieldTypes":["numeric"]}}'
    );

    // Metrics
    api.updateSectionVisibility('metricSection', false);
    api.updateInterfaceMetadata('par-metrics', 'enableMultipleMetrics', false);
    api.updateInterfaceMetadata('par-metrics', 'maximum', 1);
    api.updateInterfaceMetadata('par-metrics', 'minimum', 1);

    // GroupBy
    api.updateSectionVisibility('groupBySection', true);
    api.updateVisibility('par-group-by', true);
    api.updateInterfaceMetadata('par-group-by', 'minimum', 0);
    api.updateInterfaceMetadata('par-group-by', 'maximum', 1);
    api.updateInterfaceMetadata('par-group-by', 'showMaxNumberOfGroups', false);
    api.updateInterfaceMetadata('par-group-by', 'showOthersToggle', false);
    api.updateVisibility('par-additional-group-by', true);

    if (!trigger || trigger === 'dataSources') {
        api.updateInterfaceMetadata(
            'par-metrics',
            'dataSources',
            properties.dataSources
        );
        api.updateInterfaceMetadata(
            'par-group-by',
            'dataSources',
            properties.dataSources
        );
        api.updateInterfaceMetadata(
            'par-additional-group-by',
            'dataSources',
            properties.dataSources
        );
        const metrics = [{
            ...properties.metrics[0],
            dataSource: properties.dataSources[0].id
        }];

        api.updateInterfaceMetadata('par-group-by', 'metrics', metrics);
        api.updateInterfaceMetadata(
            'par-additional-group-by',
            'metrics',
            metrics
        );
        api.updateInterfaceMetadata(
            'par-data-sources',
            'metrics',
            metrics
        );
        api.updateValue('table', properties.dataSources ? properties.dataSources[0].tableOrViewName : null);
    }

    if (trigger === 'groupBy' || !trigger) {
        var groupBy = properties?.groupBy || [];
        api.updateInterfaceMetadata(
            'par-data-sources',
            'groupBy',
            groupBy
        );

        api.updateInterfaceMetadata(
            'par-additional-group-by',
            'groupBy',
            groupBy
        );

        const mainGroupBy = ((properties?.groupBy || [])[0]) || {};
        const groupByField = ((mainGroupBy?.groupBy || [])[0] || {})?.groupByField || "";
        api.updateValue('groupByField', groupByField);
    }

    if (trigger === 'additionalGroupByConfig' || !trigger) {
        api.updateInterfaceMetadata(
            'par-data-sources',
            'additionalGroupByConfig',
            properties.additionalGroupByConfig
        );
    }

    api.updateVisibility('emptyStateIllustration', properties.enableCustomEmptyState);
    api.updateVisibility('emptyStateHeading', properties.enableCustomEmptyState);
    api.updateVisibility('emptyStateHeadingLevel', properties.enableCustomEmptyState);
    api.updateVisibility('emptyStateContent', properties.enableCustomEmptyState);
    api.updateVisibility('emptyStateAlignment', properties.enableCustomEmptyState);
}
