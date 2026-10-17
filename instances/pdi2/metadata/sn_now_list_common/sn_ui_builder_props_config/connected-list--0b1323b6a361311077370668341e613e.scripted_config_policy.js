// This script sets logical behavior for the now-list config panel in UIB ONLY WHEN NOW-LIST IS USED WITH THE LIST CONTROLLER PRESET.
// There is a separate script in the now-list repo for the default when now-list has no preset applied.
function connectedListPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;
	// external props from the controller are objects, not strings the way component props are.
	// shape: { type: 'externalProp', name: 'propName'}
	// setting this as a var and checking it prevents js object value semantics issues and shortens if statements
	// null is of type object, so args.trigger.<prop> will result in an error when it isBootstrap
	var isExternalTrigger = !isBootstrap && typeof args.trigger === 'object';

	// Helper function to update property value only when not bootstrap
	function updatePropertyWithValue(property, value) {
		if (!isBootstrap) {
			args.api.updateProperty(property, { value: value });
		}
	}

	// this script doesn't include hiding selection, dragdrops, etc like now-list's vanilla policy does
	// since there is no need to account for invalid rows/cols in connected case
	// all list type prop updates
	if (
		(isExternalTrigger && args.trigger?.name === 'listType') ||
		isBootstrap
	) {
		const currentListType = args.externalProperties.listType;
		const columnFilteringPopoverDisplay =
			args.externalProperties.columnFilteringPopoverDisplay;
		const enableLiveList = args.externalProperties.enableLiveList;

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
		const individualListExternalProps = [
			'table',
			'listTitle',
			'fixedFilter',
			'filter',
			'groupBy',
			'view',
			'columns',
			'columnLimit',
			'enableColumnSorting',
			'enableColumnFiltering',
			'enableColumnGrouping',
			'enableDataVisualization',
			'enableCellFiltering',
			'allRecordsSelected',
			'onlyEnableSelectionWhenRequiredByActions',
			'enableReferenceLinks',
			'liveUpdates',
			'enableLiveList',
			'enableInfiniteScroll',
			'enableRelatedHierarchy',
			'nestBy',
			'childrenRowLimit',
			'enableBadgeCount',
		];
		const individualListProps = [
			'cellEditingEnabled',
			'clickableTextEnabled',
			'columnDragDropEnabled',
			'columnResizingEnabled',
			'expandAllGroups',
			'maxCharacters',
			'rowDragDropEnabled',
			'selectionEnabled',
			'selectAllEnabled',
			'wrapCellContent',
		];
		const menuListExternalProps = [
			'listMenuConfigurationId',
			'listId',
			'showListOpenedByLinkSection',
		];
		const relatedListExternalProps = [
			'parentTable',
			'parentRecordSysId',
			'relatedListName',
			'isParentReadOnly',
			'isParentNewRecord',
		];
		if (
			currentListType === 'default' ||
			currentListType === 'simple' ||
			currentListType === 'related'
		) {
			// common amongst these 3 list types since they are all individual lists
			individualListExternalProps.map(function f(prop) {
				args.api.updateProperty(
					{ type: 'externalProp', name: prop },
					{ isVisible: true }
				);
			});
			individualListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: true });
			});
			menuListExternalProps.map(function f(prop) {
				args.api.updateProperty(
					{ type: 'externalProp', name: prop },
					{ isVisible: false }
				);
				updatePropertyWithValue(
					{ type: 'externalProp', name: prop },
					null
				);
			});
			args.api.updateProperty(
				{ type: 'externalProp', name: 'selectedRecords' },
				{ isVisible: true }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'exceptedRecords' },
				{ isVisible: true }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'highlightedValueConfigId' },
				{ isVisible: true }
			);

			// specific to each list type
			switch (currentListType) {
				case 'default':
					relatedListExternalProps.map(function f(prop) {
						args.api.updateProperty(
							{ type: 'externalProp', name: prop },
							{ isVisible: false }
						);
						updatePropertyWithValue(
							{ type: 'externalProp', name: prop },
							null
						);
					});
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						{ isVisible: true }
					);
					args.api.updateProperty(
						{
							type: 'externalProp',
							name: 'enableQuickFormNavigation',
						},
						{ isVisible: !args.externalProperties.nestBy }
					);
					args.api.updateProperty(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						{ isVisible: true }
					);
					// if the user manually changed the list type, the value should update to reflect the new type.
					// if they just refreshed and kept the same type, we should preserve their configs.
					updatePropertyWithValue(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						true
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableQuickFormNavigation',
						},
						!args.externalProperties.nestBy
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						true
					);
					args.api.updateVisibility('list-transform', true);
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableInfiniteScroll' },
						{ isVisible: true }
					);
					args.api.updateProperty(
						{ type: 'externalProp', name: 'liveUpdates' },
						{ isVisible: true }
					);
					break;

				case 'simple':
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableInfiniteScroll' },
						{ isVisible: false }
					);
					args.api.updateProperty(
						{ type: 'externalProp', name: 'liveUpdates' },
						{ isVisible: false }
					);

					relatedListExternalProps.map(function f(prop) {
						args.api.updateProperty(
							{ type: 'externalProp', name: prop },
							{ isVisible: false }
						);
					});
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						{ isVisible: false }
					);
					args.api.updateProperty(
						{
							type: 'externalProp',
							name: 'enableQuickFormNavigation',
						},
						{ isVisible: false }
					);
					args.api.updateProperty(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						{ isVisible: false }
					);

					// Only set values when user manually changes list type, not on bootstrap
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableInfiniteScroll',
						},
						false
					);
					updatePropertyWithValue(
						{ type: 'externalProp', name: 'liveUpdates' },
						'off'
					);
					relatedListExternalProps.map(function f(prop) {
						updatePropertyWithValue(
							{ type: 'externalProp', name: prop },
							null
						);
					});
					updatePropertyWithValue(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableQuickFormNavigation',
						},
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						false
					);
					break;

				case 'related': {
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableInfiniteScroll' },
						{ isVisible: false }
					);
					args.api.updateProperty(
						{ type: 'externalProp', name: 'liveUpdates' },
						{ isVisible: false }
					);

					relatedListExternalProps.map(function f(prop) {
						args.api.updateProperty(
							{ type: 'externalProp', name: prop },
							{ isVisible: true }
						);
					});
					args.api.updateProperty(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						{ isVisible: false }
					);
					args.api.updateProperty(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						{ isVisible: false }
					);

					// Only set values when user manually changes list type, not on bootstrap
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableInfiniteScroll',
						},
						false
					);
					updatePropertyWithValue(
						{ type: 'externalProp', name: 'liveUpdates' },
						'off'
					);
					updatePropertyWithValue(
						{ type: 'externalProp', name: 'enableQuickEdit' },
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enforceViewRulesForQuickForm',
						},
						false
					);
					// related is a hidden type
					// if it is applied through a binding etc, we should unhide it in the choices so that a user can see which type is applied.
					const relatedChoice = {
						label: 'Related',
						value: 'related',
					};
					selectableTypesChoices.push(relatedChoice);
					break;
				}

				default:
					break;
			}
			// Only update column filtering values when user manually changes, not on bootstrap
			switch (columnFilteringPopoverDisplay) {
				case 'allowBoth':
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnFiltering',
						},
						true
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnGrouping',
						},
						true
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'columnFilteringPopoverDisplay',
						},
						''
					);
					break;
				case 'allowOnlyFiltering':
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnFiltering',
						},
						true
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnGrouping',
						},
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'columnFilteringPopoverDisplay',
						},
						''
					);
					break;
				case 'allowOnlyGrouping':
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnFiltering',
						},
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnGrouping',
						},
						true
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'columnFilteringPopoverDisplay',
						},
						''
					);
					break;
				case 'disallowColumnFilteringPopover':
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnFiltering',
						},
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'enableColumnGrouping',
						},
						false
					);
					updatePropertyWithValue(
						{
							type: 'externalProp',
							name: 'columnFilteringPopoverDisplay',
						},
						''
					);
					break;
				default:
					break;
			}

			// STRY59314760 - Backward compatibility: If enableLiveList is true, set liveUpdates to 'manual_refresh' and set enableLiveList to false.
			if (enableLiveList) {
				args.api.updateProperty(
					{ type: 'externalProp', name: 'liveUpdates' },
					{ isVisible: true }
				);
				updatePropertyWithValue(
					{ type: 'externalProp', name: 'liveUpdates' },
					'manual_refresh'
				);
				args.api.updateProperty(
					{ type: 'externalProp', name: 'enableLiveList' },
					{ isVisible: false }
				);
				updatePropertyWithValue(
					{ type: 'externalProp', name: 'enableLiveList' },
					false
				);
			}
		} else if (currentListType === 'withMenu') {
			menuListExternalProps.map(function f(prop) {
				args.api.updateProperty(
					{ type: 'externalProp', name: prop },
					{ isVisible: true }
				);
			});
			individualListExternalProps.map(function f(prop) {
				args.api.updateProperty(
					{ type: 'externalProp', name: prop },
					{ isVisible: false }
				);
			});
			individualListProps.map(function f(prop) {
				args.api.updateProperty(prop, { isVisible: false });
			});
			relatedListExternalProps.map(function f(prop) {
				args.api.updateProperty(
					{ type: 'externalProp', name: prop },
					{ isVisible: false }
				);
			});
			args.api.updateProperty(
				{ type: 'externalProp', name: 'enableQuickEdit' },
				{ isVisible: false }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'enableQuickFormNavigation' },
				{ isVisible: !args.externalProperties.nestBy }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'enforceViewRulesForQuickForm' },
				{ isVisible: true }
			);

			args.api.updateProperty(
				{ type: 'externalProp', name: 'enableInfiniteScroll' },
				{ isVisible: false }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'liveUpdates' },
				{ isVisible: false }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'selectedRecords' },
				{ isVisible: false }
			);
			args.api.updateProperty(
				{ type: 'externalProp', name: 'exceptedRecords' },
				{ isVisible: false }
			);

			// if the user manually changed the list type, the value should update to reflect the new type.
			// if they just refreshed and kept the same type, we should preserve their configs.
			relatedListExternalProps.map(function f(prop) {
				updatePropertyWithValue(
					{ type: 'externalProp', name: prop },
					null
				);
			});
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'enableInfiniteScroll' },
				false
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'liveUpdates' },
				'off'
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'enableQuickFormNavigation' },
				!args.externalProperties.nestBy
			);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enforceViewRulesForQuickForm',
				},
				true
			);
			// if we set these to "null", "null" will display in the field
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'selectedRecords' },
				[]
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'exceptedRecords' },
				[]
			);
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
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'listType',
			},
			{
				typeMetadata: {
					choices: selectableTypesChoices,
				},
				enabled: currentListType !== 'withMenu',
			}
		);
	}

	// hide view when columns set
	if (
		(isExternalTrigger && args.trigger?.name === 'columns') ||
		(isExternalTrigger && args.trigger?.name === 'listType') ||
		isBootstrap
	) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'view',
			},
			{
				isVisible: !args.externalProperties.columns,
			}
		);
		updatePropertyWithValue(
			{
				type: 'externalProp',
				name: 'view',
			},
			!args.externalProperties.columns ? args.externalProperties.view : ''
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'columnPreferenceKey',
			},
			{
				isVisible:
					args.properties.columns ||
					args.externalProperties.listType === 'withMenu',
			}
		);
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'columns',
			args.externalProperties.columns
		);
	}

	// 	--------------------------------------------------
	//   		INFINITE SCROLL START - Connected List
	//  --------------------------------------------------

	function resetLiveUpdates(policyArgs) {
		// If liveUpdates is automatic_refresh and enableInfiniteScroll is false, set liveUpdates to manual_refresh
		if (
			policyArgs.externalProperties.liveUpdates === 'automatic_refresh' &&
			policyArgs.externalProperties.enableInfiniteScroll == false
		) {
			policyArgs.api.updateProperty(
				{ type: 'externalProp', name: 'liveUpdates' },
				{ isVisible: true }
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'liveUpdates' },
				'off'
			);
		}
	}

	function setInfiniteScrollDependencies(policyArgs) {
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'groupBy' },
			{ isVisible: false }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'currentPage' },
			{ isVisible: false }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'enableColumnGrouping' },
			{ isVisible: false }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'allRecordsSelected' },
			{ isVisible: false }
		);

		policyArgs.api.updateProperty('selectAllEnabled', { isVisible: false });
		policyArgs.api.updateProperty('rowDragDropEnabled', {
			isVisible: false,
		});
		policyArgs.api.updateProperty('expandAllGroups', { isVisible: false });
		policyArgs.api.updateProperty('toggleAllGroupsEnabled', {
			isVisible: false,
		});
	}

	function resetInfiniteScrollDependencies(policyArgs) {
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'currentPage' },
			{ isVisible: true }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'groupBy' },
			{ isVisible: true }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'enableLiveList' },
			{ isVisible: true }
		);
		updatePropertyWithValue(
			{ type: 'externalProp', name: 'enableLiveList' },
			false
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'enableColumnGrouping' },
			{ isVisible: true }
		);
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'allRecordsSelected' },
			{ isVisible: true }
		);

		policyArgs.api.updateProperty('selectAllEnabled', { isVisible: true });
		policyArgs.api.updateProperty('rowDragDropEnabled', {
			isVisible: true,
		});
		policyArgs.api.updateProperty('expandAllGroups', { isVisible: true });
		policyArgs.api.updateProperty('toggleAllGroupsEnabled', {
			isVisible: true,
		});

		resetLiveUpdates(policyArgs);
	}

	function setEnableInfiniteScroll(policyArgs, value) {
		policyArgs.api.updateProperty(
			{ type: 'externalProp', name: 'enableInfiniteScroll' },
			{ isVisible: true }
		);
		updatePropertyWithValue(
			{ type: 'externalProp', name: 'enableInfiniteScroll' },
			value
		);
	}

	// On first load, if enableInfiniteScroll is true, set the dependencies.
	if (isBootstrap && args.externalProperties.enableInfiniteScroll == true) {
		setInfiniteScrollDependencies(args);
	}

	if (
		(args.trigger?.type === 'externalProp' &&
			args.trigger?.name == 'enableInfiniteScroll') ||
		args.trigger === 'enableInfiniteScroll'
	) {
		if (args.externalProperties.enableInfiniteScroll == true) {
			setInfiniteScrollDependencies(args);
		} else {
			resetInfiniteScrollDependencies(args);
		}
	}

	// If liveUpdates is set to automatic_refresh then set enableInfiniteScroll to true
	if (
		(args.trigger?.type === 'externalProp' &&
			args.trigger?.name === 'liveUpdates') ||
		args.trigger === 'liveUpdates'
	) {
		if (
			args.externalProperties.liveUpdates === 'automatic_refresh' &&
			args.externalProperties.enableInfiniteScroll == false
		) {
			setEnableInfiniteScroll(args, true);
			setInfiniteScrollDependencies(args);
		}
	}

	// 	--------------------------------------------------
	//        INFINITE SCROLL END - Connected List
	//  --------------------------------------------------

	if (
		(isExternalTrigger && args.trigger?.name === 'table') ||
		(isExternalTrigger && args.trigger?.name === 'listType') ||
		isBootstrap
	) {
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'table',
			args.externalProperties.table
		);
		// Currently there is no way to define the externalProp in the config layout,
		// so we need to set it in the interface metadata and pass it as action meta until UIB supports it.
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'isExternalProp',
			true
		);
	}

	// hide columns and colPrefKey when view set
	if (
		(isExternalTrigger && args.trigger?.name === 'view') ||
		(isExternalTrigger && args.trigger?.name === 'listType') ||
		isBootstrap
	) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'columns',
			},
			{
				isVisible: !args.externalProperties.view,
			}
		);
		updatePropertyWithValue(
			{
				type: 'externalProp',
				name: 'columns',
			},
			!args.externalProperties.view ? args.externalProperties.columns : ''
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'columnPreferenceKey',
			},
			{
				isVisible:
					args.properties.columns ||
					args.externalProperties.listType === 'withMenu',
			}
		);
		args.api.updateInterfaceMetadata(
			'card-field-mapping',
			'view',
			args.externalProperties.view
		);
	}
	// hide all selection props when selection is disabled
	// need to run this when the list type is changed to ensure that the selection props are properly set
	// hidden for simple (selectionEnabled is set to false elsewhere), and using the value of selectionEnabled otherwise
	const enableOnlySingleSelection =
		args.externalProperties.enableOnlySingleSelection;
	if (enableOnlySingleSelection) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'allRecordsSelected',
			},
			{ isVisible: false }
		);
		updatePropertyWithValue(
			{
				type: 'externalProp',
				name: 'allRecordsSelected',
			},
			false
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'selectedRecords',
			},
			{ isVisible: false }
		);
		updatePropertyWithValue(
			{
				type: 'externalProp',
				name: 'selectedRecords',
			},
			[]
		);
	} else {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'allRecordsSelected',
			},
			{ isVisible: true }
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'selectedRecords',
			},
			{ isVisible: true }
		);
	}
	if (args.properties.selectionEnabled === false) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'allRecordsSelected',
			},
			{ isVisible: false }
		);
	}

	if (
		args.trigger === 'selectionEnabled' ||
		(isExternalTrigger && args.trigger?.name === 'listType') ||
		isBootstrap
	) {
		var selectionDependentProps = [
			'selectAllEnabled',
			{
				type: 'externalProp',
				name: 'enableOnlySingleSelection',
			},
			{
				type: 'externalProp',
				name: 'allRecordsSelected',
			},
			{
				type: 'externalProp',
				name: 'onlyEnableSelectionWhenRequiredByActions',
			},
		];
		selectionDependentProps.map(function f(propName) {
			args.api.updateProperty(propName, {
				isVisible: args.properties.selectionEnabled !== false,
			});
		});

		if (args.properties.selectionEnabled === false) {
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'selectedRecords',
				},
				{
					isVisible: false,
				}
			);
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'exceptedRecords',
				},
				{
					isVisible: false,
				}
			);
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'enableCardClickOpen',
				},
				{ isVisible: true }
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'enableOnlySingleSelection' },
				false
			);
		} else {
			if (args.externalProperties.allRecordsSelected == true) {
				args.api.updateProperty(
					{
						type: 'externalProp',
						name: 'selectedRecords',
					},
					{
						isVisible: false,
					}
				);
				args.api.updateProperty(
					{
						type: 'externalProp',
						name: 'exceptedRecords',
					},
					{
						isVisible: true,
					}
				);
			} else {
				args.api.updateProperty(
					{
						type: 'externalProp',
						name: 'selectedRecords',
					},
					{
						isVisible: true,
					}
				);
				args.api.updateProperty(
					{
						type: 'externalProp',
						name: 'exceptedRecords',
					},
					{
						isVisible: false,
					}
				);
			}
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'enableCardClickOpen',
				},
				{ isVisible: false }
			);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enableCardClickOpen',
				},
				false
			);
		}
	}
	// enable reference links dependency
	if (args.trigger === 'clickableTextEnabled' || isBootstrap) {
		// if still bound to the preset (to be true), clickableTextEnabled will evaluate as null, so need to treat binding as true
		const canEditRefLinksProp =
			args.properties.clickableTextEnabled === null ||
			args.properties.clickableTextEnabled === true;
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'enableReferenceLinks',
			},
			{
				isVisible:
					args.externalProperties.listType !== 'withMenu' &&
					canEditRefLinksProp,
			}
		);
	}
	// highlighted values dependency
	if (
		(isExternalTrigger &&
			args.trigger?.name === 'fetchHighlightedValues') ||
		isBootstrap
	) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'highlightedValueConfigId',
			},
			{
				enabled: args.externalProperties.fetchHighlightedValues,
			}
		);
	}
	if (
		(isExternalTrigger && args.trigger?.name === 'enableQuickEdit') ||
		isBootstrap
	) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'enableQuickFormNavigation',
			},
			{
				isVisible:
					!args.externalProperties.nestBy &&
					args.externalProperties.enableQuickEdit,
			}
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'enforceViewRulesForQuickForm',
			},
			{
				isVisible: args.externalProperties.enableQuickEdit,
			}
		);
	}
	if ((isExternalTrigger && args.trigger?.name === 'nestBy') || isBootstrap) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'childrenRowLimit',
			},
			{
				isVisible: args.externalProperties.nestBy,
			}
		);
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'enableBadgeCount',
			},
			{
				isVisible: args.externalProperties.nestBy,
			}
		);
		if (args.externalProperties.nestBy) {
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'enableQuickFormNavigation',
				},
				{
					isVisible: false,
				}
			);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enableQuickFormNavigation',
				},
				false
			);
		} else if (!isBootstrap) {
			args.api.updateProperty(
				{
					type: 'externalProp',
					name: 'enableQuickFormNavigation',
				},
				{
					isVisible: args.externalProperties.enableQuickEdit,
				}
			);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enableQuickFormNavigation',
				},
				true
			);
		}
	}

	const withMenu = args.externalProperties.listType === 'withMenu';

	if (!withMenu) {
		const enableRelatedHierarchyDependentProps = [
			'liveUpdates',
			'nestBy',
			'enableInfiniteScroll',
		];
		if (
			(isExternalTrigger &&
				args.trigger?.name === 'enableRelatedHierarchy') ||
			isBootstrap
		) {
			const enableRelatedHierarchy =
				args.externalProperties.enableRelatedHierarchy === true;
			enableRelatedHierarchyDependentProps.map((prop) =>
				updatePropertyVisibility(prop, !enableRelatedHierarchy)
			);
			updatePropertyVisibility(
				'shadeAlternateRows',
				!enableRelatedHierarchy,
				false
			);
		}

		if (
			(isExternalTrigger &&
				enableRelatedHierarchyDependentProps.includes(
					args.trigger?.name
				)) ||
			isBootstrap
		) {
			const isLiveListTurnedOn =
				args.externalProperties.liveUpdates !== 'off';
			const isInfiniteScrollEnabled =
				args.externalProperties.enableInfiniteScroll === true;
			const nestBy = args.externalProperties.nestBy;
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
		'content-styling',
		'data-organization',
		'selection',
	];
	const galleryOnlySections = [
		'field-visibility-gallery-only',
		'end-user-capabilities-gallery-only',
		'content-styling-gallery-only',
		'data-organization-gallery-only',
		'selection-gallery-only',
	];
	const listOnlySections = [
		'field-visibility-list-only',
		'end-user-capabilities-list-only',
		'content-styling-list-only',
		'data-organization',
		'selection-list-only',
	];

	function updateSectionVisibility(section, isVisible) {
		args.api.updateSection(section, { isVisible });
	}
	function updatePropertyVisibility(name, isVisible, isExternalProp = true) {
		if (isExternalProp) {
			args.api.updateProperty(
				{
					type: 'externalProp',
					name,
				},
				{ isVisible }
			);
		} else {
			args.api.updateProperty(name, { isVisible });
		}
	}
	function updatePropertyEnabledState(
		name,
		isEnabled,
		isExternalProp = true
	) {
		if (isExternalProp) {
			args.api.updateProperty(
				{
					type: 'externalProp',
					name,
				},
				{ enabled: isEnabled }
			);
		}
		args.api.updateProperty(name, { enabled: isEnabled });
	}

	if (
		(isExternalTrigger && args.trigger?.name === 'layouts') ||
		isBootstrap
	) {
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
		updatePropertyVisibility(
			'liveUpdates',
			args.externalProperties.enableRelatedHierarchy !== true
		);
		updatePropertyVisibility('selectAllEnabled', true);

		const layouts = args.externalProperties.layouts;

		if (layouts.includes('list') && layouts.includes('gallery')) {
			commonSections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyVisibility('displayedLayout', true);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'enableOnlySingleSelection' },
				false
			);
		} else if (layouts.includes('list')) {
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'displayedLayout',
				},
				'list'
			);
			listOnlySections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyWithValue(
				{ type: 'externalProp', name: 'enableOnlySingleSelection' },
				false
			);
		} else if (layouts.includes('gallery')) {
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'displayedLayout',
				},
				'gallery'
			);
			galleryOnlySections.map((section) =>
				updateSectionVisibility(section, true)
			);
			updatePropertyVisibility('liveUpdates', false);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'liveUpdates',
				},
				'off'
			);
			updatePropertyVisibility('selectionEnabled', true);
			updatePropertyVisibility('selectAllEnabled', false);
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enableRelatedHierarchy',
				},
				false
			);
		}
	}

	if (
		((isExternalTrigger && args.trigger?.name === 'allRecordsSelected') ||
			isBootstrap) &&
		args.properties.selectionEnabled !== false
	) {
		const allRecordsSelected =
			args.externalProperties.allRecordsSelected === true;
		updatePropertyVisibility('selectedRecords', !allRecordsSelected);
		updatePropertyVisibility('exceptedRecords', allRecordsSelected);
	}

	function updateListCalculationDependenciesState(isEnabled) {
		updatePropertyEnabledState('nestBy', isEnabled);
		updatePropertyEnabledState('enableInfiniteScroll', isEnabled);
		updatePropertyEnabledState('liveUpdates', isEnabled);
	}

	//When the listCalculations prop is enabled, the nestBy, infiniteScroll, and liveUpdates props are hidden (and vice versa).
	if (
		(isExternalTrigger &&
			[
				'liveUpdates',
				'nestBy',
				'enableInfiniteScroll',
				'layouts',
				'listType',
			].includes(args.trigger?.name)) ||
		isBootstrap
	) {
		const isLiveListTurnedOn =
			args.externalProperties.liveUpdates !== 'off';
		const isInfiniteScrollEnabled =
			args.externalProperties.enableInfiniteScroll === true;
		const nestBy = args.externalProperties.nestBy;
		const isGalleryOnlyLayout =
			args.externalProperties.layouts === 'gallery';
		const isMenuListType = args.externalProperties.listType === 'withMenu';
		const shouldEnableListCalculationsProp = !(
			isLiveListTurnedOn ||
			isInfiniteScrollEnabled ||
			nestBy ||
			isGalleryOnlyLayout ||
			isMenuListType
		);
		const isListCalculationsEnabled =
			args.externalProperties.enableColumnCalculations === true;

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

		// If listCalculations should be disabled but is currently enabled, disables it.
		if (!shouldEnableListCalculationsProp && isListCalculationsEnabled) {
			updatePropertyWithValue(
				{
					type: 'externalProp',
					name: 'enableColumnCalculations',
				},
				false
			);

			updateListCalculationDependenciesState(true);
		} else if (isListCalculationsEnabled) {
			updateListCalculationDependenciesState(false);
		}
	}

	if (
		isExternalTrigger &&
		args.trigger?.name === 'enableColumnCalculations'
	) {
		const isListCalculationsEnabled =
			args.externalProperties.enableColumnCalculations === true;
		updateListCalculationDependenciesState(!isListCalculationsEnabled);
	}
}
