var PatternPayloadUtil;

(function() {
	/**********************************************
					  Constants
	***********************************************/
	var SOURCE_NATIVE_KEY = 'source_native_key',
		LOG_PREFIX = '[PatternPayloadUtil]';

	/**********************************************
				    Local Variables
	***********************************************/
	var cloudResourceFilter = [
			{
				name: 'Filter Service Accounts',
				classType: 'cmdb_ci_cloud_service_account',
				includeExtendedTables: false,
				execute: function(payloadToFilter, availableData) {
					var valuesToMatchWith = new CloudResourceDiscoveryUtil().fetchSelectedAccountsBySchedule(availableData.schedule),
						attributes = ['account_id', 'object_id'];
					return PatternPayloadUtil.defaultFilters.findAnyAttributeExactMatch(payloadToFilter, attributes, valuesToMatchWith);
				}
			},
			{
				name: 'Filter LDCs',
				classType: 'cmdb_ci_logical_datacenter',
				includeExtendedTables: true,
				execute: function(payloadToFilter, availableData) {
					var valuesToMatchWith = new CloudResourceDiscoveryUtil().fetchSelectedRegionsBySchedule(availableData.schedule),
						attributes = ['name', 'region'];
					return PatternPayloadUtil.defaultFilters.findAnyAttributeExactMatch(payloadToFilter, attributes, valuesToMatchWith);
				}
			},
			{
				name: 'Filter Availability Zones',
				classType: 'cmdb_ci_availability_zone',
				includeExtendedTables: false,
				execute: function(payloadToFilter, availableData) {
					var valuesToMatchWith = new CloudResourceDiscoveryUtil().fetchSelectedRegionsBySchedule(availableData.schedule),
						attributes = ['name'];
					return PatternPayloadUtil.defaultFilters.findAnyAttributeContainsMatch(payloadToFilter, attributes, valuesToMatchWith);
				}
			}
		];
	var partialItemStatus = {
		pending: 'Pending',
		resolved: 'Resolved',
		failed: 'Failed'
	};

	/**********************************************
					  Public API
	***********************************************/

	PatternPayloadUtil = {
		chooseDiscoveryTypeFilter: _chooseDiscoveryTypeFilter,
		filterPayload: _filterPayload,
		extractAttributesFromPayload: _extractAttributesFromPayload,
		extractPartialPayloadIds: _extractPartialPayloadIds,
		findActivePartialInserts: _findActivePartialInserts,
		valuesJsonObjectAsPayloadItem: _valuesJsonObjectAsPayloadItem,
		defaultFilters: {
			findAnyAttributeExactMatch: _findAnyAttributeExactMatch,
			findAnyAttributeContainsMatch: _findAnyAttributeContainsMatch
		}
	};

	function _chooseDiscoveryTypeFilter(discoveryType) {
		switch (discoveryType) {
			case DiscoveryPatternOrchestratorFlowLauncher.discoveryType.cloudResources:
				return cloudResourceFilter;
			case DiscoveryPatternOrchestratorFlowLauncher.discoveryType.serverless:
				return [];
			default:
				return [];
		}
	}

	function _filterPayload(filters, itemsToFilter, filterContext) {
		var filteredPayload = itemsToFilter;

		filters.forEach(function(filter) {
			filteredPayload = filter.execute(filteredPayload, filterContext);
		});

		return filteredPayload;
	}

	function _extractAttributesFromPayload(payloadItems, attributesMap) {
		var payloadArray = [],
			classArray = [],
			extractedPayload = {};

		if (!attributesMap)
			return JSON.parse(JSON.stringify(payloadItems));

		payloadItems.forEach(function(item) {
			var attributes, name, values, sourceInfo;

			var itemResult = {};

			for (var key in item) {
				switch(key) {
					case 'className':
						name = item[key];
						itemResult[key] = name;
						break;
					case 'values':
						values = item[key];
						itemResult[key] = {};
						break;
					case 'sys_object_source_info':
						sourceInfo = item[key];
						break;
				}
			}

			if (attributesMap.hasOwnProperty(name))
				attributes = attributesMap[name];

			if (attributes) {
				for (var element in values) {
					if (attributes.indexOf(element) != -1)
						itemResult['values'][element] = values[element];
				}

				if (sourceInfo &&
					sourceInfo.hasOwnProperty(SOURCE_NATIVE_KEY) &&
					(attributes.indexOf(SOURCE_NATIVE_KEY) > -1))
					itemResult['values'][SOURCE_NATIVE_KEY] = sourceInfo[SOURCE_NATIVE_KEY];

				var payloadObj = {};
				payloadObj[name] = itemResult;
				payloadArray.push(payloadObj);

				if (classArray.indexOf(name) == -1)
					classArray.push(name);
			}
		});

		classArray.forEach(function(ciClass) {
			var combinedPayload = [];

			payloadArray.forEach(function(result) {
				var key = Object.keys(result);

				if (key == ciClass)
					combinedPayload.push(result[key]);
			});
			extractedPayload[ciClass] = combinedPayload;
		});

		return extractedPayload;
	}

	function _extractPartialPayloadIds(outputPayload) {
		if (outputPayload == null)
			return [];

		var payloadObject = null;
		
		try {
			payloadObject = JSON.parse(outputPayload);

			if (payloadObject == null)
				return [];
		} catch(e) {
			var logger = new sn_automation.AutomationAPI().getNodeLogger();
			logger.warn("Invalid JSON detected while extracting partial payload ids " + outputPayload);
			
			return [];
		}
		
		var partialIdSet = {};
		
		if (payloadObject.items != null)
			payloadObject.items.forEach(_extractPartialIdFromElement);
		
		if (payloadObject.relations != null)
			payloadObject.relations.forEach(_extractPartialIdFromElement);

		return Object.keys(partialIdSet);

		function _extractPartialIdFromElement(element) {
			if (element.partialSysId)
				partialIdSet[element.partialSysId] = true;
			
			if (element.partialSysIds) {
				for (var i = 0; i < element.partialSysIds.length; i++) 
					partialIdSet[element.partialSysIds[i]] = true;			
			}
		}
	}

	function _findActivePartialInserts(statusId) {
		var partialInserts = new GlideRecord('sn_discovery_pattern_orchestrator_partial_inserts');
		partialInserts.addQuery('status_id', statusId);
		partialInserts.query();

		if (!partialInserts.hasNext())
			return;
		
		var partialPayloadQuery = new GlideRecord('cmdb_ire_partial_payloads');

		var unresolvedPartialPayloads = {};
			
		while (partialInserts.next()) {
			partialPayloadQuery.get('sys_id', partialInserts.partial_payload_id + '');
			if (partialPayloadQuery.active) {
				var pattern = partialInserts.getDisplayValue('pattern_id');
				if (unresolvedPartialPayloads[pattern] == null)
					unresolvedPartialPayloads[pattern] = [];

				unresolvedPartialPayloads[pattern].push(partialInserts.getValue('partial_payload_id'));

				partialInserts.setValue('state', partialItemStatus.failed);
				partialInserts.update();

				continue;
			}

			partialInserts.setValue('state', partialItemStatus.resolved);
			partialInserts.update();
		}
		
		_printPartialInsertResults(unresolvedPartialPayloads, statusId);
	}

	function _valuesJsonObjectAsPayloadItem(values, asClass) {
		return {
			className: asClass,
			values: values
		};
	}
	/**********************************************
				Private Helper Functions
	***********************************************/

	function _getFilteredPayloadForIncopmleteInputs(payloadToFilter, attributesToFind, valuesToMatch, logger, logPrefix) {

		if (!payloadToFilter || (payloadToFilter.length == 0)) {
			logger.warn(LOG_PREFIX + logPrefix  + ' No payload to filter');
			return [];
		}

		if (!attributesToFind || (attributesToFind.length == 0)) {
			logger.warn(LOG_PREFIX + logPrefix + ' No filering attributes provided. No filtering performed');
			return payloadToFilter;
		}

		if (!valuesToMatch || (valuesToMatch.length == 0)) {
			logger.warn(LOG_PREFIX + logPrefix + ' No filering values provided. No filtering performed');
			return payloadToFilter;
		}
		
		return null;
	}

	// TODO: Remove common logic from both matching strategies
	function _findAnyAttributeExactMatch(payloadToFilter, attributesToFind, valuesToMatch) {
		var logger = new sn_automation.AutomationAPI().getNodeLogger(),
			filterIdentifierLogPrefix = '[' + gs.generateGUID() + ']';

		logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Preparing running filter using exact match comparison\n'
					+ 'Payload: ' + JSON.stringify(payloadToFilter) + '\n'
					+ 'Attributes to find: ' + JSON.stringify(attributesToFind) + '\n'
					+ 'Values to match: ' + JSON.stringify(valuesToMatch));

		var filteredPayload = _getFilteredPayloadForIncopmleteInputs(payloadToFilter, attributesToFind, valuesToMatch, logger, filterIdentifierLogPrefix);

		if (filteredPayload != null)
			return filteredPayload;

		logger.info(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtering input payload...');

		filteredPayload = payloadToFilter.filter(function(item) {
			logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Inspecting item: ' + JSON.stringify(item));
			var didFindAttribute = false;

			for (var index in attributesToFind) {
				var attribute = attributesToFind[index];
				logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Looking for attribute "' + attribute + '" in item');

				if (item.values[attribute]) {
					var valueInPayload = item.values[attribute];
					logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Attribute found with value "' + valueInPayload + '"');
					didFindAttribute = (valuesToMatch.indexOf(valueInPayload) != -1);
					var didFindAttributeLog = didFindAttribute ? 'found' : 'not found';

					logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' "' + valueInPayload + '" ' + didFindAttributeLog + ' in ' + JSON.stringify(valuesToMatch));

					if (didFindAttribute)
						break;
				}
			}
			return didFindAttribute;
		});

		logger.info(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtering finished...');
		logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtered payload:\n' + JSON.stringify(filteredPayload));

		return filteredPayload;
	}

	// TODO: Remove common logic from both matching strategies
	function _findAnyAttributeContainsMatch(payloadToFilter, attributesToFind, valuesToMatch) {
		var logger = new sn_automation.AutomationAPI().getNodeLogger(),
			filterIdentifierLogPrefix = '[' + gs.generateGUID() + ']';

		logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Preparing running filter using containment match comparison\n'
					+ 'Payload: ' + JSON.stringify(payloadToFilter) + '\n'
					+ 'Attributes to find: ' + JSON.stringify(attributesToFind) + '\n'
					+ 'Values to match: ' + JSON.stringify(valuesToMatch));

		var filteredPayload = _getFilteredPayloadForIncopmleteInputs(payloadToFilter, attributesToFind, valuesToMatch, logger, filterIdentifierLogPrefix);

		if (filteredPayload != null)
			return filteredPayload;

		logger.info(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtering input payload...');

		filteredPayload = payloadToFilter.filter(function(item) {
			logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Inspecting item: ' + JSON.stringify(item));
			var hasMatchesInPayload = false;

			for (var index in attributesToFind) {
				var attribute = attributesToFind[index];
				logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Looking for attribute "' + attribute + '" in item');

				if (item.values[attribute]) {
					var valueInPayload = item.values[attribute];
					logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Attribute found with value "' + valueInPayload + '"');

					hasMatchesInPayload = valuesToMatch.some(function(element) {
						var didFindPartialMatch = (valueInPayload.toLowerCase().indexOf(element.toLowerCase()) != -1),
						didFindPartialMatchLog = didFindPartialMatch ? 'contains' : 'doesn\'t contain';

						logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' "' + valueInPayload + '" ' + didFindPartialMatchLog + ' "' + element + '"');

						return didFindPartialMatch;
					});
					
					if (hasMatchesInPayload)
						break;
				}
			}
			return hasMatchesInPayload;
		});

		logger.info(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtering finished...');
		logger.debug(LOG_PREFIX + filterIdentifierLogPrefix + ' Filtered payload:\n' + JSON.stringify(filteredPayload));

		return filteredPayload;
	}
	
	function _printPartialInsertResults(unresolvedPartialPayloads, statusId) {
		var allowCodeTag = gs.getProperty('glide.ui.security.allow_codetag', true) + '' == 'true';

		var count = 0;
		var logResult = 'Uncompleted partial payloads persisted in Discovery flow.';

		if (!allowCodeTag)
			logResult = logResult + '(cmdb_ire_partial_payloads)\n';
		else
			logResult = logResult + '<br/>';

		for (var patternKey in unresolvedPartialPayloads) {
			if (unresolvedPartialPayloads[patternKey].length == 0)
				continue;

			logResult = logResult + patternKey + ' - ';

			if (allowCodeTag && unresolvedPartialPayloads[patternKey].length < 50) {
				logResult = logResult +
					'<a href="cmdb_ire_partial_payloads_list.do?sysparm_query=sys_idIN' +
					unresolvedPartialPayloads[patternKey].join() +
					'">Records</a><br/>';
			} else {
				logResult = logResult + unresolvedPartialPayloads[patternKey].join() + '\n';
			}

			count += unresolvedPartialPayloads[patternKey].length;
		}

		if (count == 0)
			return;

		if (allowCodeTag)
			logResult = "[code]" + logResult + "[/code]";

		var logger = new DiscoveryLogger(statusId);
		logger.warn(logResult);
	}
})();
