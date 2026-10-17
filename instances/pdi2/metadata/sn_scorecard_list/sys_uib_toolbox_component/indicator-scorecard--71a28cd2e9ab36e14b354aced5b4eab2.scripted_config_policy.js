function policy(args) {
	var trigger = args.trigger;
	var api = args.api;
	var properties = args.properties;
	var sourceType = parseInt(properties.sourceType);
	var scorecardType = properties.scorecardType;

	const HEADER_DEFAULT_COLOR = {
		value: '#FFFFFF',
		themeVariable: '--now-color_background--primary',
	};

	const DEFAULT_TEXT_COLOR = {
		value: '#4F5C62',
		themeVariable: '--now-color_text--tertiary',
	};

	const handleHeaderColorSelector = ({ api, properties }) => {
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

	const handleTitleColorSelector = ({ api, properties }) => {
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
			properties.headerColor && Object.keys(properties.headerColor).length > 0
				? properties.headerColor
				: HEADER_DEFAULT_COLOR
		);

		api.updateInterfaceMetadata(
			'par-title-color-selector',
			'displayColor',
			properties.titleColor
		);

		api.updateInterfaceMetadata('par-title-color-selector', 'defaultColor', DEFAULT_TEXT_COLOR);

		api.updateInterfaceMetadata(
			'par-title-color-selector',
			'tooltipContent',
			'Select a color for the chart title to align it with your dashboard theme, branding, or design preferences. The chosen color will apply only to the title of the visualization. For better accessibility, ensure sufficient contrast between the header background and title text. You can verify this by checking the contrast ratio within the color picker. Note that theming is not supported when selecting a custom color.'
		);

		api.updateVisibility(
			'par-title-color-selector',
			!!(properties.showHeader && (properties.heading || properties.title))
		);
	};

	function getParsedJson(entity) {
		return typeof entity === 'string' ? JSON.parse(entity) : entity;
	}

	/*
	 *Hide 'Show only breakdowns' field from config panel when,
	 *one of the following conditions are met:
	 *1. Source Type is not Manual
	 *2. Scorecard Type is not of type list
	 *3. More than one or no indicators are configured
	 *4. No breakdowns are configured
	 */
	function hideBreakdownsOnlyProperty(properties) {
		var indicators = properties.indicators;
		var breakdowns = properties.breakdowns;
		var scorecardType = properties.scorecardType;

		return (
			sourceType !== 1 ||
			scorecardType !== 'list' ||
			getParsedJson(indicators).length !== 1 ||
			getParsedJson(breakdowns).length === 0
		);
	}

	function hideBreakdownsAsColumns(properties) {
		return (
			properties.scorecardType !== 'pivot' ||
			getParsedJson(properties.breakdowns).length === 0
		);
	}

	function showBreakdownsAsColumns(isVisible) {
		api.updateVisibility('swapBreakdownsAsColumns', isVisible);
	}

	function resetSwapBreakdownsAsColumns() {
		api.updateValue('swapBreakdownsAsColumns', false);
	}

	function indicator(isVisible) {
		api.updateVisibility('par-scorecard-indicators', isVisible);
	}

	function indicatorGroup(isVisible) {
		api.updateVisibility('indicatorGroup', isVisible);
	}

	function indicatorQuery(isVisible) {
		api.updateVisibility('query', isVisible);
	}

	function isShowAllEnabled(breakdowns) {
		return breakdowns?.[0]?.perPage === 'ALL';
	}

	function isPerPageGreaterThanLimit(breakdowns) {
		return breakdowns?.[0]?.perPage > 20;
	}

	function resetIndicatorQuery() {
		api.updateValue('query', 'display=true^benchmarking=false');
	}

	function resetIndicators() {
		api.updateValue('indicators', []);
	}

	function resetIndicatorGroup() {
		api.updateValue('indicatorGroup', '');
	}

	function toggleRuntimeBreakdownProps(value) {
		api.updateValue('allowChangeBreakdown', value);
		api.updateVisibility('allowChangeBreakdown', value);
		api.updateValue('breakdownVisibilitySelector', value);
		api.updateVisibility('breakdownVisibilitySelector', value);
	}

	function disableRunTimeBreakdownProps(properties) {
		var indicators = getParsedJson(properties.indicators);
		var breakdowns = getParsedJson(properties.breakdowns);
		var dsFilters = indicators?.[0]?.breakdowns;
		if (
			dsFilters?.length > 0 &&
			(dsFilters.length > 1 || breakdowns.length > 1)
		) {
			api.updateValue('allowChangeBreakdown', false);
			api.updateEnabled('allowChangeBreakdown', false);
		} else {
			api.updateValue('allowChangeBreakdown', properties.allowChangeBreakdown);
			api.updateEnabled('allowChangeBreakdown', true);
		}
	}

	function updateBreakdownsPerPage(breakdowns, api) {
		var MAX_LIMIT = 20;
		var perPage = breakdowns[0].perPage;
		var updatedBreakdowns = breakdowns.map((breakdown) => {
			return {
				...breakdown,
				perPage: perPage == 'ALL' || perPage > MAX_LIMIT ? MAX_LIMIT : perPage,
			};
		});
		api.updateValue('breakdowns', getParsedJson(updatedBreakdowns));
	}

	function handleSortingOptions() {
		const ALL_SORT_BY_OPTIONS = [
			{ label: 'Default', value: 'default' },
			{ label: 'Name', value: 'name' },
			{ label: 'Last score', value: 'score' },
			{ label: 'Target', value: 'target' },
			{ label: 'Change', value: 'change' },
			{ label: 'Change %', value: 'changePercent' },
			{ label: 'Gap', value: 'gap' },
			{ label: 'Gap %', value: 'gapPercent' },
			{ label: 'Group order', value: 'indicator_group' },
		];

		const filteredSortByOptions = ALL_SORT_BY_OPTIONS.filter((sortOption) =>
			sortOption.value === 'default' ? sourceType === 1 : true
		);

		const hasCurrentSortBy = filteredSortByOptions.find(
			(option) => option.value === properties?.sortBy
		);

		if (!hasCurrentSortBy) {
			api.updateValue('sortBy', 'name');
		}

		if (trigger === 'sourceType' && sourceType === 1) {
			api.updateValue('sortBy', 'default');
		}

		api.updateTypeMetadata('sortBy', 'choices', filteredSortByOptions);
	}

	function hasBreakdownFilters() {
		return properties.breakdowns?.some(
			(breakdown) => breakdown?.elementIds?.length > 0
		);
	}

	function convertBreakdownToDataSourceFilters() {
		var updatedIndicators = properties.indicators;

		properties.breakdowns.forEach(({ breakdownId, elementIds }) => {
			if (elementIds?.length > 0) {
				const newIndicatorBreakdown = {
					sysId: breakdownId,
					elementSysIds: [...elementIds],
				};

				updatedIndicators = updatedIndicators.map(
					({ breakdowns, ...indicator }) => {
						const existingBreakdownIndex = breakdowns?.findIndex(
							({ sysId }) => breakdownId === sysId
						);

						if (existingBreakdownIndex >= 0) {
							const newElementSysIds = [
								...new Set([
									...newIndicatorBreakdown.elementSysIds,
									...breakdowns[existingBreakdownIndex].elementSysIds,
								]),
							];

							breakdowns[
								existingBreakdownIndex
							].elementSysIds = newElementSysIds;
						} else if (breakdowns) {
							breakdowns.push(newIndicatorBreakdown);
						} else {
							breakdowns = [newIndicatorBreakdown];
						}

						return {
							...indicator,
							breakdowns,
						};
					}
				);
			}
		});

		api.updateValue('indicators', updatedIndicators);
		api.updateInterfaceMetadata(
			'par-breakdowns',
			'indicators',
			updatedIndicators
		);

		var updatedBreakdowns = properties.breakdowns.map(
			({ elementIds, ...breakdown }) => {
				return {
					...breakdown,
					elementIds: [],
				};
			}
		);
		api.updateValue('breakdowns', updatedBreakdowns);
		api.updateInterfaceMetadata(
			'par-breakdowns',
			'breakdowns',
			updatedBreakdowns
		);
	}

	// Helper functions for updating metadata across multiple components
	function updateMetadataForComponents(components, key, value) {
		components.forEach(component => {
			api.updateInterfaceMetadata(component, key, value);
		});
	}

	function shouldTriggerOn(triggerName) {
		return !trigger || trigger === triggerName;
	}

	function shouldTriggerOnAny(triggerNames) {
		return !trigger || triggerNames.includes(trigger);
	}

	// Extracted handler functions
	function handleDevSettings() {
		const { hideDevSettings } = properties;
		api.updateVisibility('headingLevel', !hideDevSettings);
		api.updateVisibility('enableDrilldown', !hideDevSettings);

		// Show/Hide cache props
		api.updateVisibility('useDataCache', !hideDevSettings);
		const showCacheProps = Boolean(api.isDynamic('useDataCache') || properties.useDataCache);
		api.updateVisibility('cacheExpirationTime', showCacheProps);
		api.updateVisibility('showCacheTime', showCacheProps);
	}

	function handleSourceTypeChange() {
		if (sourceType === 0) {
			indicatorQuery(true);
			indicator(false);
			indicatorGroup(false);
			resetIndicators();
			resetIndicatorGroup();
		} else if (sourceType === 1) {
			indicatorQuery(false);
			indicator(true);
			indicatorGroup(false);
			resetIndicatorQuery();
			resetIndicatorGroup();
		} else if (sourceType === 2) {
			indicatorQuery(false);
			indicator(false);
			indicatorGroup(true);
			resetIndicatorQuery();
			resetIndicators();
		}
	}

	function handleBreakdownsOnlyVisibility() {
		const shouldHide = hideBreakdownsOnlyProperty(properties);
		
		if (shouldHide) {
			api.updateValue('showBreakdownsOnly', false);
			api.updateVisibility('showBreakdownsOnly', false);
			toggleRuntimeBreakdownProps(false);
			updateMetadataForComponents(['par-scorecard-metrics'], 'showBreakdownsOnly', false);
		} else {
			api.updateValue('showBreakdownsOnly', properties.showBreakdownsOnly);
			api.updateVisibility('showBreakdownsOnly', true);
			updateMetadataForComponents(['par-scorecard-metrics'], 'showBreakdownsOnly', properties.showBreakdownsOnly);
			disableRunTimeBreakdownProps(properties);
		}
	}

	function handleShowBreakdownsOnlyChange() {
		updateMetadataForComponents(['par-scorecard-metrics'], 'showBreakdownsOnly', properties.showBreakdownsOnly);

		if (properties.showBreakdownsOnly === true) {
			api.updateValue('allowChangeBreakdown', properties.allowChangeBreakdown);
			api.updateVisibility('allowChangeBreakdown', true);
			disableRunTimeBreakdownProps(properties);
		} else {
			toggleRuntimeBreakdownProps(false);
		}
	}

	function handleAllowChangeBreakdownToggle() {
		if (properties.allowChangeBreakdown === true) {
			api.updateValue('breakdownVisibilitySelector', properties.breakdownVisibilitySelector);
			api.updateVisibility('breakdownVisibilitySelector', true);
		} else {
			api.updateValue('breakdownVisibilitySelector', false);
			api.updateVisibility('breakdownVisibilitySelector', false);
		}
	}

	function handlePageSizeVisibility() {
		const isListWithFewIndicators = scorecardType === 'list' && 
			sourceType === 1 && 
			getParsedJson(properties.indicators).length <= 10;
		
		api.updateVisibility('pageSize', !isListWithFewIndicators);
	}

	function handleShowAllElementsOption() {
		var showAllElementsOption = false;
		const isListWithBreakdownsOnly = properties.scorecardType === 'list' && properties.showBreakdownsOnly;
		const isPivotWithRowBreakdowns = properties.scorecardType === 'pivot' && !properties.swapBreakdownsAsColumns;
		
		if (isListWithBreakdownsOnly || isPivotWithRowBreakdowns) {
			showAllElementsOption = true;
			api.updateVisibility('pageSize', isShowAllEnabled(properties.breakdowns));
		} else {
			const shouldResetPerPage = isShowAllEnabled(properties.breakdowns) || 
				isPerPageGreaterThanLimit(properties.breakdowns);
			
			if (shouldResetPerPage) {
				updateBreakdownsPerPage(properties.breakdowns, api);
			}
		}
		
		updateMetadataForComponents(['par-breakdowns'], 'showAllElementsOption', showAllElementsOption);
	}

	function handleBreakdownsAsColumnsVisibility() {
		const shouldHide = hideBreakdownsAsColumns(properties);
		
		if (shouldHide) {
			showBreakdownsAsColumns(false);
			resetSwapBreakdownsAsColumns();
		} else {
			showBreakdownsAsColumns(true);

			if (properties.swapBreakdownsAsColumns) {
				var breakdowns = properties.breakdowns;
				if (breakdowns && breakdowns.length > 1) {
					api.updateValue('breakdowns', [getParsedJson(breakdowns)[0]]);
				}
			}
		}
	}

	function handlePivotScorecardSpecialCase() {
		if (properties.scorecardType === 'pivot') {
			api.updateValue('pageSize', '10');
			api.updateVisibility('showFavorite', false);
			api.updateVisibility('showIndicatorInfo', false);
			api.updateEnabled(
				'pageSize',
				!properties.swapBreakdownsAsColumns && isShowAllEnabled(properties.breakdowns)
			);
		} else {
			api.updateEnabled('pageSize', true);
			api.updateVisibility('showFavorite', true);
			api.updateVisibility('showIndicatorInfo', true);
		}
	}

	function handleFollowFiltersChange() {
		api.updateEnabled('showFilterElement', properties.followFilters);
		api.updateVisibility('showFilterIcon', properties.followFilters);
		if (trigger === 'followFilters') {
			api.updateValue('showFilterIcon', properties.followFilters);
		}
	}

	// Handle dev settings visibility
	handleDevSettings();

	// Handle source type changes
	if (shouldTriggerOn('sourceType')) {
		handleSortingOptions();
		handleSourceTypeChange();
	}

	// Handle breakdowns-only property visibility
	if (shouldTriggerOnAny(['indicators', 'breakdowns', 'scorecardType', 'sourceType'])) {
		handleBreakdownsOnlyVisibility();
	}

	// Handle show breakdowns only toggle
	if (shouldTriggerOn('showBreakdownsOnly')) {
		handleShowBreakdownsOnlyChange();
	}

	// Handle allow change breakdown toggle
	if (shouldTriggerOn('allowChangeBreakdown')) {
		handleAllowChangeBreakdownToggle();
	}

	// Handle page size visibility for list scorecard
	if (shouldTriggerOnAny(['indicators', 'scorecardType', 'sourceType'])) {
		if (scorecardType === 'list' && sourceType === 1) {
			handlePageSizeVisibility();
		} else {
			api.updateVisibility('pageSize', true);
		}
	}

	// Handle show all elements option
	if (shouldTriggerOnAny(['showBreakdownsOnly', 'scorecardType', 'swapBreakdownsAsColumns', 'breakdowns'])) {
		handleShowAllElementsOption();
	}

	// Handle breakdowns as columns and pivot-specific behavior
	if (shouldTriggerOnAny(['breakdowns', 'scorecardType', 'swapBreakdownsAsColumns'])) {
		handleBreakdownsAsColumnsVisibility();
		handlePivotScorecardSpecialCase();
	}

	// Update interface metadata for various triggers
	if (shouldTriggerOn('swapBreakdownsAsColumns')) {
		updateMetadataForComponents(['par-breakdowns'], 'swapBreakdownsAsColumns', properties.swapBreakdownsAsColumns);
	}

	if (shouldTriggerOn('indicatorGroup')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-aggregates'],
			'indicatorGroup',
			properties.indicatorGroup
		);
	}

	if (shouldTriggerOn('query')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-aggregates'],
			'query',
			properties.query
		);
	}

	if (shouldTriggerOn('indicators')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-metrics', 'par-scorecard-aggregates'],
			'indicators',
			properties.indicators
		);
	}

	if (shouldTriggerOn('breakdowns')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-metrics', 'par-scorecard-aggregates'],
			'breakdowns',
			properties.breakdowns
		);
	}

	if (shouldTriggerOn('scorecardType')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-metrics', 'par-scorecard-aggregates'],
			'scorecardType',
			properties.scorecardType
		);
	}

	if (shouldTriggerOn('sourceType')) {
		updateMetadataForComponents(
			['par-breakdowns', 'par-scorecard-metrics', 'par-scorecard-aggregates'],
			'sourceType',
			properties.sourceType
		);
	}

	// Handle follow filters changes
	if (!trigger || trigger === 'followFilters') {
		handleFollowFiltersChange();
	}

	// Convert breakdown to data source filters if needed
	if (sourceType === 1 && properties.indicators?.length > 0 && hasBreakdownFilters()) {
		convertBreakdownToDataSourceFilters();
	}

	// Handle color selectors
	handleHeaderColorSelector({api, properties});
	handleTitleColorSelector({api, properties});
	
	// Control header-realted properties visibility based on showHeader
	api.updateVisibility('showHeaderSeparator', properties.showHeader);
	api.updateVisibility('wrapTitle', properties.showHeader);
	api.updateVisibility('heading', properties.showHeader);
	api.updateVisibility('description', properties.showHeader);
	api.updateVisibility('headerTitleAlignment', properties.showHeader);
	api.updateVisibility('headingVariant', properties.showHeader);
	api.updateVisibility('lineClamp', properties.showHeader && !properties.wrapTitle);

}
