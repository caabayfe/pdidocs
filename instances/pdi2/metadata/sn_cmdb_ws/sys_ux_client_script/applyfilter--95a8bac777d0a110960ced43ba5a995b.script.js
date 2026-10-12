function script({ api, event, helpers, imports }) {
	//applyFilter script in Map Search Filter UI Controller; fired on interaction with the filter checkboxes or upon page load for profiles and presets
	/*
	One pipeline and one script to handle several different animals:
	1) layer, 
	2) CI Type (class), 
	3) CI attribute, 
	4) relationship connection type, 
	5) Show filtered items
	Those pieces of data are all handled differently and exist within different places in the data structure.

	1,2,3) layer, CI Type (class), and CI attribute
		-hides/shows all CIs and their immediate connections with the incoming layer, class, or attribute
		-it will additionally hide any orphaned CIs and their immediate connections
		-update the client state for that checkbox
		-also flips the Select All if it's the last one with that value
		-location of those 3 pieces of data
			"ciData": {
					"539747cac0a801640163e60735fbbf6e": {
						"Class": "Linux Server",
						"layer": "infrastructure",
						"properties": {
							"sys_class_name": {
								"label": "Class",
								"value": "cmdb_ci_service"
							},
							"location": {
								"label": "Location",
								"name": "153 South Sierra Avenue, Solana Beach,CA",
								"city": "Solana Beach"
							},
							"owned_by": {
								"label": "Owned by",
								"value": "James Vittolo"
							},
							"discovery_source": {
								"label": "Discovery source",
								"value": ""
							},
						}
	4) relationship connection type
		-hides all connections of that type along with the node that is the child/target end of the connection
		-it will additionally hide any orphaned CIs and their immediate connections
		-update the client state for that checkbox
		-also flips the Select All if it's the last one with that value
		-location of those 2 pieces of data
			"ciData": {
				"539747cac0a801640163e60735fbbf6e": {
					"connections": [
						{
							"id": "5f73c3fbc0a8010e00486f7855865faa",
							"targetId": "539747cac0a801640163e60735fbbf6e",
							"_label": "Depends on::Used by",
	5) Show filtered items
		-update the client state for that checkbox
	*/

	const { DELIMITER, LAYER, CATEGORY, SELECT_ALL, cloneDeep, isEqual, getConnections } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { capturePerfMetrics, PERF_METRICS, findAndHideAllConnections, findAllNodesConnectedToRoot, resetReloadButtonState, 
		getAttributeGroupDefinitions, setupManagePresetDropdown } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
	const { getNowTimestamp } = imports["sn_cmdb_ws.unifiedMapTimelineUtil"]();
	const timestamp = event.payload?.data?.timestamp || api.state.markerFilterTimestamp || getNowTimestamp();
	var filterControls = cloneDeep(api.state.filterControls);
	var layer = filterControls.layer;
	var attributes = filterControls.attributes;
	var ciData = api.data.getMapDataController.ciData;

	var functions = {

		applyFilter: function () {
			//used when a complete filter replacement is being done like on a new preset apply
			//if so, no need to set current and previous preset ids since it will have already been handled
			this.resetFilter();
			this.updateClientStateForFilterControls();
			this.findAndFilter();
			setupManagePresetDropdown({filterControls, api, event});
			resetReloadButtonState(api, helpers);
			this.capturePerfMetrics();
		},

		resetFilter: function () {
			//bail if its reload button clicked or resetall is not set to true
			if (api.state.disableReloadButton || !event.payload.resetAll) return;
			//set all the layer checkboxes to true (checked)
			Object.keys(layer).forEach(n => layer[n].value = true);

			//set all the attribute checkboxes to true (checked)
			attributes.map(a => a.id).forEach(attrGroupId => {
				var list = attributes.find(attrGroup => attrGroup.id === attrGroupId).list;
				list.forEach(a => a.value = true);
			});

			filterControls.unused = [];
		},

		updateClientStateForFilterControls: function () {
			//if reload button is clicked or in the event of timestamp event the filter control items will be empty
			if (api.state.disableReloadButton || event.payload?.data?.timestamp) return;
			//first bucket the items array into categories so we can pass the full list of items for each category collectively
			var categories = event.payload.items.reduce((acc, item) => {
				//ex id's: (each will require different logic)
				//  1 item  - "showFilteredItems"
				//  2 items - "layer|-|Infrastructure"
				//  2 items - "class|-|Linux Server"
				//  2 items - "relationship|-|Runs On"
				//  3 items in id - "attribute|-|Location|-|San Diego" (or "attribute|-|Location|-|" where None is checked)
				var id = item.id;
				var [category, idPart1, idPart2] = id.split(DELIMITER); //categories: showFilteredItems, layer, Class, relationship, attribute. NOTE: may be an emtpy string for display value of "None"
				var value = item.value;

				// first sort the array of items for block processing
				switch (category) { //showFilteredItems, layer, Class, relationship, attribute
					case CATEGORY.SHOW_FILTERED_ITEMS:
						filterControls.showFilteredItems.value = value;
						break;
					case CATEGORY.LAYER:
						acc[CATEGORY.LAYER] = acc[CATEGORY.LAYER] || [];
						acc[CATEGORY.LAYER].push({
							idPart1: idPart1,
							value: value
						});
						break;
					case CATEGORY.RELATIONSHIP:
						acc[CATEGORY.RELATIONSHIP] = acc[CATEGORY.RELATIONSHIP] || [];
						acc[CATEGORY.RELATIONSHIP].push({
							id: id,
							category: category,
							idPart1: idPart1,
							idPart2: idPart2,
							value: value,
							displayName: item.displayName
						});
						break;
					case CATEGORY.ATTRIBUTE:
						acc[idPart1] = acc[idPart1] || [];
						acc[idPart1].push({
							id: id,
							category: category,
							idPart1: idPart1,
							idPart2: idPart2,
							value: value,
							displayName: item.displayName
						});
						break;
				}
				return acc;
			}, {});

			// now save the incoming payload to client state
			Object.keys(categories).forEach(n => {
				n === CATEGORY.LAYER ? this._setLayers(categories[CATEGORY.LAYER]) : this._setAttributes(categories[n]);
			});

			this._calculateFilterPresence(); //blue dot on filter button to indicate things are unchecked in the filter

			//this is basically an isDirty check on the filter as its changed to see if it matches the state of the last preset applied 
			//  so we can update the disabled flag of the menu items in the preset editor menu kebob to indicate no changes, so ...
			// 1) skip on page load, and 
			// 2) skip when a preset is being applied (resetAll=true), and 
			// 3) skip when no preset is currently selected available from "reset" link
			if (!api.state.initialPageLoad && !event.payload.resetAll && api.context.props.presetId) {
				//TODO: this is place to add isDirty check on filter so we know what exactly in the matrix is disabled
			}
			//If coming from changing of checked values
			var presetIdFromPayload = event.payload?.currentPresetId?.toString();
			filterControls.matchesPreset = !!presetIdFromPayload;

			api.setState('filterControls', filterControls);
		},

		_setLayers: function (items) {
			items.forEach((i, idx) => {
				if (i.idPart1 === LAYER.SELECT_ALL.NAME) {
					//set all the layer checkboxes to the selectAll value
					Object.keys(layer).forEach(n => layer[n].value = i.value);
				} else { //just update the individual layers
					var propName = Object.keys(layer).find(n => layer[n].name === i.idPart1);
					layer[propName].value = i.value;

					//re-compute the SelectAll on last item
					if (idx === (items.length - 1)) {
						var selectAllVal = Object.keys(layer)
							.filter(l => layer[l].name !== LAYER.SELECT_ALL.NAME)
							.reduce((acc, val) => layer[val].value && acc, true);
						layer.selectAll.value = selectAllVal;
					}
				}
			});
		},

		_setAttributes: function (items) {
			items.forEach((o, idx) => {
				var isRelationship = o.category === CATEGORY.RELATIONSHIP;
				var attrGroupId = isRelationship ? CATEGORY.RELATIONSHIP : CATEGORY.ATTRIBUTE + DELIMITER + o.idPart1;
				var idPart1or2 = isRelationship ? o.idPart1 : o.idPart2;
				var list = attributes.find(attrGroup => attrGroup.id === attrGroupId).list;
				var attr = list.find(attr => attr.id === o.id);
				if ((!attr || attr.disabled) && !event.payload.discardUnused) {
					filterControls.unused.push({
						id: o.id,
						displayName: o.displayName
					});
				} else if (idPart1or2 === SELECT_ALL) {
					//set all the attribute checkboxes to the selectAll value except for disabled checkboxes exclusively applying to the root node
					list.forEach(a => {
						if (a.disabled) {
							return; //leaves disabled checkboxes as checked
						}
						a.value = o.value;
					});
				} else if (!attr.disabled) { //just update the attribute value as along as it's not disabled
					attr.value = o.value;

					//re-compute the SelectAll on last item
					if (idx === (items.length - 1)) {
						var selectAllVal = list.filter(a => a.name !== SELECT_ALL)
							.reduce((acc, o) => o.value && acc, true);
						list.find(o => o.name === SELECT_ALL).value = selectAllVal;
					}
				}
			});
		},

		_calculateFilterPresence: function () {
			var hasUncheckedLayers = Object.values(layer).some(o => !o.value); //true means we show icon
			var hasUncheckedAttrs = attributes.some(a => a.list.some(o => !o.value)); //true means we show icon
			var presetId = event.payload.currentPresetId || api.context.props.presetId;
			var hasPresetApplied = !!presetId;
			var uncheckedAnything = hasUncheckedLayers || hasUncheckedAttrs || hasPresetApplied;
			filterControls.presenceIcon.isHidden = !uncheckedAnything;
		},

		_sortArray: function (arr) {
			//id: "attribute|-|Discovery source|-|ServiceNow"
			//  keep in mind this sort is not for displaying anything and instead just used to determine parity
			return arr.sort((a, b) => a.id.localeCompare(b.id));
		},

		findAndFilter: function () {
			//find all nodes matching any section of the filter (NOTE: connections and child nodes of hidden nodes are both addressed later)
			var nodes = [];
			var edges = [];
			// filter out CIs with a created on date that is after the timestamp marker
			var sysids = Object.keys(ciData).filter(sysid => ciData[sysid].sys_created_on > timestamp &&
				sysid !== api.state.rootNode);
			nodes.push(...sysids);

			//find nodes of hidden layers
			if (!layer.selectAll.value) {
				//hide nodes for unchecked layers
				//returns all layer prop names (excludes selectAll) where the layer's value is false
				var layerPropNames = Object.keys(layer).filter(n => !layer[n].value
					&& n !== Object.keys(layer).find(n2 => layer[n2].name === LAYER.SELECT_ALL.NAME)
				);

				//now find all CIs that have those layer(s). exclude root node
				layerPropNames.forEach(n => {
					var sysids = Object.keys(ciData)
						.filter(sysid => ciData[sysid].layer === layer[n].key &&
							sysid !== api.state.rootNode);
					nodes.push(...sysids);
				});
			}

			//find nodes & edges matching filters
			attributes.forEach(attribute => { //iterates over the CI attributes/relTypes eg. 'Class', 'Relationship type', 'Discovery Source', 'Owned by', ...
				attribute.list
					.filter(a => !a.value && a.name !== SELECT_ALL) //only return the unchecked values since we're just looking for the nodes to hide
					.forEach(attValue => { //iterates over all the different attributes with unchecked values. NOTE: the attValues are still objects at this point
						var [c, avIdPart1, avIdPart2] = attValue.id.split(DELIMITER); //"id": "attribute|-|Discovery source|-|ServiceNow"
						var filtered;
						if (c === CATEGORY.ATTRIBUTE) {
							filtered = this._findMatchingCIs(avIdPart1, avIdPart2);

							//also hide all the members of each group node (currently just a fast and hard rule regardless if the member's have external connections back to root node)
							//the nodemap component already hides the group members, so we need to match that logic to accurately find orphaned nodes
							var grpNodes = filtered.nodes.filter(sysid => ciData[sysid].isGroup);
							var grpMembers = grpNodes.reduce((acc, grpSysid) => [...acc, ...this._findGroupMembers(grpSysid)], []);
							filtered.nodes.push(...grpMembers);
						} else {
							filtered = this._findMatchingRelTypes(avIdPart1);
						}

						nodes.push(...filtered.nodes); //add CIs matching this attribute value to the list of CIs to disable/hide
						edges.push(...filtered.edges); //add edges matching this attribute value to the list of edges to disable/hide
					});
			});

			//filter out edges with a created on date that is after the timestamp marker
			var edgeIds = getConnections(ciData).filter(connection => connection.sys_created_on > timestamp); // Filter by timestamp
			edges.push(...edgeIds.map(c => c.id));
			nodes.push(...edgeIds.filter(c => c.targetId !== api.state.rootNode).map(c => c.targetId));

			//hidden nodes require further processing (vs just disabled nodes) since we would then need to look for orphaned nodes
			if (!filterControls.showFilteredItems.value) {

				//first hide all connections going in/out of the matching hidden nodes
				findAndHideAllConnections(nodes, edges, ciData);

				//now find "island" nodes that have become orphaned from the root node
				var remainingEdges = api.state.edges.map(e => e.id).filter(e => !edges.includes(e));
				var nodesConnectedToRoot = findAllNodesConnectedToRoot(remainingEdges, api.state.edges, api);
				let orphanedNodes = Object.keys(ciData)
					.filter(sysid => !nodesConnectedToRoot.includes(sysid) && sysid !== api.state.rootNode);
				nodes.push(...orphanedNodes);

				//lastly find and hide all connections of those "island" nodes
				findAndHideAllConnections(nodes, edges, ciData);
			}

			var hiddenEdges = filterControls.showFilteredItems.value ? [] : [...(new Set(edges))]; //no-op since there's no concept of inActive edges yet
			var inactiveEdges = filterControls.showFilteredItems.value ? [...(new Set(edges))] : [];
			var inactiveNodes = filterControls.showFilteredItems.value ? [...(new Set(nodes))] : [];
			var hiddenNodes = filterControls.showFilteredItems.value ? [] : [...(new Set(nodes))];
			var activeNodes = Object.keys(ciData).filter(sysid => !ciData[sysid].isInactive)
				.filter(n => !hiddenNodes.includes(n) && !inactiveNodes.includes(n));
			api.setState('filterOutput', {
				activeNodes: activeNodes,
				inactiveNodes: inactiveNodes,
				hiddenNodes: hiddenNodes,
				hiddenEdges: hiddenEdges,
				inactiveEdges: inactiveEdges
			});

			//force the nodemap to re-render; this is a temp workaround suggestion by COE
			helpers.timing.setTimeout(() => {
				api.emit('SN_NODE_MAP_UNIFIED_CTRL#COLLAPSE_ALL_GROUPS', {});
			}, 0);
		},

		_findGroupMembers: function (grpSysid) {
			return Object.keys(ciData).filter(sysid => ciData[sysid]?.groupIds?.includes(grpSysid));
		},

		_findMatchingCIs: function (avIdPart1, avIdPart2) {
			var idForNone = '';
			var pathToIdObj = getAttributeGroupDefinitions(api).reduce((acc, group) => {
				acc[group.partialId.split(DELIMITER)[1]] = group.pathToAttrIdAndVal.pathToId; //Eg. acc.owned_by = ['properties', 'owned_by', 'value'];
				return acc;
			}, {});
			var nodes = Object.keys(ciData).filter(sysid => { //find CIs matching the attribute value (excluding the root node)
				//gets attribute value (eg 'ServiceWatch') of each CI for comparision against value we're hiding              
				var id = pathToIdObj[avIdPart1].reduce((acc, prop) => acc[prop], ciData[sysid]) || idForNone;
				return id === avIdPart2 && sysid !== api.state.rootNode;
			});
			
			return {
				edges: [],
				nodes: nodes
			};
		},

		_findMatchingRelTypes: function (avIdPart1) {
			//find edges matching the rel type
			var hiddenEdges = getConnections(ciData).filter(c => c.internal_id === avIdPart1);
			return {
				edges: hiddenEdges.map(c => c.id),
				nodes: hiddenEdges.filter(c => c.targetId !== api.state.rootNode).map(c => c.targetId)
			};
		},

		capturePerfMetrics: function () {
			if (event.payload?.data?.timestamp) {
				//bail if filtering is coming from the timelime as we only want to capture the time it takes for the map to load
				return;
			}

			if (api.context.props.perfLogging) {
				var timestamp = Date.now();
				var captures = [
					{
						metricToCapture: PERF_METRICS.CMDB_FRONTEND_TIME,
						isStartTime: false
					}, {
						metricToCapture: PERF_METRICS.NODEMAP_COMPONENT_RENDERING_TIME,
						isStartTime: true
					}
				];

				//determine base_state_type (eg. 'page_refresh' vs 'map_load_only')
				if (api.data.getMapDataController.perfMetrics.base_state_type === null) {
					//notice we're not using setState here since it's not possible to set internal state of a dependent controller;
					// however the value will save, but won't trigger any handlers (not that we need them to)
					api.data.getMapDataController.perfMetrics.base_state_type = api.state.initialPageLoad ? 'page_refresh' : 'map_load_only';
				}

				//NOTE: we're not using the perfMetrics in the getMapDataController anymore since it can't be updated from this controller; we'll make a copy from here and maintain that onward
				var perfMetrics = api.state.perfMetrics?.ci_sysid ? api.state.perfMetrics : api.data.getMapDataController.perfMetrics;

				capturePerfMetrics({
					captures: captures,
					timestamp: timestamp,
					persist: false,
					perfMetrics: perfMetrics,
					api: api
				});
			}
		}
	};

	functions.applyFilter();
}
