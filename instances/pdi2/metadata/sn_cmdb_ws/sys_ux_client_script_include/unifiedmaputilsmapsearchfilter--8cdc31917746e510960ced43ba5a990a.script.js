function include({ imports }) {
    //unifiedMapUtilsMapSearchFilter client script include
    const { generateUniqueId, cloneDeep, ATTRIBUTE, CATEGORY, DELIMITER, SELECT_ALL, ALERT, buildUserPrefWithAppId } = imports['sn_cmdb_ws.unifiedMapUtils']();

    const _PRESETS_USER_PREF_KEY = 'sn_cmdb_ws.unifiedmap.map_search_filter.presets';
    const _SHOW_FILTERED_ITEMS_USER_PREF_KEY = 'sn_cmdb_ws.unifiedmap.map_search_filter.show_filtered_items';
    const _SEARCH_IN_PROGRESS = 'SEARCH_IN_PROGRESS';
    const _CANCELLING_PREVIOUS_SEARCH = 'CANCELLING_PREVIOUS_SEARCH';
    const _RELOAD_MAP = 'RELOAD_MAP';
    const _SHOW_FILTERED_ITEMS_USER_PREF_INITIAL = true;
    const _SYS_PROP = {
        DEFAULT_LEVEL: 'unifiedmap.map_search_filter.default_levels',
        MAX_LEVEL: 'unifiedmap.map_search_filter.max_levels'
    };
    const _EVENTS = {
        EVENT_SYNC: 'SN_UNIFIED_MAP_CTRL#EVENT_SYNC',
        BROKERS_COMPLETED: 'SN_UNIFIED_MAP_CTRL#BROKERS_COMPLETED',
        MAP_DATA_FETCH_COMPLETED: 'SN_UNIFIED_MAP_CTRL#MAP_DATA_FETCH_COMPLETED',
        TRANSLATIONS_COMPLETED: 'SN_UNIFIED_MAP_CTRL#TRANSLATIONS_COMPLETED',
        LOOKUP_SYSTEM_PROPS_COMPLETED: 'SN_UNIFIED_MAP_CTRL#LOOKUP_SYSTEM_PROPS_COMPLETED',
        GET_USER_PREFS_COMPLETED: 'SN_UNIFIED_MAP_CTRL#GET_USER_PREFS_COMPLETED',
        STATE_INITIALIZED: 'SN_UNIFIED_MAP_CTRL#STATE_INITIALIZED',
        USER_PREFS_INITIALIZED: 'SN_UNIFIED_MAP_CTRL#USER_PREFS_INITIALIZED',
        LEVELS_INITIALIZED: 'SN_UNIFIED_MAP_CTRL#LEVELS_INITIALIZED',
        FILTER_INITIALIZED: 'SN_UNIFIED_MAP_CTRL#FILTER_INITIALIZED',
        APPLY_FILTERS: 'SN_UNIFIED_MAP_CTRL#APPLY_FILTERS',
        UPDATE_PAGE_PROPS: 'SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS'
    };
    const _FILTER_PANEL_CONTENT = {
        MAIN: 'main',
        SAVE: 'save',
        UPDATE: 'update',
        DELETE: 'delete',
        MANAGE: 'manage',
        CREATE_USER_OR_SHARED: 'create_user_or_shared',
        UPDATE_USER_OR_SHARED: 'update_user_or_shared',
        DELETE_USER_OR_SHARED: 'delete_user_or_shared'
    };
    const _PRESET_ACTIONS = {
        PROMPT: 'prompt',
        SAVE: _FILTER_PANEL_CONTENT.SAVE,
        UPDATE: _FILTER_PANEL_CONTENT.UPDATE,
        DELETE: _FILTER_PANEL_CONTENT.DELETE,
        MANAGE: _FILTER_PANEL_CONTENT.MANAGE,
        MAIN: _FILTER_PANEL_CONTENT.MAIN
    };
    const _PERF_METRICS = {
        TOTAL_ROUNDTRIP_TIME: "total_roundtrip_time",
        UXF_GETMAP_OUTBOUND_CALL_TIME: "uxf_getmap_outbound_call_time",
        TOTAL_BACKEND_TIME: "total_backend_time",
        SM_GETMAP_API_TIME: "sm_getmap_api_time",
        CMDB_GETMAP_API_TIME: "cmdb_getmap_api_time",
        UXF_GETMAP_INBOUND_RETURN_TIME: "uxf_getmap_inbound_return_time",
        CMDB_FRONTEND_TIME: "cmdb_frontend_time",
        NODEMAP_COMPONENT_RENDERING_TIME: "nodemap_component_rendering_time",
        CMDB_MAP_ONLY: "cmdb_map_only",
        BASE_STATE_TYPE: "base_state_type",
        NUMBER_OF_NODES: "number_of_nodes",
        NUMBER_OF_EDGES: "number_of_edges",
        CI: "ci",
        LEVELS: "levels",
    };
    const _MULTIPLE_BADGE_ICON = 'circle-flag-event-outline';

    const _saveUserPref = (key, obj, api) => {
        if (typeof obj === 'object' && obj !== null) {
            obj = JSON.stringify(obj);
        }

        api.data.saveUserPrefs.execute({
            name: key,
            value: obj
        });
    };

    const _determineDisabledForSharedPresetCUD = (args) => {
        var { presetId, isDirty, isSharedSelected, canManageSharedPreset, managePresetListJson } = args;

        if (canManageSharedPreset) {
            var sharedPresets = managePresetListJson.find(o => o.id === 'sharedPresets').children;

            //NOTE: createSharedPreset is always enabled regardless; so just managing disabled for update and delete
            sharedPresets.find(o => o.id === 'createSharedPreset').disabled = false;

            var updateSharedPreset = sharedPresets.find(o => o.id === 'updateSharedPreset');
            var deleteSharedPreset = sharedPresets.find(o => o.id === 'deleteSharedPreset');

            if (!presetId) {
                updateSharedPreset.disabled = true;
                deleteSharedPreset.disabled = true;
            } else if (!isSharedSelected) {
                updateSharedPreset.disabled = true;
                deleteSharedPreset.disabled = true;
            } else if (!isDirty) {
                updateSharedPreset.disabled = true;
                deleteSharedPreset.disabled = false;
            } else { //we have a preset, it's shared, and it's dirty
                updateSharedPreset.disabled = false;
                deleteSharedPreset.disabled = false;
            }
        } //else user does not have access to CUD of shared presets so okay to leave them enabled since whole shared preset section isn't shown
    };

    const _determineDisabledForUserPresetCUD = (args) => {
        var { presetId, isDirty, isSharedSelected, managePresetListJson } = args;
        var userPresets = managePresetListJson.find(o => o.id === 'userPresets').children;

        //NOTE: createPreset is always enabled regardless; so just managing disabled for update and delete
        userPresets.find(o => o.id === 'createPreset').disabled = false;

        var updatePreset = userPresets.find(o => o.id === 'updatePreset');
        var deletePreset = userPresets.find(o => o.id === 'deletePreset');

        if (!presetId) {
            updatePreset.disabled = true;
            deletePreset.disabled = true;
        } else if (isSharedSelected) {
            updatePreset.disabled = true;
            deletePreset.disabled = true;
        } else if (!isDirty) {
            updatePreset.disabled = true;
            deletePreset.disabled = false;
        } else { //we have a preset, it's a user preset, and it's dirty
            updatePreset.disabled = false;
            deletePreset.disabled = false;
        }
    };

    const _decorateManagePresetListWithDisabledFlag = (args) => {
        _determineDisabledForSharedPresetCUD(args);
        _determineDisabledForUserPresetCUD(args);
    };

    const _getManagePresetListTemplate = (args) => {
        var { canManageSharedPreset, api } = args;
        var template = [{
            id: 'userPresets',
            label: api.state.translations.MANAGE_MY_PRESETS,
            children: [
                {
                    id: 'createPreset',
                    label: api.state.translations.CREATE_PRESET
                },
                {
                    id: 'updatePreset',
                    label: api.state.translations.UPDATE_PRESET
                },
                {
                    id: 'deletePreset',
                    label: api.state.translations.DELETE_PRESET
                }
            ]
        }];

        if (canManageSharedPreset) {
            template.push({
                id: 'sharedPresets',
                label: api.state.translations.MANAGE_SHARED_PRESETS,
                children: [
                    {
                        id: 'createSharedPreset',
                        label: api.state.translations.CREATE_SHARED_PRESET
                    },
                    {
                        id: 'updateSharedPreset',
                        label: api.state.translations.UPDATE_SHARED_PRESET
                    },
                    {
                        id: 'deleteSharedPreset',
                        label: api.state.translations.DELETE_SHARED_PRESET
                    }
                ]
            });
        }

        return template;
    };

    const _setupManagePresetDropdown = (args) => {
        var { api, event } = args;
        if (event.name === 'SN_UNIFIED_MAP_CTRL#MARKER_TIMESTAMP_CHANGED') {
            return;
        }

        var eventHasPreset = !!event.payload?.hasOwnProperty('currentPresetId');
        var presetIdFromPayload = event.payload?.currentPresetId?.toString();
        var presetIdFromProps = api.context.props.presetId;
        var presetId = eventHasPreset ? presetIdFromPayload : presetIdFromProps;

        var isSharedSelected = _getAllPresetsAsList(args).find(o => o.id == presetId)?.shared || false;

        args.presetId = presetId;
        args.isDirty = !presetIdFromPayload;
        args.isSharedSelected = isSharedSelected;

        _setManagePresetState(args);
    };

    const _setManagePresetState = (args) => {
        var {api} = args;
        args.canManageSharedPreset = api.data.getMapDataController.canManageSharedPreset;
        var managePresetListJson = _getManagePresetListTemplate(args);
        args.managePresetListJson = managePresetListJson;
        _decorateManagePresetListWithDisabledFlag(args);
        api.setState('managePresetListJson', managePresetListJson);
    };

    const _saveSharedPreset = (presetObj, api) => {
        var appId = api.context.app.appId;
        var configId = api.data.getMapDataController.configIdentifier;
        var managedPresetRequestObj = Object.assign({
            appId: appId,
            configId: configId
        }, presetObj);
        api.data.manageSharedPreset.execute(managedPresetRequestObj);
    };

    const _getAttributeGroupDefinitions = (api) => {
        var SYS_CLASS_NAME = 'sys_class_name';
        var INTERNAL_ID = 'internal_id';
        var PROPERTIES = 'properties';
        var VALUE = 'value';
        var CITY = 'city';
        return [
            {
                //Class ID and display val in different spots
                partialId: CATEGORY.ATTRIBUTE + DELIMITER + SYS_CLASS_NAME,
                pathToAttrIdAndVal: {
                    pathToId: [PROPERTIES, SYS_CLASS_NAME, VALUE],
                    pathToVal: [ATTRIBUTE.CLASS]
                },
                displayName: api.state.translations.CI_TYPE
            },
            {
                //Discovery source to use internal_id for ID
                partialId: CATEGORY.ATTRIBUTE + DELIMITER + ATTRIBUTE.DISCOVERY_SOURCE,
                pathToAttrIdAndVal: {
                    pathToId: [PROPERTIES, ATTRIBUTE.DISCOVERY_SOURCE, INTERNAL_ID],
                    pathToVal: [PROPERTIES, ATTRIBUTE.DISCOVERY_SOURCE, VALUE]
                },
                displayName: api.state.translations.ATTRIBUTE.DISCOVERY_SOURCE
            },
            {
                //Location to use city for ID; 
                // Eg. '.properties.Location.city' since '.properties.Location.name' is too long and specific for the filter to use
                partialId: CATEGORY.ATTRIBUTE + DELIMITER + ATTRIBUTE.LOCATION,
                pathToAttrIdAndVal: {
                    pathToId: [PROPERTIES, ATTRIBUTE.LOCATION, CITY],
                    pathToVal: [PROPERTIES, ATTRIBUTE.LOCATION, CITY]
                },
                displayName: api.state.translations.ATTRIBUTE.LOCATION
            },
            {
                //Owned by to use value for for ID since the names aren't translated
                partialId: CATEGORY.ATTRIBUTE + DELIMITER + ATTRIBUTE.OWNED_BY,
                pathToAttrIdAndVal: {
                    pathToId: [PROPERTIES, ATTRIBUTE.OWNED_BY, VALUE],
                    pathToVal: [PROPERTIES, ATTRIBUTE.OWNED_BY, VALUE]
                },
                displayName: api.state.translations.ATTRIBUTE.OWNED_BY
            }
        ];
    };

    const _assembleUncheckedFromFilter = (args) => {
		// this function build the unchecked up from the preset first if presetId is passed in
		// Otherwise, it'll just start from an empty array and evaluate the checkboxes
		var { filterControls, presetId } = args;
        var layerIds = Object.values(filterControls.layer);
        var attributes = filterControls.attributes;
        var allPresets = _getAllPresetsAsList({ filterControls });
		var preset = allPresets.find(o => o.id === presetId);
        var unchecked = preset ? cloneDeep(preset.unchecked) : [];

        // All enabled checked values will be removed from the unchecked object in a final pass
        var checkedIds = [];
        layerIds.filter(o => o.name !== SELECT_ALL).forEach(o => {
            if (o.value) {
                checkedIds.push(o.id);
            }
            else if (!unchecked.some(b => b.id === o.id)) {
                unchecked.push({
                    id: o.id
                });
            }
        });

        attributes.forEach(a => {
            a.list.filter(o => o.name !== SELECT_ALL && !o.disabled).forEach(o => {
                if (o.value) {
                    checkedIds.push(o.id);
                }
                else if (!unchecked.some(b => b.id === o.id)) {
                    unchecked.push({
                        id: o.id,
                        displayName: a.header.label + ': ' + o.displayName
                    });
                }
            });
        });

        unchecked = unchecked.filter(o => !checkedIds.includes(o.id));

        return unchecked;
    };

    const _getAllPresetsAsList = (args) => {
        // basically this just removes the outer object house the shared preset objects
        var { filterControls, api } = args;
        var filterControls = filterControls || api.state.filterControls;
        var userPresets = filterControls.presets.list.filter(o => o.id !== 'shared');
        var sharedPresets = filterControls.presets.list.find(o => o.id === 'shared')?.children || [];

        return [...userPresets || [], ...(sharedPresets || [])];
    };

    const _getPresetLabelOfCurrent = (api) => {
        var id = api.context.props.presetId;
        var label = _getAllPresetsAsList({ api }).find(p => p.id == id)?.label;
        return label;
    };

    const _savePreset = (args) => {
        var { isUpdate, api, helpers, isShared } = args;
        var filterControls = cloneDeep(api.state.filterControls);
        var currentPresetId = api.context.props.presetId;
        var id = isUpdate ? currentPresetId : isShared ? null : new Date().getTime().toString();
        var label = api.state.savePresetText;

        //convert current state of filter to a preset and either add a new user preset or update current user preset
        var unchecked = _assembleUncheckedFromFilter({ filterControls, presetId: currentPresetId });

        //everything else will show the filled in star icon after saving a regular preset
        filterControls.matchesPreset = !!id;
        api.setState('filterControls', filterControls);

        if (isShared) {
            var presetRequestObj = {
                presetId: id,
                presetName: label,
                uncheckedFilterList: JSON.stringify(unchecked),
                operation: 'upsert'
            };
            _saveSharedPreset(presetRequestObj, api);
            return;
        }

        var userPresetList = filterControls.presets.list.filter(o => o.id !== 'shared');
        var existingPreset = userPresetList.find(p => p.id === id);
        if (existingPreset) {
            existingPreset.label = label;
            existingPreset.unchecked = unchecked;
        } else {
            var preset = {
                id: id,
                label: label,
                unchecked: unchecked,
                shared: false
            };
            filterControls.presets.list.unshift(preset);
            userPresetList.push(preset);
        }
        var presets = { list: userPresetList };
        var presetKey = buildUserPrefWithAppId([_PRESETS_USER_PREF_KEY], api.context.app.appId);
        _saveUserPref(presetKey[_PRESETS_USER_PREF_KEY], presets, api);

        api.setState('filterControls', filterControls);
        if (currentPresetId != id) {
            api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
                params: { "presetId": id }
            });
        }
        api.setState('labelOfCurrentPreset', label);
        _setManagePresetState({
            api: api,
            presetId: id,
            isDirty: false,
            isSharedSelected: false
        });

        (isUpdate ?

            helpers.translate('Filter preset "{0}" has been updated.', label) :
            helpers.translate('Filter preset "{0}" has been saved.', label))
            .then((translatedText) => {
                var alerts = [{
                    id: new Date().getTime().toString(),
                    status: ALERT.STATUS.INFO,
                    icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
                    content: translatedText,
                    action: { type: ALERT.TYPE.DISMISS }
                }];
                api.emit('SN_UNIFIED_MAP_CTRL#ADD_ALERTS', { alerts: alerts });

                helpers.timing.setTimeout(() => {
                    api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', { alerts: alerts });
                }, 4000);
            });
    }

    const _deletePreset = (args) => {
        var { api, helpers, isShared } = args;
        var presetId = api.context.props.presetId;
        var filterControls = cloneDeep(api.state.filterControls);
        api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
            params: { "presetId": null }
        });
        api.setState('labelOfCurrentPreset', '');

        filterControls.matchesPreset = false;
        api.setState('filterControls', filterControls);
        if (isShared) {
            var presetRequestObj = {
                presetId: presetId,
                operation: 'delete'
            };
            _saveSharedPreset(presetRequestObj, api);
            // Remove shared preset from list, and remove the shared section entirely if this was the last shared preset
            var sharedPresetSection = filterControls.presets.list.find(o => o.id === 'shared');
            sharedPresetSection.children = sharedPresetSection.children.filter(o => o.id !== presetId);
            if (!sharedPresetSection.children.length === 0) {
                filterControls.presets.list = filterControls.presets.list.filter(o => o.id !== 'shared');
            }
        }
        else {
            filterControls.presets.list = filterControls.presets.list.filter(o => o.id !== presetId);
            var presetKey = buildUserPrefWithAppId([_PRESETS_USER_PREF_KEY], api.context.app.appId);
            _saveUserPref(presetKey[_PRESETS_USER_PREF_KEY], filterControls.presets, api);
        }

        helpers.timing.setTimeout(() => {
            api.emit(_EVENTS.APPLY_FILTERS, { 'items': _getProfileFilters(api), 'resetAll': true, 'currentPresetId': null });
        }, 0);

        helpers.translate('Filter preset "{0}" has been deleted.', _getPresetLabelOfCurrent(api))
            .then((translatedText) => {
                var alerts = [{
                    id: new Date().getTime(),
                    status: ALERT.STATUS.INFO,
                    icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
                    content: translatedText,
                    action: { type: ALERT.TYPE.DISMISS }
                }];
                api.emit('SN_UNIFIED_MAP_CTRL#ADD_ALERTS', { alerts: alerts });

                helpers.timing.setTimeout(() => {
                    api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', { alerts: alerts });
                }, 4000);
            });
    };

    const _sortPresetsAndAddSharedProp = (args) => {
        (args.userPresets || [])
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach(o => o.shared = false);

        (args.sharedpresets || [])
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach(o => o.shared = true);
    };

    const _assemblePresetListJson = (args) => {
        var { userPresets = [], sharedPresets = [], api } = args;
        var presets = [];

        presets.push(...userPresets.map(o => { o.shared = false; return o; }));
        if (sharedPresets.length) {
            presets.push({
                id: 'shared',
                label: api.state.translations.SHARED_PRESETS,
                children: sharedPresets.map(o => { o.shared = true; return o; })
            });
        }

        return presets;
    };

    const _applyPreset = (args) => {
        var { id, preset, filterControls, api, helpers } = args;
        var id = id || preset.id;
        var filterControls = filterControls || cloneDeep(api.state.filterControls);
        var preset = preset || _getAllPresetsAsList({ api, filterControls }).find(o => o.id == id) || { id: null, unchecked: [] }; //null works for updating URL

        if (preset.id) {
            //handles just a standard switch to another preset (that's not the unselected state)
            filterControls.matchesPreset = api.state.disableReloadButton ? filterControls.matchesPreset : true;
        } else { //null means clear the dropdown (check everything) and set selected value back to ...Select
            filterControls.matchesPreset = false;
            filterControls.unused = []; //clear the unused filters since user wants to show everything
        }
        api.emit('SN_UNIFIED_MAP_CTRL#UPDATE_PAGE_PROPS', {
            params: { "presetId": preset.id }
        });
        api.setState('labelOfCurrentPreset', preset.label);
        api.setState('filterControls', filterControls);

        //using the supplied preset id, update the filter control checkboxes by calling applyFilter api
        var unchecked = preset.unchecked.reduce((acc, o) => {
            var attr = { id: o.id, value: false };
            //define and save displayName since an attribute value or relationship type filter may no exist on map and we'll need it for unused attributes section
            //Eg. "Linux Server" may not be on the map or "Hosted on::Hosts" relationship may not be on the map
            if (attr.id !== CATEGORY.SHOW_FILTERED_ITEMS && attr.id.split(DELIMITER)[0] !== CATEGORY.LAYER) {
                attr.displayName = o.displayName;
            }
            acc.push(attr);
            return acc;
        }, []);

        helpers.timing.setTimeout(() => {
            api.emit(_EVENTS.APPLY_FILTERS, { 'items': unchecked, 'resetAll': true, 'currentPresetId': preset.id });
        }, 0);
    };

    const _getProfileFilters = (api) => {
        var profileData = api.data.getMapDataController?.profileData;
        var newProfileLayers = {};
        if (profileData && Object.keys(profileData).length) {
            newProfileLayers = Object.values(profileData).pop()?.layers;
        }

        //assemble list of items to filter
        var layers = cloneDeep(api.state.filterControls.layer);
        var items = Object.keys(newProfileLayers).reduce((acc, profileLayer) => {
            var layerObj = layers[Object.keys(layers).find(layer => layers[layer].key === profileLayer)];
            acc.push({
                id: layerObj.id,
                value: newProfileLayers[profileLayer]
            });
            return acc;
        }, []);

        return items;
    };

    const _applyProfile = (api) => {
        // apply profile; we only care about false values as everything is checked/true by default on map load
        api.emit('SN_UNIFIED_MAP_CTRL#APPLY_FILTERS', { 'items': _getProfileFilters(api), 'resetAll': true });

        //set active nodes; loads with all nodes and later in the pipeline the filter may further filter this down afterwards
        var filterOutput = cloneDeep(api.state.filterOutput);
        filterOutput.activeNodes = Object.keys(api.data.getMapDataController.ciData);
        api.setState('filterOutput', filterOutput);
    };

    const _setSharedPresets = (args) => {
        var { filterControls, api } = args;
        var userPresets = filterControls?.presets?.list?.filter(o => !o.children) || [];
        var sharedPresets = cloneDeep(api.data.getMapDataController.rawData?.sharedPresets?.list);
        if (!sharedPresets || !sharedPresets.length) {
            sharedPresets = [];
        }
        _sortPresetsAndAddSharedProp({ userPresets, sharedPresets });
        filterControls.presets.list = _assemblePresetListJson({ userPresets, sharedPresets, api });
    };

    const _getPresetIdInProfile = (api) => {
        var presetIdInProfile;
        var profileData = api.data.getMapDataController?.profileData;
        var profileClasses = Object.keys(profileData);
        if (profileClasses && profileClasses.length) {
            var profileClass = profileClasses[0]; //only supports 1 matching class
            presetIdInProfile = profileData[profileClass]?.sharedPresetId;
        }
        return presetIdInProfile;
    };

    const _applyProfileOrPresetOrCurrentFilters = (args) => {
        /* Presets are the saved settings of the filter checkboxes saved in either the user prefs OR in a shared preset.
			Profile are like a default preset that only applies to the layer part of the filter (and map layout/orientation) for certain classes.
			However profiles also have a ref field to shared presets, so a profile an include a shared preset in which case it wins out over the profile for the layers portion.
			Additionally, a user defined preset wins out over a shared preset defined in the profile since it's explicity defined by the user.
			Finally, in cases where the user has deviated from the page load state of a preset or profile,
			that existing/current state will win out if the levels are changed or if the map reload is invoked.
				So the precedence order is:
					1) existing changes
					2) UserPreset,
					3) SharedPreset,
					4) SharedPreset defined in a matching profile,
					5) layers in a matching profile
					6) nothing unchecked
        */
        var { uncheckedToBeReAppliedWithPills, uncheckedToBeReAppliedWithoutPills, filterControls, api, helpers } = args;
        var presetId = api.context.props.presetId;
        var presetIdInProfile = _getPresetIdInProfile(api);

		if (uncheckedToBeReAppliedWithPills.length || uncheckedToBeReAppliedWithoutPills.length) {
			if (uncheckedToBeReAppliedWithPills.length) {
				helpers.timing.setTimeout(() => {
					api.emit(_EVENTS.APPLY_FILTERS, { 'items': uncheckedToBeReAppliedWithPills, 'resetAll': true });
				}, 0);
			}
			if (uncheckedToBeReAppliedWithoutPills.length) {
				helpers.timing.setTimeout(() => {
					api.emit(_EVENTS.APPLY_FILTERS, {
						items: uncheckedToBeReAppliedWithoutPills,
						resetAll: !uncheckedToBeReAppliedWithPills.length,
						discardUnused: true
					});
				}, 0);
			}
		} else if (presetId || presetIdInProfile) {
            _applyPreset({ id: (presetId || presetIdInProfile), filterControls, api, helpers })
        } else {
            api.setState('labelOfCurrentPreset', '');
            _applyProfile(api);
        }
    };

    const _capturePerfMetrics = (args) => {
        var nowInMs = Date.now();
        var { perfMetrics, captures, persist, timestamp, api, helpers } = args;
        perfMetrics = cloneDeep(perfMetrics);

        //addTimestamps
        captures.forEach(c => {
            var metric = perfMetrics[c.metricToCapture];
            metric[c.isStartTime ? 'start' : 'end'] = timestamp || nowInMs;

            if (!c.isStartTime) {
                //calculate duration if end time
                metric.duration = metric.end - metric.start; //subtracting ms
            }
        });

        //calculate any missing durations (eg. from uxf_getmap_inbound_return_time)
        Object.values(perfMetrics).filter(v => typeof v === 'object' && v !== null && v.start && v.end && !v.duration).forEach(o => {
            o.duration = o.end - o.start;
        });

        _persistPerfMetrics(perfMetrics, persist, api, helpers);

        api.setState('perfMetrics', perfMetrics); //NOTE: this setState will start off by setting state in getMapDataController, but will set a new copied stete in mapSearchFilterController after that
    };

    const _persistPerfMetrics = (perfMetrics, persist, api, helpers) => {
        if (persist) {
            if (api.state.metricsTimeoutId) {
                helpers.timing.clearTimeout(api.state.metricsTimeoutId)
            }

            //get browser version; this may get blocked later since window object is in exlusion list and this is a hack workaround
            var browser;
            try {
                browser = (() => { }).constructor('return this')()?.navigator?.userAgent || '';
            } catch (err) {
                browser = '';
            }

            const metricsTimeoutId = helpers.timing.setTimeout(() => {
                const { getConnections, logToConsole } = imports["sn_cmdb_ws.unifiedMapUtils"]();
                var metrics = {
                    app_id: api.context.app.appId,
                    browser: api.context.props.browser || browser || 'not provided',
                    ci_name: api.data.getMapDataController?.ciData?.[api.state.rootNode]?.Name || "",
                    ci_sysid: api.state.rootNode,
                    cmdb_map_only: !api.state.secondaryControllers?.length || 0,
                    base_state_type: perfMetrics.base_state_type,
                    levels: api.context.props.levels,
                    number_of_edges: api.data.getMapDataController?.ciData ? getConnections(api.data.getMapDataController.ciData).length : 0,
                    number_of_nodes: api.data.getMapDataController?.ciData ? Object.keys(api.data.getMapDataController.ciData).length : 0,
                    start_time: perfMetrics.total_roundtrip_time.start,
                    uxf_getmap_outbound_call_time: perfMetrics.uxf_getmap_outbound_call_time.duration,
                    cmdb_getmap_api_time: perfMetrics.cmdb_getmap_api_time, //backend calcultes and returns just the duration here
                    sm_getmap_api_time: perfMetrics.sm_getmap_api_time, //backend calcultes and returns just the duration here
                    total_backend_time: perfMetrics.total_backend_time.duration,
                    uxf_getmap_inbound_return_time: perfMetrics.uxf_getmap_inbound_return_time.duration,
                    cmdb_frontend_time: perfMetrics.cmdb_frontend_time.duration,
                    nodemap_component_rendering_time: perfMetrics.nodemap_component_rendering_time.duration,
                    total_roundtrip_time: perfMetrics.total_roundtrip_time.duration
                };
                try {
                    api.data.capture_performance_metrics.execute({ metrics });
                }
                catch (error) {
                    logToConsole('Failed to store metrics: ' + JSON.stringify(error));
                }

                logToConsole('capturing performance metrics... \n' + JSON.stringify(metrics, null, 4));
                api.setState('metricsTimeoutId', null);
                api.setState('perfMetrics', { base_state_type: 'page_refresh' }); //reset for next search or page refresh since there's perfLogging logic that looks to see if fields in here are populated
            }, 3000);

            api.setState('metricsTimeoutId', metricsTimeoutId);
        }
    };

    const _getEdgePropsToAlterForEditMode = (api) => {
        return [
            { name: 'tooltipContent', value: api.state.translations.EDITING_VIRTUAL_AND_REFERENCE_CONNECTION_TYPES_NOT_SUPPORTED }
        ];
    };

    const _buildAlertObjList = (api, messages) => {
        var alerts = messages.reduce((acc, msg, msgIdx) => {
            acc.push({
                id: msg.id || generateUniqueId(),
                status: msg?.uiMessage?.severity || msg.severity || ALERT.STATUS.CRITICAL,
                icon: msg?.uiMessage?.icon ?? msg?.icon ?? ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
                content: msg?.uiMessage?.message || msg.message,
                header: msg?.uiMessage?.header || msg.header || '',
                action: { type: ALERT.TYPE.DISMISS },
                autoDismiss: msg.autoDismiss
            });
            return acc;
        }, []);

        return alerts;
    };

    const _resetReloadButtonState = (api, helpers) => {
        if (api.state.disableReloadButton) {
            api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', {
                alerts: api.state.alerts.length ? api.state.alerts : [{ id: _RELOAD_MAP }]
            });
            //re-enable the reload button
            api.setState("disableReloadButton", false);
        }
    };

    const _setIsPageLoadFalse = (api, helpers) => {
        if (api.state.initialPageLoad) {
            helpers.timing.setTimeout(() => {
                api.setState('initialPageLoad', false);
            }, 0);
        }
    };

    const _setContextMenus = (config, api) => {
        var contextMenu = cloneDeep(api.state.contextMenu);

        if (config.editMode) {
            //nodes
            contextMenu.items = [
                {
                    id: 'remove',
                    label: api.state.translations.REMOVE,
                    type: "node",
                    behavior: "default"
                },
                {
                    id: 'connectTo',
                    label: api.state.translations.CONNECT_TO,
                    type: "node",
                    behavior: "default"
                }
            ];
            contextMenu.disableHome = true;

            //edges
            contextMenu.items.push(
                {
                    id: 'changeConnectionType',
                    label: api.state.translations.CHANGE_CONNECTION,
                    type: 'edge',
                    behavior: 'default'
                },
                {
                    id: 'removeConnection',
                    label: api.state.translations.DELETE_CONNECTION,
                    type: 'edge',
                    behavior: 'default'
                }
            );
        } else {
            contextMenu.items = [];
            contextMenu.disableHome = false;
        }

        api.setState('contextMenu', contextMenu);
    };

    const _getEditModeNodemapBtnConfig = (api) => {
        return [
            {
                id: "btnZoomIn",
                tooltipContent: "Zoom in",
                icon: "plus-outline",
                behavior: "zoom-in"
            },
            {
                id: "btnZoomOut",
                tooltipContent: "Zoom out",
                icon: "minus-outline",
                behavior: "zoom-out"
            },
            {
                id: "btnAlignToHomeNode",
                tooltipContent: "Align to home node",
                icon: "home-outline",
                separator: true,
                behavior: "align-home-node"
            },
            {
                id: "btnFitToScreen",
                tooltipContent: "Fit to screen",
                icon: "collapse-outline",
                behavior: "fit-to-screen"
            },
            {
                id: "btnExportMap",
                tooltipContent: "Export map",
                icon: "circle-download-outline",
                behavior: "export",
                hidden: true
            },
            {
                id: "btnCollapseAll",
                tooltipContent: "Collapse all",
                icon: "sync-outline",
                behavior: "collapse-all"
            },
            {
                id: "btnLayoutUnifiedVertical",
                tooltipContent: "Switch to unified vertical layout",
                icon: "tree-outline",
                separator: true,
                behavior: "change-layout-vertical",
                hidden: true
            },
            {
                id: "btnLayoutUnifiedForce",
                tooltipContent: "Switch to unified force layout",
                icon: "combine-outline",
                behavior: "change-layout-force",
                hidden: true
            }
        ];
    };

    const _resetEditModeStates = (api) => {
        api.setState('editModeManageConnections', {
            nodes: [],
            buttonLabel: api.state.translations.CREATE_CONNECTION,
            selectedRelType: null,
            selectedSourceCi: null,
            selectedTargetCi: null,
        });
        api.setState('editModeManageConnectionsSnapshot', null);
        api.setState('editModeManageConnectionsIsDirty', false);
        api.setState('editModeHistory', []);
        api.setState('mapEditsPersisted', false);
        api.setState('editModeToolbar', { saveDisabled: true });
    };

    const _isEdgeEditable = (edge) => {
        return !edge.isReference &&
            !edge.isVirtualConnection &&
            !edge.isServiceMapping &&
            !edge.endpoints?.length;
    };

    const _findAllNodesConnectedToRoot = (remainingEdgeIds, allEdges, api) => {
        // Converts an edgelist to an adjacency list representation
        var convert_edgelist_to_adjlist = function (edgelist) {
            var adjlist = {};
            var i, len, pair, u, v;
            for (i = 0, len = edgelist.length; i < len; i += 1) {
                pair = edgelist[i];
                u = pair[0];
                v = pair[1];
                if (adjlist[u]) {
                    // append vertex v to edgelist of vertex u
                    adjlist[u].push(v);
                } else {
                    // vertex u is not in adjlist, create new adjacency list for it
                    adjlist[u] = [v];
                }
                if (adjlist[v]) {
                    adjlist[v].push(u);
                } else {
                    adjlist[v] = [u];
                }
            }
            return adjlist;
        };

        // Breadth First Search using adjacency list
        var bfs = function (v, adjlist, visited) {
            var q = [];
            var current_group = [];
            var i, len, adjV, nextVertex;
            q.push(v);
            visited[v] = true;
            while (q.length > 0) {
                v = q.shift();
                current_group.push(v);
                // Go through adjacency list of vertex v, and push any unvisited
                // vertex onto the queue.
                // This is more efficient than our earlier approach of going
                // through an edge list.
                adjV = adjlist[v];
                for (i = 0, len = adjV.length; i < len; i += 1) {
                    nextVertex = adjV[i];
                    if (!visited[nextVertex]) {
                        q.push(nextVertex);
                        visited[nextVertex] = true;
                    }
                }
            }
            return current_group;
        };

        // var pairs = 
        // [
        //     ["a2", "a5"],
        //     ["a3", "a6"],
        //     ["a4", "a5"],
        //     ["a7", "a9"]
        // ];
        var pairs = allEdges.filter(e => remainingEdgeIds.includes(e.id)).map(e => [e.sourceId, e.targetId]);

        var groups = [];
        var visited = {};
        var v;

        // this should look like:
        // {
        //   "a2": ["a5"],
        //   "a3": ["a6"],
        //   "a4": ["a5"],
        //   "a5": ["a2", "a4"],
        //   "a6": ["a3"],
        //   "a7": ["a9"],
        //   "a9": ["a7"]
        // }
        var adjlist = convert_edgelist_to_adjlist(pairs);

        for (v in adjlist) {
            if (adjlist.hasOwnProperty(v) && !visited[v]) {
                groups.push(bfs(v, adjlist, visited));
            }
        }

        return groups.find(g => g.includes(api.state.rootNode)) || [];
    };

    const _findAllOrphanedNodes = (remainingEdgeIds, allEdges, allNodes, api) => {
        var nodeIdsConnectedToRoot = _findAllNodesConnectedToRoot(remainingEdgeIds, allEdges, api);
        var orphanedNodeIds = allNodes.filter(sysid => !nodeIdsConnectedToRoot.includes(sysid) && sysid !== api.state.rootNode);
        return orphanedNodeIds;
    };

    const _findAndHideAllConnections = (nodesToHide, edgesToHide, ciData) => {
        edgesToHide.push(...Object.keys(ciData).reduce((a, sysid) => {
            if (nodesToHide.includes(sysid)) {
                //hide all connections if the current node is one being hidden
                a.push(...ciData[sysid].connections.map(o => o.id));
                return a;
            } else { //just hide connections that are tied to the hidden node
                a.push(...ciData[sysid].connections.reduce((acc, c) => nodesToHide.includes(c.sourceId) || nodesToHide.includes(c.targetId) ? [...acc, c.id] : acc, []));
                return a;
            }
        }, []));
    };

    const _setEditModeManageConnections = (obj, api, captureSnapshot) => {
        //only sets what's passed in
        var editModeManageConnections = cloneDeep(api.state.editModeManageConnections);
        editModeManageConnections.selectedSourceCi = typeof obj.selectedSourceCi === 'undefined' ? editModeManageConnections.selectedSourceCi : obj.selectedSourceCi;
        editModeManageConnections.selectedTargetCi = typeof obj.selectedTargetCi === 'undefined' ? editModeManageConnections.selectedTargetCi : obj.selectedTargetCi;
        editModeManageConnections.selectedRelType = typeof obj.selectedRelType === 'undefined' ? editModeManageConnections.selectedRelType : obj.selectedRelType;
        editModeManageConnections.buttonLabel = typeof obj.buttonLabel === 'undefined' ? editModeManageConnections.buttonLabel : obj.buttonLabel;
        editModeManageConnections.nodes = !obj?.nodes?.length ? editModeManageConnections.nodes : obj.nodes;
        api.setState('editModeManageConnections', editModeManageConnections);
        api.setState('disableEditConnectionRelTypes', !editModeManageConnections.selectedSourceCi || !editModeManageConnections.selectedTargetCi);

        //this is used for the isDirty flag to enable/disable the Change button
        if (captureSnapshot) {
            api.setState('editModeManageConnectionsSnapshot', JSON.stringify({
                selectedSourceCi: editModeManageConnections.selectedSourceCi,
                selectedTargetCi: editModeManageConnections.selectedTargetCi,
                selectedRelType: editModeManageConnections.selectedRelType
            }));
        }
    };

    const _buildEditModeConnectionList = (api, showSuggestedRels) => {
        var allTypes = api.data.get_ci_relationship_types.output.items;
        var suggestedRelDataOutput = api.data.get_ci_suggested_relationships.output;
        var suggestedTypes = suggestedRelDataOutput.suggestedRelationships;
        var suggestedTypeErrors = suggestedRelDataOutput.errors;


        if (showSuggestedRels && suggestedTypeErrors && suggestedTypeErrors.length) {
            suggestedTypeErrors.forEach(suggestedTypeError => {
                console.log(suggestedTypeError);
            });
        }

        if (showSuggestedRels && suggestedTypes && suggestedTypes.length) {
            const suggestedItemsIndex = 0;
            const allItemsIndex = 1;
            var dropdownItems = [
                {
                    id: "suggestedRelationships",
                    label: api.state.translations.SUGGESTED_RELATIONSHIPS,
                    children: []
                },
                {
                    id: "allRelationships",
                    label: api.state.translations.ALL_RELATIONSHIPS,
                    children: []
                },
            ];
            allTypes.forEach(relType => {
                if (suggestedTypes.indexOf(relType.sys_id) >= 0) {
                    dropdownItems[suggestedItemsIndex].children.push(relType);
                }
                else {
                    dropdownItems[allItemsIndex].children.push(relType);
                }
            });
            return dropdownItems;
        }
        return allTypes;
    };

    return {
        SEARCH_IN_PROGRESS: _SEARCH_IN_PROGRESS,
        CANCELLING_PREVIOUS_SEARCH: _CANCELLING_PREVIOUS_SEARCH,
        RELOAD_MAP: _RELOAD_MAP,
        SHOW_FILTERED_ITEMS_USER_PREF_KEY: _SHOW_FILTERED_ITEMS_USER_PREF_KEY,
        SHOW_FILTERED_ITEMS_USER_PREF_INITIAL: _SHOW_FILTERED_ITEMS_USER_PREF_INITIAL,
        PRESETS_USER_PREF_KEY: _PRESETS_USER_PREF_KEY,
        PRESET: _PRESET,
        SYS_PROP: _SYS_PROP,
        EVENTS: _EVENTS,
        FILTER_PANEL_CONTENT: _FILTER_PANEL_CONTENT,
        PRESET_ACTIONS: _PRESET_ACTIONS,
        PERF_METRICS: _PERF_METRICS,
        MULTIPLE_BADGE_ICON: _MULTIPLE_BADGE_ICON,

        applyPreset: _applyPreset,
        setupManagePresetDropdown: _setupManagePresetDropdown,
        setManagePresetState: _setManagePresetState,
        assemblePresetListJson: _assemblePresetListJson,
        deletePreset: _deletePreset,
        savePreset: _savePreset,
        saveUserPref: _saveUserPref,
        getAttributeGroupDefinitions: _getAttributeGroupDefinitions,
        getAllPresetsAsList: _getAllPresetsAsList,
        getPresetLabelOfCurrent: _getPresetLabelOfCurrent,
        setSharedPresets: _setSharedPresets,
        assembleUncheckedFromFilter: _assembleUncheckedFromFilter,
        applyProfile: _applyProfile,
        applyProfileOrPresetOrCurrentFilters: _applyProfileOrPresetOrCurrentFilters,
        getEditModeNodemapBtnConfig: _getEditModeNodemapBtnConfig,
        setEditModeManageConnections: _setEditModeManageConnections,
        getEdgePropsToAlterForEditMode: _getEdgePropsToAlterForEditMode,
        isEdgeEditable: _isEdgeEditable,
        capturePerfMetrics: _capturePerfMetrics,
        buildAlertObjList: _buildAlertObjList,
        resetReloadButtonState: _resetReloadButtonState,
        resetEditModeStates: _resetEditModeStates,
        setIsPageLoadFalse: _setIsPageLoadFalse,
        setContextMenus: _setContextMenus,
        findAllNodesConnectedToRoot: _findAllNodesConnectedToRoot,
        findAllOrphanedNodes: _findAllOrphanedNodes,
        findAndHideAllConnections: _findAndHideAllConnections,
        buildEditModeConnectionList: _buildEditModeConnectionList
    };
}
