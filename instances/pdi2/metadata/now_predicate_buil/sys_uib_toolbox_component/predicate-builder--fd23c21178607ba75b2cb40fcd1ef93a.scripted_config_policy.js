// This file sets logical behavior for the now-predicate-builder config panel in UIB
// e.g. disabling properties that depending on other props, etc

//eslint-disable-next-line no-unused-vars
function nowPredicateBuilderPolicy(helpers) {
	const { api, trigger, properties } = helpers;
	const CONDITION_BUILDER_TYPE = 'CONDITION_BUILDER';

	const setPredicateBuilderSectionVisibility = (value) => {
		api.updateSectionVisibility('predicate-builder', value);
	};
	const setConditionBuilderSectionVisibility = (value) => {
		api.updateSectionVisibility('condition-builder', value);
		api.updateSectionVisibility('advanced', value);
	};
	// handle the case when the component is first loaded or when the builderType is changed
	if (!trigger || trigger === 'builderType') {
		if (properties?.builderType === CONDITION_BUILDER_TYPE) {
			setPredicateBuilderSectionVisibility(false);
			setConditionBuilderSectionVisibility(true);
		} else {
			setPredicateBuilderSectionVisibility(true);
			setConditionBuilderSectionVisibility(false);
		}
	}

	if (
		!trigger ||
		['showSortBy', 'showGroupBy', 'showRelatedListConditions'].includes(
			trigger
		)
	) {
		const showSortBy = properties?.showSortBy;
		const showGroupBy = properties?.showGroupBy;
		const showRelatedListConditions = properties?.showRelatedListConditions;

		// handle case where the selectedTab is set to a tab that is hidden. We want to set the value to condition
		if (
			(trigger === 'showSortBy' && !showSortBy) ||
			(trigger === 'showGroupBy' && !showGroupBy) ||
			(trigger === 'showRelatedListConditions' &&
				!showRelatedListConditions)
		) {
			api.updateValue('selectedTab', 'condition');
		}

		const selectedTabOptions = [];
		if (showSortBy) {
			selectedTabOptions.push({
				value: 'sort-by',
				label: 'Sort by',
			});
		}
		if (showGroupBy) {
			selectedTabOptions.push({
				value: 'group-by',
				label: 'Group by',
			});
		}
		if (showRelatedListConditions) {
			selectedTabOptions.push({
				value: 'related-list',
				label: 'Related list conditions',
			});
		}

		// Hide the selectedTab prop if there are no tabs showing. Otherwise add condition as the first option
		if (selectedTabOptions.length === 0) {
			api.updateVisibility('selectedTab', false);
			api.updateValue('selectedTab', 'condition');
		} else {
			selectedTabOptions.unshift({
				value: 'condition',
				label: 'Conditions',
			});
			api.updateVisibility('selectedTab', true);
		}

		api.updateTypeMetadata('selectedTab', 'choices', selectedTabOptions);
	}
}
