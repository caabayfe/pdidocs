// This script sets logical behavior for the controller config modal in UIB
function listControllerPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;

	// Helper function to update property value only when not bootstrap
	function updatePropertyWithValue(property, value) {
		if (!isBootstrap) {
			args.api.updateProperty(property, { value: value });
		}
	}
	// all list type prop updates
	if (args.trigger === 'listType' || isBootstrap) {
		const currentListType = args.properties.listType;
		const columnFilteringPopoverDisplay =
			args.properties.columnFilteringPopoverDisplay;

		// even though there are more supported list types, only some should be exposed in the UIB dropdown.
		const selectableTypesChoices = [
			{
				label: 'Default',
				sublabel: 'A list with a full feature set',
				value: 'default',
			},
			{
				label: 'Simple',
				sublabel:
					'A simplified list for small spaces within dashboards etc',
				value: 'simple',
			},
			{
				label: 'Related',
				sublabel:
					'A list that shows records related to a parent record in the context of a form',
				value: 'related',
			},
		];

		const individualListProps = [
			'table',
			'listTitle',
			'fixedFilter',
			'filter',
			'groupBy',
			'view',
			'columns',
			'columnLimit',
			'enableRelatedHierarchy',
			'nestBy',
			'childrenRowLimit',
			'enableBadgeCount',
			'currentPage',
			'enableColumnSorting',
			'enableColumnFiltering',
			'enableColumnGrouping',
			'enableDataVisualization',
			'enableCellFiltering',
			'enableDeclarativeActions',
			'actionConfigId',
			'allRecordsSelected',
			'onlyEnableSelectionWhenRequiredByActions',
			'enableReferenceLinks',
			'liveUpdates',
			'enableLiveList',
			'enableInfiniteScroll',
			'enableDotWalk',
			// transformScriptSysId should also be hidden, but can't be in this list because it's a custom interface
		];
		const menuListProps = [
			'listMenuConfigurationId',
			'listId',
			'showListOpenedByLinkSection',
		];
		const relatedListProps = [
			'parentTable',
			'parentRecordSysId',
			'relatedListName',
			'isParentNewRecord',
			'isParentReadOnly',
		];

		if (
			currentListType === 'default' ||
			currentListType === 'simple' ||
			currentListType === 'related'
		) {
			// common amongst these 3 list types
			individualListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: true });
			});
			menuListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: false });
				updatePropertyWithValue(prop, null);
			});
			args.api.updateProperty('selectedRecords', { isVisible: true });
			args.api.updateProperty('exceptedRecords', { isVisible: true });
			args.api.updateProperty('highlightedValueConfigId', {
				isVisible: true,
			});

			// hide / show transform script arguments when variant is set
			args.api.updateProperty('transformScriptArgs', {
				isVisible: !!args.properties.transformScriptSysId,
			});

			// specific to each list type
			switch (currentListType) {
				case 'default':
					relatedListProps.map(function f(prop) {
						args.api.updateProperty(prop, { isVisible: false });
						updatePropertyWithValue(prop, null);
					});
					args.api.updateProperty('enableQuickEdit', {
						isVisible: true,
					});
					args.api.updateProperty('enableQuickFormNavigation', {
						isVisible: !args.properties.nestBy,
					});
					args.api.updateProperty('enforceViewRulesForQuickForm', {
						isVisible: true,
					});

					// if the user manually changed the list type, the value should update to reflect the new type.
					// if they just refreshed and kept the same type, we should preserve their configs.
					updatePropertyWithValue('enableQuickEdit', true);
					updatePropertyWithValue(
						'enableQuickFormNavigation',
						!args.properties.nestBy
					);
					updatePropertyWithValue(
						'enforceViewRulesForQuickForm',
						true
					);
					args.api.updateVisibility('list-transform', true);
					break;

				case 'simple':
					relatedListProps.map(function f(prop) {
						args.api.updateProperty(prop, { isVisible: false });
						updatePropertyWithValue(prop, null);
					});
					args.api.updateProperty('enableQuickEdit', {
						isVisible: false,
					});
					args.api.updateProperty('enableQuickFormNavigation', {
						isVisible: false,
					});
					args.api.updateProperty('enforceViewRulesForQuickForm', {
						isVisible: false,
					});

					updatePropertyWithValue('enableInfiniteScroll', false);
					updatePropertyWithValue('liveUpdates', 'off');
					updatePropertyWithValue('enableQuickEdit', false);
					updatePropertyWithValue('enableQuickFormNavigation', false);
					updatePropertyWithValue(
						'enforceViewRulesForQuickForm',
						false
					);
					args.api.updateVisibility('list-transform', true);
					break;

				case 'related':
					relatedListProps.map(function f(prop) {
						args.api.updateProperty(prop, { isVisible: true });
					});
					args.api.updateProperty('enableQuickEdit', {
						isVisible: false,
					});
					args.api.updateProperty('enableQuickFormNavigation', {
						isVisible: false,
					});
					args.api.updateProperty('enforceViewRulesForQuickForm', {
						isVisible: false,
					});

					updatePropertyWithValue('enableInfiniteScroll', false);
					updatePropertyWithValue('liveUpdates', 'off');
					updatePropertyWithValue('enableQuickEdit', false);
					updatePropertyWithValue('enableQuickFormNavigation', false);
					updatePropertyWithValue(
						'enforceViewRulesForQuickForm',
						false
					);
					args.api.updateVisibility('list-transform', true);
					break;

				default:
					break;
			}

			switch (columnFilteringPopoverDisplay) {
				case 'allowBoth':
					updatePropertyWithValue('enableColumnFiltering', true);
					updatePropertyWithValue('enableColumnGrouping', true);
					updatePropertyWithValue(
						'columnFilteringPopoverDisplay',
						''
					);
					break;
				case 'allowOnlyFiltering':
					updatePropertyWithValue('enableColumnFiltering', true);
					updatePropertyWithValue('enableColumnGrouping', false);
					updatePropertyWithValue(
						'columnFilteringPopoverDisplay',
						''
					);
					break;
				case 'allowOnlyGrouping':
					updatePropertyWithValue('enableColumnFiltering', false);
					updatePropertyWithValue('enableColumnGrouping', true);
					updatePropertyWithValue(
						'columnFilteringPopoverDisplay',
						''
					);
					break;
				case 'disallowColumnFilteringPopover':
					updatePropertyWithValue('enableColumnFiltering', false);
					updatePropertyWithValue('enableColumnGrouping', false);
					updatePropertyWithValue(
						'columnFilteringPopoverDisplay',
						''
					);
					break;
				default:
					break;
			}
		} else if (currentListType === 'withMenu') {
			menuListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: true });
			});
			individualListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: false });
				if (
					prop !== 'actionConfigId' &&
					prop !== 'enableDeclarativeActions' &&
					prop !== 'view'
				) {
					updatePropertyWithValue(prop, null);
				}
			});
			relatedListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: false });
				updatePropertyWithValue(prop, null);
			});
			args.api.updateProperty('enableQuickEdit', { isVisible: false });
			args.api.updateProperty('enableQuickFormNavigation', {
				isVisible: !args.properties.nestBy,
			});
			args.api.updateProperty('enforceViewRulesForQuickForm', {
				isVisible: true,
			});
			args.api.updateProperty('enableDotWalk', { isVisible: true });
			args.api.updateProperty('selectedRecords', { isVisible: false });
			args.api.updateProperty('exceptedRecords', { isVisible: false });

			// if the user manually changed the list type, the value should update to reflect the new type.
			// if they just refreshed and kept the same type, we should preserve their configs.
			updatePropertyWithValue('enabledInfiniteScroll', false);
			updatePropertyWithValue('liveUpdates', 'off');
			updatePropertyWithValue(
				'enableQuickFormNavigation',
				!args.properties.nestBy
			);
			updatePropertyWithValue('enforceViewRulesForQuickForm', true);
			updatePropertyWithValue('enableDotWalk', true);
			// if we set these to "null", "null" will display in the field
			updatePropertyWithValue('selectedRecords', []);
			updatePropertyWithValue('exceptedRecords', []);

			// custom transforms are not allowed in menu lists because the same script would apply to every list in the menu
			args.api.updateVisibility('list-transform', false);
			updatePropertyWithValue('transformScriptSysId', null);
			args.api.updateProperty('transformScriptArgs', {
				isVisible: false,
			});
			updatePropertyWithValue('transformScriptArgs', null);

			// withMenu is a hidden type
			// if it is applied through a binding etc, we should unhide it in the choices so that a user can see which type is applied.
			const withMenuChoice = {
				label: 'With menu',
				value: 'withMenu',
			};
			selectableTypesChoices.push(withMenuChoice);

			// Hide card field mapping in case of withMenu
			args.api.updateVisibility('card-field-mapping', false);
			// Hide empty hanging section if no card field mapping inside in both layouts case
			updateSectionVisibility('field-visibility-gallery', false);
		}

		args.api.updateProperty('listType', {
			typeMetadata: {
				choices: selectableTypesChoices,
			},
			enabled: currentListType !== 'withMenu',
		});
	}

	// 	--------------------------------------------------
	//   	   INFINITE SCROLL START - List Controller
	//  --------------------------------------------------
	function setInfiniteScrollDependencies(policyArgs) {
		policyArgs.api.updateProperty('currentPage', { isVisible: false });
		policyArgs.api.updateProperty('groupBy', { isVisible: false });
		policyArgs.api.updateProperty('enableColumnGrouping', {
			isVisible: false,
		});
		policyArgs.api.updateProperty('allRecordsSelected', {
			isVisible: false,
		});
	}

	function resetInfiniteScrollDependencies(policyArgs) {
		policyArgs.api.updateProperty('currentPage', { isVisible: true });
		policyArgs.api.updateProperty('groupBy', { isVisible: true });
		policyArgs.api.updateProperty('enableColumnGrouping', {
			isVisible: true,
		});
		policyArgs.api.updateProperty('allRecordsSelected', {
			isVisible: true,
		});
	}

	if (args.trigger === 'liveUpdates' || isBootstrap) {
		// When liveUpdates is set to "automatic_refresh", enableInfiniteScroll must be set to true
		if (
			args.properties.liveUpdates === 'automatic_refresh' &&
			args.properties.enableInfiniteScroll == false
		) {
			setInfiniteScrollDependencies(args);
		}
	}
	// hide and set default values when enableInfiniteScroll is set
	if (args.trigger === 'enableInfiniteScroll') {
		if (args.properties.enableInfiniteScroll) {
			setInfiniteScrollDependencies(args);
		} else if (!isBootstrap) {
			resetInfiniteScrollDependencies(args);
		}
	}

	if (isBootstrap && args.properties.enableInfiniteScroll == true) {
		setInfiniteScrollDependencies(args);
	}
	// 	--------------------------------------------------
	//        INFINITE SCROLL END - List Controller
	//  --------------------------------------------------

	if (
		args.trigger === 'table' ||
		args.trigger === 'listType' ||
		isBootstrap
	) {
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'table',
			args.properties.table
		);
	}

	// hide columns and colPrefKey when view set
	if (args.trigger === 'view' || args.trigger === 'listType' || isBootstrap) {
		args.api.updateProperty('columns', {
			isVisible: !args.properties.view,
		});
		args.api.updateProperty('columnPreferenceKey', {
			isVisible:
				args.properties.columns ||
				args.properties.listType === 'withMenu',
		});
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'view',
			args.properties.view
		);
	}

	// hide view when columns set
	if (
		args.trigger === 'columns' ||
		args.trigger === 'listType' ||
		isBootstrap
	) {
		args.api.updateProperty('view', {
			isVisible: !args.properties.columns,
		});
		args.api.updateProperty('columnPreferenceKey', {
			isVisible:
				args.properties.columns ||
				args.properties.listType === 'withMenu',
		});
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'columns',
			args.properties.columns
		);
	}

	// declarative actions dependency
	if (args.trigger === 'enableDeclarativeActions' || isBootstrap) {
		args.api.updateProperty('actionConfigId', {
			enabled: args.properties.enableDeclarativeActions,
		});
	}

	// highlighted values dependency
	if (args.trigger === 'fetchHighlightedValues' || isBootstrap) {
		args.api.updateProperty('highlightedValueConfigId', {
			enabled: args.properties.fetchHighlightedValues,
		});
	}

	// hide / show transform script arguments when script is set
	if (args.trigger === 'transformScriptSysId' || isBootstrap) {
		args.api.updateProperty('transformScriptArgs', {
			isVisible: !!args.properties.transformScriptSysId && args.properties.listType !== 'withMenu',
		});
	}

	if (args.trigger === 'enableQuickEdit' || isBootstrap) {
		args.api.updateProperty('enableQuickFormNavigation', {
			isVisible:
				!args.properties.nestBy && args.properties.enableQuickEdit,
		});
		args.api.updateProperty('enforceViewRulesForQuickForm', {
			isVisible: args.properties.enableQuickEdit,
		});
	}

	if (args.trigger === 'nestBy' || isBootstrap) {
		args.api.updateProperty('childrenRowLimit', {
			isVisible: args.properties.nestBy,
		});
		args.api.updateProperty('enableBadgeCount', {
			isVisible: args.properties.nestBy,
		});

		if (args.properties.nestBy) {
			args.api.updateProperty('enableQuickFormNavigation', {
				isVisible: false,
			});
			updatePropertyWithValue('enableQuickFormNavigation', false);
		} else if (!isBootstrap) {
			args.api.updateProperty('enableQuickFormNavigation', {
				isVisible: args.properties.enableQuickEdit,
			});
			updatePropertyWithValue('enableQuickFormNavigation', true);
		}
	}

	const enableRelatedHierarchyDependentProps = [
		'liveUpdates',
		'nestBy',
		'enableInfiniteScroll',
	];
	const withMenu = args.properties.listType === 'withMenu';

	if (!withMenu) {
		if (args.trigger === 'enableRelatedHierarchy' || isBootstrap) {
			const enableRelatedHierarchy =
				args.properties.enableRelatedHierarchy === true;
			enableRelatedHierarchyDependentProps.map((prop) =>
				updatePropertyVisibility(prop, !enableRelatedHierarchy)
			);
		}

		if (
			enableRelatedHierarchyDependentProps.includes(args.trigger) ||
			isBootstrap
		) {
			const isLiveListTurnedOn = args.properties.liveUpdates !== 'off';
			const isInfiniteScrollEnabled =
				args.properties.enableInfiniteScroll === true;
			const nestBy = args.properties.nestBy;
			const showEnableRelatedHierarchy = !(
				isLiveListTurnedOn ||
				isInfiniteScrollEnabled ||
				nestBy
			);
			updatePropertyVisibility(
				'enableRelatedHierarchy',
				showEnableRelatedHierarchy
			);
		}
	}

	const commonSections = [
		'field-visibility',
		'end-user-capabilities',
		'data-organization',
	];
	const listOnlySections = [
		'field-visibility-list-only',
		'end-user-capabilities-list-only',
		'data-organization',
	];
	const galleryOnlySections = [
		'field-visibility-gallery-only',
		'end-user-capabilities-gallery-only',
		'data-organization-gallery-only',
	];

	function updateSectionVisibility(section, isVisible) {
		args.api.updateSection(section, { isVisible });
	}
	function updatePropertyVisibility(property, isVisible) {
		args.api.updateProperty(property, { isVisible });
	}
	function updatePropertyEnabledState(property, isEnabled) {
		args.api.updateProperty(property, { enabled: isEnabled });
	}

	if (args.trigger === 'layouts' || isBootstrap) {
		// Hide all sections first
		commonSections.map((section) =>
			updateSectionVisibility(section, false)
		);
		galleryOnlySections.map((section) =>
			updateSectionVisibility(section, false)
		);
		listOnlySections.map((section) =>
			updateSectionVisibility(section, false)
		);

		updatePropertyVisibility('displayedLayout', false);
		updatePropertyVisibility('liveUpdates', true);

		const layouts = args.properties.layouts;
		if (layouts.includes('list') && layouts.includes('gallery')) {
			commonSections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyVisibility('displayedLayout', true);
		} else if (layouts.includes('list')) {
			listOnlySections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyWithValue('displayedLayout', 'list');
		} else if (layouts.includes('gallery')) {
			galleryOnlySections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyWithValue('displayedLayout', 'gallery');
			updatePropertyWithValue('liveUpdates', 'off');
			updatePropertyVisibility('liveUpdates', false);
		}
	}

	// This is to ensure that only one of the two properties is visible at a time
	if (args.trigger === 'allRecordsSelected' || isBootstrap) {
		const allRecordsSelected = args.properties.allRecordsSelected === true;
		// Hide selectedRecords when allRecordsSelected is set and vice versa
		updatePropertyVisibility('selectedRecords', !allRecordsSelected);
		// Show exceptedRecords when allRecordsSelected is set and vice versa
		updatePropertyVisibility('exceptedRecords', allRecordsSelected);
	}

	function updateListCalculationDependenciesState(isEnabled) {
		updatePropertyEnabledState('nestBy', isEnabled);
		updatePropertyEnabledState('liveUpdates', isEnabled);
		updatePropertyEnabledState('enableInfiniteScroll', isEnabled);
	}

	//When the listCalculations prop is enabled, the nestBy, infiniteScroll, and liveUpdates props are hidden (and vice versa).
	if (
		[
			'liveUpdates',
			'nestBy',
			'enableInfiniteScroll',
			'layouts',
			'listType',
		].includes(args.trigger) ||
		isBootstrap
	) {
		const isLiveListTurnedOn = args.properties.liveUpdates !== 'off';
		const isInfiniteScrollEnabled =
			args.properties.enableInfiniteScroll === true;
		const nestBy = args.properties.nestBy;
		const isGalleryOnlyLayout = args.properties.layouts === 'gallery';
		const isMenuListType = args.properties.listType === 'withMenu';
		const shouldEnableListCalculationsProp = !(
			isLiveListTurnedOn ||
			isInfiniteScrollEnabled ||
			nestBy ||
			isGalleryOnlyLayout ||
			isMenuListType
		);
		const isListCalculationsEnabled =
			args.properties.enableColumnCalculations === true;

		if (isMenuListType || isGalleryOnlyLayout) {
			updatePropertyVisibility(
				'enableColumnCalculations',
				shouldEnableListCalculationsProp
			);
		} else {
			updatePropertyVisibility('enableColumnCalculations', true);
			updatePropertyEnabledState(
				'enableColumnCalculations',
				shouldEnableListCalculationsProp
			);
		}

		// If listCalculations should be disabled but is currently enabled, reset it to false.
		if (!shouldEnableListCalculationsProp && isListCalculationsEnabled) {
			updatePropertyWithValue('enableColumnCalculations', false);
			updateListCalculationDependenciesState(true);
		} else if (isListCalculationsEnabled) {
			updateListCalculationDependenciesState(false);
		}
	}

	if (args.trigger === 'enableColumnCalculations') {
		const isListCalculationsEnabled =
			args.properties.enableColumnCalculations === true;
		updateListCalculationDependenciesState(!isListCalculationsEnabled);
	}
}
