// eslint-disable-next-line no-unused-vars
function inputDateTimeIntervalPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateEnabled(
			'readonly',
			!properties.disabled && !properties.autofocus,
		);
		api.updateEnabled(
			'disabled',
			!properties.readonly && !properties.autofocus,
		);
		api.updateEnabled(
			'autofocus',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled('opened', !properties.disabled && !properties.readonly);
		api.updateEnabled(
			'footerActions',
			!properties.disabled &&
				!properties.readonly &&
				!properties.showDefaultFooterActions,
		);
		api.updateEnabled(
			'showDefaultFooterActions',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'hideAdjacentDates',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'panelFitProps',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'weekdayHeadings',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'firstDayOfWeek',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'disableWeekends',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'weekendDays',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled(
			'disabledItems',
			!properties.disabled && !properties.readonly,
		);
		api.updateEnabled('optional', !properties.required);
		api.updateEnabled('hideRequiredIndicator', properties.required);
		api.updateEnabled('required', !properties.optional);
		api.updateSectionVisibility('picker', properties.type !== 'time');
		api.updateVisibility('showPresetGroups', properties.enablePresets);
		api.updateVisibility('customPresets', properties.enablePresets);
		api.updateVisibility('activePreset', properties.enablePresets);
		api.updateVisibility(
			'customPresetPositionBottom',
			properties.enablePresets,
		);
		api.updateVisibility(
			'firstDayOfWeek',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year' &&
				properties.type !== 'week-year',
		);
		api.updateVisibility(
			'disableWeekends',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility(
			'hideAdjacentDates',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year' &&
				properties.type !== 'week-year',
		);
		api.updateVisibility(
			'weekendDays',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility(
			'weekdayHeadings',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility('initialTimeEnd', properties.type === 'date-time');
		api.updateVisibility('initialTimeStart', properties.type === 'date-time');
	}

	// Inter-related properties
	if (trigger === 'disabled') {
		api.updateEnabled('readonly', !properties.disabled);
		api.updateEnabled('autofocus', !properties.disabled);
		api.updateEnabled('opened', !properties.disabled);
		api.updateEnabled('footerActions', !properties.disabled);
		api.updateEnabled('showDefaultFooterActions', !properties.disabled);
		api.updateEnabled('hideAdjacentDates', !properties.disabled);
		api.updateEnabled('panelFitProps', !properties.disabled);
		api.updateEnabled('weekdayHeadings', !properties.disabled);
		api.updateEnabled('firstDayOfWeek', !properties.disabled);
		api.updateEnabled('disableWeekends', !properties.disabled);
		api.updateEnabled('weekendDays', !properties.disabled);
		api.updateEnabled('disabledItems', !properties.disabled);
	}
	if (trigger === 'readonly') {
		api.updateEnabled('disabled', !properties.readonly);
		api.updateEnabled('autofocus', !properties.readonly);
		api.updateEnabled('opened', !properties.readonly);
		api.updateEnabled('footerActions', !properties.readonly);
		api.updateEnabled('showDefaultFooterActions', !properties.readonly);
		api.updateEnabled('hideAdjacentDates', !properties.readonly);
		api.updateEnabled('panelFitProps', !properties.readonly);
		api.updateEnabled('weekdayHeadings', !properties.readonly);
		api.updateEnabled('firstDayOfWeek', !properties.readonly);
		api.updateEnabled('disableWeekends', !properties.readonly);
		api.updateEnabled('weekendDays', !properties.readonly);
		api.updateEnabled('disabledItems', !properties.readonly);
	}
	if (trigger === 'autofocus') {
		api.updateEnabled('disabled', !properties.autofocus);
		api.updateEnabled('readonly', !properties.autofocus);
	}
	if (trigger === 'required') {
		api.updateEnabled('hideRequiredIndicator', properties.required);
		api.updateEnabled('optional', !properties.required);
		if (!properties.required) {
			api.updateValue('hideRequiredIndicator', false);
		}
	}
	if (trigger === 'optional') {
		api.updateEnabled('required', !properties.optional);
	}
	if (trigger === 'showDefaultFooterActions') {
		api.updateEnabled('footerActions', !properties.showDefaultFooterActions);
	}
	if (trigger === 'type') {
		api.updateSectionVisibility('picker', properties.type !== 'time');
		api.updateVisibility(
			'firstDayOfWeek',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year' &&
				properties.type !== 'week-year',
		);
		api.updateVisibility(
			'disableWeekends',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility(
			'hideAdjacentDates',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year' &&
				properties.type !== 'week-year',
		);
		api.updateVisibility(
			'weekendDays',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility(
			'weekdayHeadings',
			properties.type !== 'quarter' &&
				properties.type !== 'month' &&
				properties.type !== 'year',
		);
		api.updateVisibility('initialTimeEnd', properties.type === 'date-time');
		api.updateVisibility('initialTimeStart', properties.type === 'date-time');
	}
	if (trigger === 'enablePresets') {
		api.updateVisibility('showPresetGroups', properties.enablePresets);
		api.updateVisibility('customPresets', properties.enablePresets);
		api.updateVisibility('activePreset', properties.enablePresets);
		api.updateVisibility(
			'customPresetPositionBottom',
			properties.enablePresets,
		);
	}
}
