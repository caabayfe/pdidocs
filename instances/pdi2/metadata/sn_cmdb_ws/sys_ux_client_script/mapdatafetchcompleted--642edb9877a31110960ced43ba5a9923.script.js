function script({ api, event, helpers, imports }) {
    // mapDataFetchCompleted in Map Search Filter UI Controller; fired after STATE_INITIALIZED event fired which occurs only after 
    // 1) all brokers complete and 2) all states are initialized
    const { getConnections, cloneDeep, CATEGORY, DELIMITER, addAlerts, removeAlerts, getHash, SELECT_ALL } = imports['sn_cmdb_ws.unifiedMapUtils']();
    const { getAllPresetsAsList, assembleUncheckedFromFilter, setSharedPresets, applyProfileOrPresetOrCurrentFilters, buildAlertObjList, setIsPageLoadFalse, getAttributeGroupDefinitions } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

    var ciData = api.data.getMapDataController.ciData;
    var rootNode = api.context.props.ciSysid;
    var isNewCiSearch = api.state.initialPageLoad || api.state.rootNode !== rootNode;
    api.setState('rootNode', rootNode);
    var filterControls = cloneDeep(api.state.filterControls); //clone filterControls before using it
    var sysidsMinusRoot = Object.keys(ciData).filter(sysid => sysid !== rootNode);
    var uncheckedToBeReAppliedWithPills = []; //used to retain current state of unchecked filter values if levels are changed (or map reload issued)
    var uncheckedToBeReAppliedWithoutPills = []; //same but without pills if these unchecked fitlers don't exist

    var postFetch = {

        init: function () {
            this.manageAlerts();
            this.assembleNodesAndEdges();
            this.setupFilterPanelCheckboxes();
            setSharedPresets({ filterControls, api });
            applyProfileOrPresetOrCurrentFilters({ uncheckedToBeReAppliedWithPills, uncheckedToBeReAppliedWithoutPills, filterControls, api, helpers });
            this.setSelectedNode();
            api.setState('filterControls', filterControls);
            this.validateSearchText();
            setIsPageLoadFalse(api, helpers); //initialized as true upon page load
        },

        manageAlerts: function () {
            const { messages } = api.data.getMapDataController;
            
            removeAlerts(api.state.alerts, api);
            api.setState('searchAlertIsHidden', true);
            api.setState('searchAlertTimeoutId', null);
            api.setState('searchInProgress', false);
            
            //show any other messages
            if (messages?.length) {
                var alerts = buildAlertObjList(api, messages);
                helpers.timing.setTimeout(() => {
                    addAlerts(alerts, api, helpers);
                }, 800); //adds a brief pause after removing the "search in progress..." and replacing it with other info messages
            }
        },

        setupFilterPanelCheckboxes: function () {
            this.captureCurrentlyUncheckedFilterCheckboxes();
            this.assembleFilterCheckboxesForAttributes();
            this.assembleFilterCheckboxesForRelTypes();
            this.sortCategoriesInTheFilter();
            this.setShowFilteredItemsId();
        },

        assembleNodesAndEdges: function () {
            var nodes = this._getMapNodes(ciData);
            var connections = getConnections(ciData);
            nodes = this.populateRelatedItemValuesFromCache(nodes);
            api.setState('nodes', nodes);
            api.setState('edges', connections);
            helpers.timing.setTimeout(() => { //setTimeout will give a little more time for remaining filter logic to finish processing before notifying listeners
                api.emit('SN_UNIFIED_MAP_CTRL#NODES_AND_EDGES_SET', {
                    nodes: nodes,
                    edges: connections
                });
            }, 0);
            //This is the state that will be used by the related items controller as input property to refresh the badging information for all the nodes on the map
            //We are using object here and adding a timestamp to ensure the macroponent property change event on related items controller is triggered consistently
            api.setState('allNodesObject',{nodes: nodes, timestamp: Date.now()});

            api.setState('originalNodes',cloneDeep(nodes));
            api.setState('originalEdges', cloneDeep(connections));
            api.setState('originalCiData', cloneDeep(ciData));
        },

        _getMapNodes: function (ciData) {
            var nodeMapNodes = Object.keys(ciData).filter((sysid) => !!ciData[sysid].Class).map((sysid) => {
                let node = ciData[sysid];
                let mapNode = {
                    id: sysid,
                    isInactive: false, //presets might override this afterwards
                    viewData: {
                        primaryLabel: node.Name,
                        secondaryLabel: node.Class,
                        icon: node.icon
                    },
                    ...node.isGroup !== undefined && { isGroup: node.isGroup },
                    ...node.groupIds !== undefined && node.groupIds.length && { groupIds: node.groupIds }
                };

                //only intended for root node and above/parents (for vertical layout nodemap accommodation)
                if (node.hasOwnProperty('fixedLayer')) {
                    mapNode.fixedLayer = node.fixedLayer;
                }

                return mapNode;
            });

            return nodeMapNodes;
        },

        captureCurrentlyUncheckedFilterCheckboxes: function() {
            if (isNewCiSearch) {
                //only want to capture if user has had opportunity to change after page load
                // (E.g levels where just changed so a new map has been returned, but filter may already have unchecked items)
                return;
            }

            /*
                Basically, we want to capture two different lists:
                    1) unchecked values that originated from the preset along with any of its unused fitlers (shown as pills), and
                    2) unchecked values that the user manually unchecked (not part of the preset)
                    NOTE: filters that were unchecked from the preset that the use then went ahead and checked, will carry forward
                    since the checkboxes start as checked and there will not be any unchecked items capture to change that.
                Key difference is that we only want unused filter pills for the presets unchecked items and not the ones the user unchecked manually.
            */
            var currentlyUnchecked = assembleUncheckedFromFilter( { filterControls });
            var presetUnused = [...(filterControls.unused || [])];

            //now determine which of the currently unchecked are:
            // 1) part of the preset (remainingPresetUnchecked) and
            // 2) the one's the user manually unchecked and not part of the preset (uncheckedToBeReAppliedWithoutPills)
            var presetUnchecked = [];
            var presetId = api.context.props.presetId;
            if (presetId) {
                var allPresets = getAllPresetsAsList({ filterControls });
                var preset = allPresets.find(o => o.id === presetId);
                if (preset) {
                    presetUnchecked.push(...preset.unchecked);
                }
            }
            var remainingPresetUnchecked = [];
            currentlyUnchecked.forEach(cu => {
                if (presetUnchecked.find(pu => pu.id === cu.id)) {
                    remainingPresetUnchecked.push(cu);
                } else { //unchecked but not part of the preset
                    uncheckedToBeReAppliedWithoutPills.push(cu);
                }
            });

            //combine the presetUnused with the remainingPresetUnchecked; these will get re-applied and get pills if they don't exist
            uncheckedToBeReAppliedWithPills.push(...remainingPresetUnchecked, ...presetUnused);
        },

        assembleFilterCheckboxesForAttributes: function () {
            var attributeGroups = getAttributeGroupDefinitions(api);
            var attributes = [];
            var idAndValList;
            var valForNone = api.state.translations.NONE;
            var idForNone = '';

            //using the group data, first get unique attribute values, then sort, then map to object with values for UI
            attributeGroups.forEach(group => {
                //starting with ciData[sysid] object, start checking the property names to it recursively to find to the attribute
                // so for example, either go to 1) ciData[sysid].properties.sys_class_name.value or 2) ciData[sysid].properties.location.city.
                // 2) requires further drill down into the ciData object so an array reducer works nicely here to accommodate both paths (since pathToAttribute is an array).
                // if the value is an empty string, use default display value (eg. "None")
                var ids = [];
                idAndValList = sysidsMinusRoot.reduce((acc1, sysid) => {
                    //using the current group defined above,
                    //	drill down into the target ci object for each property name defined in the path array to locate the value and id for this filter group
                    var id = group.pathToAttrIdAndVal.pathToId.reduce((acc2, prop) => acc2[prop], ciData[sysid]) || idForNone;
                    if (!ids.includes(id)) { //exclude dupes
                        ids.push(id);
                        acc1.push({
                            id: id,
                            val: group.pathToAttrIdAndVal.pathToVal.reduce((acc3, prop) => acc3[prop], ciData[sysid]) || valForNone
                        });
                    }
                    return acc1;
                }, []);

                //find disabled checkboxes;
                // this will be where there's only 1 value for the attribute and it's a value of the root node
                // eg. the root node is the only class of type "HA Proxy"
                // using the values collected from previous step, see if the root nodes exists exclusively within those values
                // eg. ['Disk', 'Linux Server', 'Linux Server'] so in this small dataset, just 'Disk' would be evaluated to see if it's only the root node with this value
                var idOfRootValue = group.pathToAttrIdAndVal.pathToId.reduce((acc, id) => acc[id], ciData[rootNode]) || idForNone;
                var disabled = {};
                if (!ids.includes(idOfRootValue)) {
                    //since the reducer above handles sysidsMinusRoot, then account for root here
                    ids.push(idOfRootValue);
                    idAndValList.push({
                        id: idOfRootValue,
                        val: group.pathToAttrIdAndVal.pathToVal.reduce((acc, prop) => acc[prop], ciData[rootNode]) || valForNone
                    });
                    disabled[idOfRootValue] = true;
                }

                //sort all the different values within an attribute excluding layers section
                // eg. Location sorting: ("Select All" will get added first in a following step)
                // 1. None
                // 2. San Diego
                // 3. Santa Clara
                idAndValList.sort((a, b) => a.val.toUpperCase().localeCompare(b.val.toUpperCase()));
                var positionOfNone = idAndValList.findIndex(o => o.val === valForNone);
                if (positionOfNone > 0) {
                    idAndValList.unshift(idAndValList.splice(positionOfNone, 1)[0]); //move object with None/Empty value to front
                }

                //assemble json needed for each checkbox; NOTE: value of 'None' is just for display and empty string is actually what's stored
                var attrList = idAndValList.map(o => this._getCheckboxJson({
                    val: o.val,
                    name: o.id,
                    attrPartialId: group.partialId,
                    defaultVal: valForNone,
                    disabled: disabled[o.id] || false
                }));

                attrList.unshift(this._getCheckboxJson({ //now add the Select All for the group at the front
                    val: api.state.translations.SELECT_ALL,
                    name: SELECT_ALL,
                    attrPartialId: group.partialId,
                    defaultVal: valForNone,
                    disabled: !sysidsMinusRoot.length //only disable the "Select All" checkboxes if there's only one node on the map
                }));

                attributes.push(this._getAttributeJson({
                    id: group.partialId,
                    label: group.displayName,
                    list: attrList
                }));
            });
            filterControls.attributes = attributes;
        },

        assembleFilterCheckboxesForRelTypes: function () {
            var idForNone = '';
            var valForNone = '(' + api.state.translations.UNNAMED + ')';
            var relPartialId = CATEGORY.RELATIONSHIP;

            //starting with ciData connections, exclude references, flatten the arrays and get just the label names, and then remove dups
            // if the value is an empty string, use default display value (eg. "unnamed"); however, this should not happen
            var ids = [];
            var idAndValList = Object.keys(ciData).map(sysid => ciData[sysid]?.connections //get all connections for this node)
                .reduce((acc, conn) => {
                    var id = conn.internal_id || idForNone;
                    var val = conn._label || valForNone;
                    if (!ids.includes(id)) {
                        ids.push(id);
                        acc.push({ id: id, val: val });
                    }
                    return acc;
                }, [])
            ).flat();

            //exist if there's no connections and its just a single node
            if (!ids.length) return;
            
            //sort the labels, eg. 1) Connects To::Connected By, 2) Depends On::Depends ...
            var idAndValListSorted = idAndValList.sort((a, b) => a.val.toUpperCase().localeCompare(b.val.toUpperCase()));
            var positionOfNone = idAndValListSorted.findIndex(o => o.val === valForNone);
            if (positionOfNone > 0) {
                idAndValListSorted.unshift(idAndValListSorted.splice(positionOfNone, 1)[0]); //move the value for none/empty to the front
            }

            //assemble json needed for each checkbox; NOTE: value of 'None' is just for display and empty string is actually what's persisted
            idAndValListSorted = idAndValListSorted.map(o => this._getCheckboxJson({
                name: o.id,
                val: o.val,
                attrPartialId: relPartialId,
                defaultVal: valForNone,
                disabled: false
            }));

            //assemble "Select All" and add it to the beginning
            idAndValListSorted.unshift(this._getCheckboxJson({ //now add the Select All for the group at the front
                val: api.state.translations.SELECT_ALL,
                attrPartialId: relPartialId,
                defaultVal: valForNone,
                disabled: !sysidsMinusRoot.length, //only disable the "Select All" checkbox if there's only one node on the map
                name: SELECT_ALL
            }));

            //add rel type category to attributes list
            filterControls.attributes.unshift(this._getAttributeJson({
                id: relPartialId,
                label: api.state.translations.CI_RELATIONSHIP_TYPE,
                list: idAndValListSorted
            }));
        },

        sortCategoriesInTheFilter: function () {
            //sort by: 1) CI type, 2) Rel type, 3) All other attributes alphabetically (asc)
            filterControls.attributes.sort((a, b) => a.header.label.toUpperCase().localeCompare(b.header.label.toUpperCase()));

            var indexOfRelType = filterControls.attributes.findIndex(a => a.id === CATEGORY.RELATIONSHIP);
            filterControls.attributes.unshift(...filterControls.attributes.splice(indexOfRelType, 1));

            var indexOfCiType = filterControls.attributes.findIndex(a => a.id === CATEGORY.ATTRIBUTE + DELIMITER + 'sys_class_name');
            filterControls.attributes.unshift(...filterControls.attributes.splice(indexOfCiType, 1));
        },

        _getCheckboxJson: function (data) {
            //the 'id' needs to define both the val (eg. "San Diego") AND the attribute name it belongs to (eg. "Location")
            //default checkbox selection for all attributes is true (except for layers which can have default profiles that set some layers to false)
            return {
                id: data.attrPartialId + DELIMITER + data.name,
                name: data.name,
                displayName: data.val,
                value: true,
                disabled: data.disabled,
                aria: {
                    checkbox: {
                        'aria-label': data.val
                    }
                }
            };
        },

        _getAttributeJson: function (data) {
            return {
                id: data.id,
                header: { //used for the accordion-item section header
                    label: data.label,
                    variant: 'primary',
                    weight: 'normal',
                    size: 'md'
                },
                list: data.list
            };
        },

        setShowFilteredItemsId: function () {
            filterControls.showFilteredItems.id = CATEGORY.SHOW_FILTERED_ITEMS;
        },

        setSelectedNode: function () {
            var selectedItemId = (api.state.initialPageLoad || api.state.disableReloadButton) ? api.context.props.selectedItemId : rootNode; //PM wants the node to selected after a search, but honor the selected node upon page load
            api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', { "elementId": selectedItemId });
        },

        populateRelatedItemValuesFromCache: function (nodes) {
            var relatedItemCache = api.state.relatedItemCache
            var hashedSysIds = getHash(Object.values(nodes.map(x => x.id)));
            var currentDataSet = relatedItemCache[hashedSysIds];
            if (!currentDataSet) {
                return nodes;
            }
            currentDataSet.forEach(cached => {
                const matchingItem = nodes.find(node => node.id === cached.id);
                if (matchingItem) {
                    matchingItem.viewData.status = cached.viewData.status;
                    matchingItem.viewData.statusMessage = cached.viewData.statusMessage;
                    matchingItem.viewData.indicatorIcon = cached.viewData.indicatorIcon;
                }
            });
            return nodes;
        },
        
        validateSearchText: function() {
            if(ciData[rootNode] && api.state.searchText) {
                var searchText = api.state.searchText;
                var name = ciData[rootNode]?.Name;
                if(name !== searchText) {
                    api.setState("searchText", name);
                }
            }
        },
    };

    postFetch.init();
}
