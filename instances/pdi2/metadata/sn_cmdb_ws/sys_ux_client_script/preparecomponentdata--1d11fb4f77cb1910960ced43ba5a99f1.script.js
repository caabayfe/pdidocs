async function script({ api, event, helpers, imports }) {
	// prepareComponentData in (CI) Properties UI Controller; fired after either:
	// 1) the Get Map Data Fetch completes
	// 2) the map selection changes (to node, connection, or map background)
	const PROPERTIES_LABELS = {
		RELATIONSHIP_TYPE: await helpers.translate("Relationship Type"),
		SOURCE_CI: await helpers.translate("Source CI"),
		TARGET_CI: await helpers.translate("Target CI")
	};
	const { isEdgeEditable } = imports["sn_cmdb_ws.unifiedMapUtilsMapSearchFilter"]();
	const { DEFAULT_ICON } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const { CONNECTION_EXCLUSION_FIELDS, buildStackedValueObj, CI_GROUP_MEMBER_FIELDS, CI_FIELDS, LOCATION, isDynamicCIGroup,
		getNameObj, getClassDisplayNameObj, SM_INPUT_EDGE_PROPERTIES } =
		imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();

	var exclusions = [
		CONNECTION_EXCLUSION_FIELDS.DIRECTION,
		CONNECTION_EXCLUSION_FIELDS.ENDPOINTS,
		CONNECTION_EXCLUSION_FIELDS.ID,
		CONNECTION_EXCLUSION_FIELDS.EPID,
		CONNECTION_EXCLUSION_FIELDS.IS_REFERENCE,
		CONNECTION_EXCLUSION_FIELDS.IS_VIRTUAL_CONNECTION,
		CONNECTION_EXCLUSION_FIELDS.STYLE,
		CONNECTION_EXCLUSION_FIELDS.SYSID,
		CONNECTION_EXCLUSION_FIELDS.LABEL,
		CONNECTION_EXCLUSION_FIELDS.TABLENAME,
		CONNECTION_EXCLUSION_FIELDS.IS_SERVICE_MAPPING,
		CONNECTION_EXCLUSION_FIELDS.ORIGINAL_TARGET_ID,
		CONNECTION_EXCLUSION_FIELDS.ORIGINAL_SOURCE_ID
	].map((e) => e.toLowerCase());
	//infer current selection from input props
	var ciSysid = api.context.props.ciSysid;
	var connectionId = api.context.props.connectionId;
	var isEditMode = api.context.props.isEditMode;
	var ciSelected = !!ciSysid && !!api.context.props.ciClass && !connectionId;
	var connectionSelected = !!connectionId && !ciSysid && !api.context.props.ciClass; //any connectionId passed in also needs the parentCI which it belongs to (for quick lookup)
	var mapBackgroundSelected = !ciSysid && !connectionId;
	api.setState("hideCiProps", !ciSelected);
	api.setState("hideConnectionProps", !connectionSelected);
	api.setState("hideConnectionHeader", mapBackgroundSelected || (isEditMode && connectionSelected));
	api.setState("showEmptyState", mapBackgroundSelected);
	if (ciSelected && (!api.data.getMapDataController?.ciData?.[ciSysid])) {
		api.setState("hideCiProps", true);
		api.setState("hideConnectionProps", true);
		api.setState("showEmptyState", true);
		return; //bail if ci not fetched yet; happens when prop changes from new search and before fetch; normally this script runs after getMap fetch returns
	}
	var entryPoints;
	var properties = {
		init: function () {
			
			if (ciSelected) {
				var ciBaseProperties = this.prepareCiCardData(ciSysid, api.state.ciBaseProperties);
				api.setState("ciBaseProperties", ciBaseProperties);
			}

			if (connectionSelected || isEditMode) {
				var ciConnectionProperties = this.prepareConnectionCardData(api);
				api.setState("ciConnectionProperties", ciConnectionProperties);
			}
		},
		prepareCiCardData: function (ciSysid, ciBaseProperties) {
			var ci = api.data.getMapDataController.ciData[ciSysid];
			var groupMemberList = [];
			var groupMembersCount = 0;
			var isGroup = api.data.getMapDataController.ciData[ciSysid].isGroup || false;
			var formattedProperties = this._buildBaseProperties(ci);
			if (isGroup && !isEditMode) {
				groupMemberList = this._populateGroupFields();
				groupMembersCount = groupMemberList.length;
			}
			var ciBaseProps = {
				sysId: ciSysid,
				name: getNameObj(ci.Name || ci.properties.name.value),
				classDisplayName: getClassDisplayNameObj(ci.Class),
				properties: formattedProperties,
				icon: ci.icon || DEFAULT_ICON,
				entryPoints: entryPoints,
				entryPointsCount: entryPoints ? entryPoints.length : 0,
				groupMembers: groupMemberList,
				groupMembersCount: groupMembersCount,
				sortCategoryArray: [],
				...(isEditMode && { isNewMapNode: api.context.props.watcher2?.find(item => item.id === ciSysid).isNewMapNode })
			};
			//Fetch dynamic CI related CI details from cache if available.
			if (!isEditMode && isDynamicCIGroup(api.context.props.ciClass) && api.state.cache[ciSysid] && api.state.cache[ciSysid].groupMembers) {
				var ci = api.state.cache[ciSysid];
				const { groupMembers, groupMembersCount, isDynamicGroupCI, showDynamicCIAlertMessage, alertMessage } = ci.groupMembers;
				ciBaseProps.isDynamicGroupCI = isDynamicGroupCI;
				ciBaseProps.showDynamicCIAlertMessage = showDynamicCIAlertMessage;
				ciBaseProps.alertMessage = alertMessage;
				ciBaseProps.groupMembers = groupMembers;
				ciBaseProps.groupMembersCount = groupMembersCount;
			}
			return ciBaseProps;
		},

		_buildBaseProperties: function (ci) {
			var resIndex = 0;
			// Split the key value in arrays of size 2 as needed by stacked value object
			var formattedProperties = Object.keys(ci.properties).reduce((res, key) => {
				//entry points will be shown in an accordian separately
				var path;
				var value;
				if (key === CI_FIELDS.ENTRY_POINTS) {
					entryPoints = ci.properties[key];
					return res;
				} else if (key === CI_FIELDS.LOCATION && ci.properties[CI_FIELDS.LOCATION]?.name) {
					path = [CI_FIELDS.LOCATION, LOCATION.NAME];
					value = path.reduce((props, k) => props ? props[k] : '', ci.properties);
				}
				var propObj = ci.properties[key];
				var curr = buildStackedValueObj(propObj.label, propObj.value || value || api.state.translations.NONE);
				if (resIndex % 2) {
					res[res.length - 1].push(curr);
				} else {
					res.push([curr]);
				}
				resIndex++;
				return res;
			}, []);
			return formattedProperties;
		},

		_populateGroupFields: function () {
			var uiFields = [CI_GROUP_MEMBER_FIELDS.CLASS,
			CI_GROUP_MEMBER_FIELDS.DISCOVERY_SOURCE,
			CI_GROUP_MEMBER_FIELDS.OWNED_BY,
			CI_GROUP_MEMBER_FIELDS.MOST_RECENT_DISCOVERY];

			var allCiData = api.data.getMapDataController.ciData;
			var groupMemberList = {};
			groupMemberList = Object.keys(allCiData).reduce((acc, current) => {
				if (allCiData[current].groupIds && allCiData[current].groupIds.includes(ciSysid)) {
					var propertiesObj = {};
					var result = Object.keys(allCiData[current].properties).reduce((res, prop) => {
						if (uiFields.includes(prop.toLowerCase())) {
							var curr = buildStackedValueObj(allCiData[current].properties[prop].label, allCiData[current].properties[prop].value || api.state.translations.NONE);
							if (res?.[res.length - 1]?.length === 1) {
								res[res.length - 1].push(curr);
							} else {
								res.push([curr]);
							}
						}
						return res;
					}, []);

					result.sysId = current;
					result.name = getNameObj(allCiData[current].Name || allCiData[current].properties.name.value);
					result.classDisplayName = getClassDisplayNameObj(allCiData[current].Class);
					propertiesObj = allCiData[current].properties;
					propertiesObj["name"] = allCiData[current].Name || allCiData[current].properties.name.value;
					propertiesObj["displayName"] = allCiData[current].Class;
					result.properties = propertiesObj;
					return [...acc, result];
				}
				return acc;
			}, []);
			return groupMemberList;
		},

		prepareConnectionCardData: function (api) {
			//find connection
			var ciData = api.data.getMapDataController.ciData;
			var filterData = api.context.props.filterData;
			var connections = [];
			if (isEditMode && ciSelected) {
				connections = Object.values(ciData)
					.flatMap(obj => obj.connections)
					.filter(connection => (connection.sourceId === ciSysid || connection.targetId === ciSysid) && !filterData.hiddenEdges.includes(connection.id));
			} else {
				connections = Object.values(ciData)
					.flatMap(obj => obj.connections)
					.filter(connection => connectionId.split('_').includes(connection.id) && !filterData.hiddenEdges.includes(connection.id));
			}

			var cards = [];
			var isExclusionsAdded = false;
			var epIdList = [];
			connections.forEach((card) => {
				var isSmConnection = card.isServiceMapping || !!card.epId;
				if (!isSmConnection && !isExclusionsAdded) {
					exclusions.push(...[CONNECTION_EXCLUSION_FIELDS.PORT, CONNECTION_EXCLUSION_FIELDS.IP_ADDRESS].map((e) => e.toLowerCase()));
					isExclusionsAdded = true;
				}
				//Populating list of edges we need additional info for service mapping
				if (card.epId) {
					let edge = {
						[SM_INPUT_EDGE_PROPERTIES.ENDPOINT_ID]: card.epId,
						[SM_INPUT_EDGE_PROPERTIES.STABLE_ID]: card.stableId || '',
						[SM_INPUT_EDGE_PROPERTIES.ORIGINAL_ID]: card.originalId || ''
					}
					epIdList.push(edge);
				}
				var fields = [];
				var sourceCI = ciData[card.sourceId];
				var targetCI = ciData[card.targetId];
				var sourceAndTargetCIExist = !!(sourceCI && targetCI);
				if (sourceAndTargetCIExist) {
					var res = this._buildConnectionFields(card);
					var hasExtendedFields = false;
					var extendedField = [];
					if ((!isSmConnection || card._label != 'Connection') && res[0]) {
						extendedField = res[0];
						hasExtendedFields = true;
					}
					for (var i = 1; i < res.length; i += 2) {
						fields.push(res.slice(i, i + 2));
					}
					cards.push({
						fields: fields,
						hasExtendedFields: hasExtendedFields,
						extendedField: extendedField,
						epId: card?.epId,
						connectionId: card.id,
						...(isEditMode && { isEdgeEditable: isEdgeEditable(card) })
					});
				}
			});
			this._getSMConnectionExtendedProps(epIdList, api);
			return {
				cards: cards,
				cardsCount: cards.length
			};

		},

		_buildConnectionFields: function (card, res) {
			const connectionLabels = {
				sourceId: PROPERTIES_LABELS.SOURCE_CI,
				targetId: PROPERTIES_LABELS.TARGET_CI,
			};
			var res = [];
			Object.keys(card).forEach((field) => {
				if (field === CONNECTION_EXCLUSION_FIELDS.LABEL) {
					res.unshift([buildStackedValueObj(PROPERTIES_LABELS.RELATIONSHIP_TYPE, card[field])]);
				} else if (!exclusions.includes(field.toLowerCase())) {
					var value;
					var label;
					if (
						field === CONNECTION_EXCLUSION_FIELDS.SOURCEID ||
						field === CONNECTION_EXCLUSION_FIELDS.TARGETID
					) {
						var originalSourceTargetValue = this._getOriginalSourceOrTargetValue(card, field);
						var ci = api.data.getMapDataController.ciData[card[field]];
						label = connectionLabels[field];
						value = originalSourceTargetValue || ci.Name || api.state.translations.NONE;
						res.push(buildStackedValueObj(label, value));
					}
				}
			});
			return res;
		},

		_getSMConnectionExtendedProps: function (epIdList, api) {
			var rootNode = api.data.getMapDataController?.inputs?.ciSysid || '';
			const edgesList = {
				[SM_INPUT_EDGE_PROPERTIES.EDGES]: epIdList,
				[SM_INPUT_EDGE_PROPERTIES.BUSINESS_SERVICE_ID]: rootNode
			};
			if (epIdList.length > 0) {
				api.setState('ciConnectionBrokerInput', {
					edgeList: edgesList
				});
			}
		},

		_getOriginalSourceOrTargetValue: function (card, field) {
			const fieldToOriginalField = {
				[CONNECTION_EXCLUSION_FIELDS.SOURCEID]: CONNECTION_EXCLUSION_FIELDS.ORIGINAL_SOURCE_ID,
				[CONNECTION_EXCLUSION_FIELDS.TARGETID]: CONNECTION_EXCLUSION_FIELDS.ORIGINAL_TARGET_ID,
			};
			const originalField = fieldToOriginalField[field];

			if (originalField) {
				const ci = api.data.getMapDataController.ciData[card[originalField]];
				return ci?.Name;
			}
			return null;
		}
	};
	properties.init();
}
