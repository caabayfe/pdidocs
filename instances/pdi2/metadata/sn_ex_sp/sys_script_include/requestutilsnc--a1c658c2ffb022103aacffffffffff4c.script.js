var RequestUtilSNC = Class.create();
RequestUtilSNC.prototype = {

    initialize: function(portalSysID, userID) {
        this.TABLES = sn_ex_sp.RequestConstants.TABLES;
        this.FILTER_TYPES = sn_ex_sp.RequestConstants.FILTER_TYPES;
        this.portalSysID = portalSysID;
        this.userID = userID || gs.getUserID();
        this.isCachingEnabled = true;
        this.session = gs.getSession();
        this.sessionLanguage = this.session.getLanguage();
        this.CACHE_NAME = sn_ex_sp.RequestConstants.SCOPED_CACHE_NAME;
        this.CACHE_KEYS = {
            REQUEST_SOURCE: 'request_source_' + this.portalSysID + "_" + this.sessionLanguage,
            FILTER_DEFINITIONS: 'filter_definitions_' + this.portalSysID + "_" + this.sessionLanguage,
            FILTER_CONFIGURATIONS: 'filter_configurations_' + this.portalSysID + "_" + this.sessionLanguage,
            FILTER_CONDITIONS: 'filter_conditions_' + this.portalSysID + "_" + this.sessionLanguage
        };
        this.REQUEST_FILTER_SESSION_CACHE_KEY = sn_ex_sp.RequestConstants.SESSION_CACHE_KEYS.REQUEST_FILTER + "_" + this.portalSysID + "_" + this.sessionLanguage;
        this.VIEW_FILTER_SESSION_CACHE_KEY = sn_ex_sp.RequestConstants.SESSION_CACHE_KEYS.VIEW_FILTER + "_" + this.portalSysID + "_" + this.sessionLanguage;
    },

    // ------------------- Public methods ------------------
    /**
     * Sets active status for a record from the specified request config table
     */
    setActiveForRequestTableConfig: function(tableName, recordSysId, isActive) {
        if ([this.TABLES.REQUEST_SOURCE, this.TABLES.REQUEST_FILTER_DEFINITION, this.TABLES.REQUEST_FILTER_CONFIG, this.TABLES.REQUEST_FILTER_CONDITION].indexOf(tableName) == -1)
            return;

        var requestSourceGr = new GlideRecord(tableName);
        if (requestSourceGr.get(recordSysId)) {
            requestSourceGr.active = isActive;
            requestSourceGr.update();
        }
    },

    /**
     * Returns the view filter for the current user and portal.
     * @returns Object containing name, sys_id, options (list of filterConfiguration data)
     */
    getViewFilter: function() {
        var viewFilter = {};

        viewFilter = this._getFromSessionCache(this.VIEW_FILTER_SESSION_CACHE_KEY);
        if (!gs.nil(viewFilter) && Object.keys(viewFilter).length !== 0) {
            return viewFilter;
        }

        var viewFilterDefns = this._getRequestFilterDefinitions(true);
        if (viewFilterDefns.length === 0) {
            return {}; // No active view-type definition for the portal
        }

        viewFilter = {
            name: viewFilterDefns[0].name,
            sys_id: viewFilterDefns[0].sys_id,
            options: this._getFilterConfigurations(viewFilterDefns[0].sys_id),
        };

        this._putInSessionCache(this.VIEW_FILTER_SESSION_CACHE_KEY, viewFilter);

        return viewFilter;
    },

    /**
     * Retrieves the list of filter IDs associated with a given tab.
     * @param {String} tabId - Sys ID of the tab.
     * @returns {Array} Array of filter sys_ids linked to the tab.
     */
    getFiltersForTab: function(tabId) {
        var cacheKey = this.CACHE_KEYS.REQUEST_TAB_FILTER + "_" + tabId;
        var cachedFilterIds = this._getFromScopedCache(this.CACHE_NAME, cacheKey);

        if (cachedFilterIds) {
            return cachedFilterIds;
        }

        var filterIds = [];
        var m2mTabFilterGr = new GlideRecord('sn_ex_sp_request_tab_filter_mtom');
        m2mTabFilterGr.addQuery('tab', tabId);
        m2mTabFilterGr.query();
        while (m2mTabFilterGr.next()) {
            filterIds.push(m2mTabFilterGr.getValue('filter'));
        }

        this._putInScopedCache(this.CACHE_NAME, cacheKey, filterIds);

        return filterIds;
    },

    /**
     * Returns the request filters associated with a specific tab.
     * @param {String} tabId - Sys ID of the tab.
     * @returns {Array} Array of request filter objects for the tab.
     */
    getRequestFiltersForTab: function(tabId) {
        var allFilters = this.getRequestFilters() || [];
        var validIds = this.getFiltersForTab(tabId) || [];
        if (!validIds.length) {
            return [];
        }
        return allFilters.filter(function(rec) {
            return validIds.indexOf(rec.categoryId) !== -1;
        });
    },

    /**
     * Returns the request filters for the current user and portal
     * @returns Object containing label, value, selected, referenceTable, referenceFilterColumn
     */
    getRequestFilters: function() {
        var filters = [];

        filters = this._getFromSessionCache(this.REQUEST_FILTER_SESSION_CACHE_KEY);
        if (filters !== null && filters !== undefined && Object.keys(filters).length !== 0) {
            return filters;
        }

        filters = [];
        var definitions = this._getRequestFilterDefinitions(false);

        definitions.forEach(function(definition) {
            var record = {
                categoryId: definition.sys_id,
                category: definition.name,
                filterType: definition.filter_type,
                selectedFilters: [],
                selection: {
                    displayValue: '',
                    value: '',
                },
            };
            var configurations;
            if (definition.filter_type === this.FILTER_TYPES.CHOICE) {
                record.multiSelect = definition.is_multiselect || false;
                record.filters = [];
                configurations = this._getFilterConfigurations(definition.sys_id);

                configurations.forEach(function(config) {
                    var option = {
                        label: config.label,
                        value: config.sys_id,
                        selected: config.selected,
                    };
                    record.filters.push(option);
                }, this);
            } else if (definition.filter_type === this.FILTER_TYPES.REFERENCE) {
                record.referenceTable = definition.reference_table;
                record.searchField = definition.search_field;
                record.referenceCondition = definition.reference_condition;
                record.filters = [];
                configurations = this._getFilterConfigurations(definition.sys_id);

                configurations.forEach(function(config) {
                    record.filters.push({
                        label: config.label,
                        value: config.sys_id,
                        referenceTable: config.reference_table,
                        referenceFilterColumn: config.request_filter_column,
                    });
                }, this);
            }

            filters.push(record);
        }, this);

        this._putInSessionCache(this.REQUEST_FILTER_SESSION_CACHE_KEY, filters);

        return filters;

    },

    /**
     * Method to retrieve the request objects
     * @param selectedViewFilterConfigID SysID of the RequestFilterConfig record corresponding to the View Filter for the portal
     * @param uiFilters Object containing the filter details that are applied on the UI.
     * {"req_filter_definition_1": {"filterType": [choice|reference], "selectedOptions: [<list of selected request filter config ids>]"}}
     * @param searchText String for searching the requests
     * @returns Array of objects containing title, descriptionValues, urlParams, timestamp, status
     */
    getRequests: function(selectedViewFilterConfigID, uiFilters, searchText, limit, lastRenderedCard) {
        var requests = {};
        requests.data = [];
        requests.showMore = false;

        var tableConfigurations = this._getTableConfiguration(selectedViewFilterConfigID, uiFilters);
        var activeRequestMinCreatedDate = "";
        var qureyLimit = parseInt(limit) + 5;

        for (var tableName in tableConfigurations) {
            var titleField = tableConfigurations[tableName].titleField;
            var descriptionFields = tableConfigurations[tableName].descriptionFields;
            var portalPage = tableConfigurations[tableName].portalPage;
            var tableConditions = tableConfigurations[tableName].conditions;

            var requestGr = new GlideRecordSecure(tableName);
            requestGr.addEncodedQuery(tableConditions, false);
            if (searchText) {
                requestGr.addQuery('123TEXTQUERY321', searchText);
            }
            if (lastRenderedCard) {
                var lastRenderedCardDate = new GlideDateTime(lastRenderedCard.date);
                requestGr.addQuery('sys_updated_on', '<=', lastRenderedCardDate);
                requestGr.addQuery('sys_id', '!=', lastRenderedCard.id);
            }
            if (activeRequestMinCreatedDate) {
                activeRequestMinCreatedDate = new GlideDateTime(activeRequestMinCreatedDate);
                requestGr.addQuery('sys_updated_on', '>', activeRequestMinCreatedDate);
            }

            requestGr.setLimit(qureyLimit);
            requestGr.orderByDesc("sys_updated_on");
            requestGr.query();
            var requestItemCount = 0;
            while (requestGr.next()) {
                requestItemCount += 1;
                requests.data.push({
                    title: requestGr.getValue(titleField) || requestGr.getValue('number'),
                    descriptionValues: descriptionFields.map(function(descField) {
                        return requestGr.getDisplayValue(descField);
                    }),
                    urlParams: "?id=" + portalPage + "&table=" + tableName + "&sys_id=" + requestGr.getValue("sys_id"),
                    timestamp: requestGr.getValue("sys_updated_on"),
                    status: requestGr.getDisplayValue("state"),
                    sysID: requestGr.getValue("sys_id")
                });
                if (requestItemCount >= limit) {
                    var requestItemCreatedDate = requestGr.getValue("sys_updated_on");
                    activeRequestMinCreatedDate = (activeRequestMinCreatedDate && activeRequestMinCreatedDate < requestItemCreatedDate) ? activeRequestMinCreatedDate : requestItemCreatedDate;
                }
            }
        }

        this._sortRequestResults(requests.data);
        if (requests.data.splice(limit).length > 0) {
            requests.showMore = true;
        }
        if (requests.data.length) {
            var lastCardIndex = requests.data.length - 1;
            requests.lastRenderedCard = {};
            requests.lastRenderedCard.id = requests.data[lastCardIndex].sysID;
            requests.lastRenderedCard.date = requests.data[lastCardIndex].timestamp;
        }
        return requests;
    },

    /**
     * Returns a paginated list of draft items
     * @param offset number of records that needs to be skipped from the start
     * @param limit number of records to return
     * @param searchText search text to filter draft items
     * @returns List of objects containing cartItemName, itemName, updatedOn
     */
    getDraftItems: function(offset, limit, searchText) {
        var windowStart = parseInt(offset);
        var windowEnd = parseInt(offset) + parseInt(limit) + 1;
        var cartGr = new GlideRecordSecure(this.TABLES.CART_ITEM);
        cartGr.addQuery('cart.name', 'draft_items');
        cartGr.addQuery('cart.user', this.userID);
        if (searchText) {
            cartGr.addEncodedQuery('cat_item.nameLIKE' + searchText + '^ORcart_item_nameLIKE' + searchText, true);
        }
        cartGr.orderByDesc('sys_updated_on');
        cartGr.chooseWindow(windowStart, windowEnd);
        cartGr.query();

        var data = {};
        data.showMore = false;
        data.draftItems = [];
        var addedItems = 0;

        while (cartGr.next()) {
            if (addedItems == limit) {
                data.showMore = true;
                break;
            }

            data.draftItems.push({
                sysID: cartGr.getValue("sys_id"),
                cartItemName: cartGr.getDisplayValue("cart_item_name"),
                itemName: cartGr.getDisplayValue("cat_item"),
                timestamp: cartGr.getValue("sys_updated_on"),
                urlParams: '?id=sc_cat_item&edit=draft&sys_id=' + cartGr.getValue("sys_id")
            });
            addedItems += 1;
        }

        return data;
    },

    /**
     * Deletes draft item along with its associated attachments.
     * @param cartItemSysID Sys ID of the draft item
     */
    deleteDraftItem: function(cartItemSysID) {
        var cartRecord = new sn_sc.CartJS('draft_items');
        cartRecord.remove(cartItemSysID);

        var catalogUtil = new global.GlobalServiceCatalogUtil();
        catalogUtil.deleteAttachments("sc_cart_item", cartItemSysID);
    },

    /**
     * Returns the label color map for the request filter
     * @returns Object containing the label color map
     */
    getLabelColorBackground: function() {
        var labelColorMap = sn_ex_sp.RequestLabelColorConstants.LABEL_COLOR_MAP;
        var localisedLabelColorMap = {};

        if (this.sessionLanguage == 'en') {
            return labelColorMap;
        }
        for (var key in labelColorMap) {
            if (labelColorMap.hasOwnProperty(key)) {
                var translatedKey = gs.getMessage(key);
                localisedLabelColorMap[translatedKey] = labelColorMap[key];
            }
        }
        return localisedLabelColorMap;
    },

    // ------------------- Helper methods ------------------

    /**
     * Retrieves the data from the session cache
     * @param {string} cache_key session cache key
     * @returns Paserd JSON object from session cache or null if not found
     * @private
     */
    _getFromSessionCache: function(cache_key) {
        if (this.isCachingEnabled) {
            var cachedData = this.session.getClientData(cache_key);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }
        return null;
    },

    /**
     * Retrieves cached data from the scoped cache manager using the specified cache name and cache key.
     * @param {string} cache_name - The name of the cache to retrieve data from.
     * @param {string} cache_key - The key identifying the cached data.
     * @returns The parsed JSON object retrieved from the cache, or null if not found.
     * @private
     */
    _getFromScopedCache: function(cache_name, cache_key) {
        if (this.isCachingEnabled) {
            var cachedData = sn_scoped_cache.ScopedCacheManager.get(cache_name, cache_key);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        }
        return null;
    },

    /**
     * Stores data in the session cache using the specified cache key.
     * @param {string} cache_key The key to identify the cached data.
     * @param {Object} data The data to be cached.
     * @private
     */
    _putInSessionCache: function(cache_key, data) {
        if (this.isCachingEnabled) {
            this.session.putClientData(cache_key, JSON.stringify(data));
        }
    },

    /**
     * Stores data in the scoped cache using the specified cache name and cache key.
     * @param {string} cache_name The name of the cache to store data in.
     * @param {string} cache_key The key to identify the cached data.
     * @param {Object} data The data to be cached.
     * @private
     */
    _putInScopedCache: function(cache_name, cache_key, data) {
        if (this.isCachingEnabled) {
            sn_scoped_cache.ScopedCacheManager.put(cache_name, cache_key, JSON.stringify(data));
        }
    },

    /**
     * Checks if the current user satisfies the user criterias specified in the GlideRecord.
     * @param configGr GlideRecord object from table sn_ex_sp_request_filter_definition or sn_ex_sp_request_filter_conditions
     * @returns Boolean
     */
    _satisfiesUserCriteria: function(configGr) {
        if (!configGr.not_available_for && !configGr.available_for) {
            return true;
        }
        if (configGr.not_available_for && sn_uc.UserCriteriaLoader.userMatches(this.userID, configGr.not_available_for.split(','))) {
            return false;
        }
        if (configGr.available_for)
            return sn_uc.UserCriteriaLoader.userMatches(this.userID, configGr.available_for.split(','));
        else
            return true;
    },

    /**
     * Returns a list of matching Request Filter Definitions.
     * @param isView boolean indiciating if the filter definition is for a view
     * @returns Array of objects containing sys_id,name,filter_type,is_multiselect,search_field,reference_table,reference_condition
     */
    _getRequestFilterDefinitions: function(isView) {
        var definitions = [];
        var cachedDefinitions;

        cachedDefinitions = this._getFromScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_DEFINITIONS);

        if (cachedDefinitions) {
            definitions = cachedDefinitions.filter(function(def) {
                return def.render_as_view == isView && this._satisfiesUserCriteria(def);
            }, this);
            return definitions;
        }

        var definitionGR = new GlideRecord(this.TABLES.REQUEST_FILTER_DEFINITION);

        var encodedQuery = "active=true";
        encodedQuery += "^all_portals=true";
        if (this.portalSysID) {
            encodedQuery += "^ORportalsLIKE" + this.portalSysID;
        }
        definitionGR.addEncodedQuery(encodedQuery);

        definitionGR.orderBy("order");
        definitionGR.orderBy("sys_updated_on");
        definitionGR.query();

        while (definitionGR.next()) {
            definitions.push({
                sys_id: definitionGR.getValue('sys_id'),
                name: definitionGR.getDisplayValue('name'),
                filter_type: definitionGR.getValue('filter_type'),
                is_multiselect: definitionGR.getValue('is_multiselect') == '1',
                search_field: definitionGR.getValue('search_field'),
                reference_table: definitionGR.getValue('reference_table'),
                reference_condition: definitionGR.getValue('reference_condition'),
                available_for: definitionGR.getValue('available_for'),
                not_available_for: definitionGR.getValue('not_available_for'),
                render_as_view: definitionGR.getValue('render_as_view') == '1',
            });
        }

        this._putInScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_DEFINITIONS, definitions);

        definitions = definitions.filter(function(def) {
            return def.render_as_view == isView && this._satisfiesUserCriteria(def);
        }, this);

        return definitions;
    },

    /**
     * Returns a list of matching Request Filter Configurations.
     * @param filterDefnSysID is the sysID of the linked Request Filter Definition record
     * @returns Array of objects containing sys_id, label, selected, reference_table, request_filter_column
     */
    _getFilterConfigurations: function(filterDefnSysID) {
        var configurations = [];
        var cachedConfigurations = this._getFromScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_CONFIGURATIONS);

        if (cachedConfigurations) {
            configurations = cachedConfigurations.filter(function(config) {
                return (
                    config.req_filter_definition == filterDefnSysID &&
                    this._satisfiesUserCriteria(config)
                );
            }, this);
            return configurations;
        }

        var configGR = new GlideRecord(this.TABLES.REQUEST_FILTER_CONFIG);
        configGR.addActiveQuery();
        configGR.orderBy('order');
        configGR.orderBy('sys_created_on');
        configGR.query();

        while (configGR.next()) {
            var config = {
                sys_id: configGR.getValue('sys_id'),
                label: configGR.getDisplayValue('label'),
                selected: configGR.getValue('apply_on_load') == '1',
                reference_table: configGR.getValue('reference_table'),
                request_filter_column: configGR.getValue('request_filter_column'),
                available_for: configGR.getValue('available_for'),
                not_available_for: configGR.getValue('not_available_for'),
                req_filter_definition: configGR.getValue('req_filter_definition'),
            };
            configurations.push(config);
        }

        this._putInScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_CONFIGURATIONS, configurations);

        configurations = configurations.filter(function(config) {
            return config.req_filter_definition == filterDefnSysID && this._satisfiesUserCriteria(config);
        }, this);

        return configurations;
    },

    /**
     * Returns a list of matching Request Filter Conditions.
     * @param filterConfigSysID is the sysID of the linked Request filter config record
     * @returns Object. {"table_1": "encoded_query_string", "table_2": "encoded_query_string"}
     */
    _getFilterConditions: function(filterConfigSysID) {
        var cachedConditions = this._getFromScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_CONDITIONS);
        if (cachedConditions && cachedConditions[filterConfigSysID]) {
            return cachedConditions[filterConfigSysID];
        }

        var filterConditionGr = new GlideRecord(this.TABLES.REQUEST_FILTER_CONDITION);
        filterConditionGr.addActiveQuery();
        filterConditionGr.query();

        var configTableCondMap = {};
        while (filterConditionGr.next()) {
            var configId = filterConditionGr.getValue('filter_config');
            var table = filterConditionGr.getValue('table');
            var conditions = filterConditionGr.getValue('filter');

            if (!configTableCondMap[configId]) {
                configTableCondMap[configId] = {};
            }

            if (table in configTableCondMap[configId]) {
                configTableCondMap[configId][table] = configTableCondMap[configId][table] + '^' + conditions;
            } else {
                configTableCondMap[configId][table] = conditions;
            }
        }

        this._putInScopedCache(this.CACHE_NAME, this.CACHE_KEYS.FILTER_CONDITIONS, configTableCondMap);

        return configTableCondMap[filterConfigSysID];
    },

    /**
     * Method to accept the current viewFilter and applied UI filters and merge all the conditions on a table level
     * @param selectedViewFilterConfigID SysID of the RequestFilterConfig record corresponding to the View Filter for the portal
     * @param appliedFilters Object containing the filter details that are applied on the UI.
     * {"req_filter_definition_1": {"filterType": [choice|reference], "selectedOptions: [<list of selected request filter config ids>]"}}
     * @returns Object {"table_1": {conditions: "encoded_query", titleField: <fieldname>, descriptionFields: [<list of fields>], portalPage: "name of portal page"}}
     */
    _getTableConfiguration: function(selectedViewFilterConfigID, appliedFilters) {
        var tableConfigMap = this._getTableConfigFromRequestSource(selectedViewFilterConfigID);
        appliedFilters = appliedFilters || {};

        // Flatten the conditions for tables by merging conditions from applied filters and request source conditions
        var appliedTableFilters = this._getTableFiltersFromAppliedFilters(appliedFilters);

        // Filters would be applied on intersection of tables present in request source and applied filter conditions. 
        // If filters are not applied then tables from request source and selected tab are considered
        var commonTables = Object.keys(appliedFilters).length ?
            Object.keys(tableConfigMap).filter(function(value) {
                return Object.keys(appliedTableFilters).indexOf(value) !== -1;
            }) :
            Object.keys(tableConfigMap);

        var tableConfig = {};
        commonTables.forEach(function(tableName) {
            tableConfig[tableName] = {
                titleField: tableConfigMap[tableName].titleField,
                descriptionFields: tableConfigMap[tableName].descriptionFields,
                portalPage: tableConfigMap[tableName].portalPage,
                conditions: "",
            };
            if (tableConfigMap[tableName].conditions && appliedTableFilters[tableName]) {
                tableConfig[tableName].conditions = tableConfigMap[tableName].conditions + '^' + appliedTableFilters[tableName];
            } else if (tableConfigMap[tableName].conditions) {
                tableConfig[tableName].conditions = tableConfigMap[tableName].conditions;
            } else if (appliedTableFilters[tableName]) {
                tableConfig[tableName].conditions = appliedTableFilters[tableName];
            }
        });

        return tableConfig;
    },

    /**
     * Return conditions and display fields for tables based on request source configuration
     * @param selectedViewFilterConfigID SysID of the RequestFilterConfig record corresponding to the View Filter for the portal
     * @returns Object {"table_1": {conditions: "encoded_query", titleField: <fieldname>, descriptionFields: [<list of fields>], portalPage: "name of portal page"}}
     */
    _getTableConfigFromRequestSource: function(selectedViewFilterConfigID) {
        var tableConfigMap = {};

        var selectedViewCacheKey = this.CACHE_KEYS.REQUEST_SOURCE + "_" + selectedViewFilterConfigID;
        tableConfigMap = this._getFromScopedCache(this.CACHE_NAME, selectedViewCacheKey);

        if (tableConfigMap && Object.keys(tableConfigMap).length) {
            return tableConfigMap;
        } else {
            tableConfigMap = {};
        }

        var selectedViewFilterConditions = selectedViewFilterConfigID ? this._getFilterConditions(selectedViewFilterConfigID) : {};

        var requestSourceGr = new GlideRecord(this.TABLES.REQUEST_SOURCE);
        requestSourceGr.addActiveQuery();
        // [Intersection] Consider only those tables from request source which have a condition defined in the selected view filter
        if (!gs.nil(selectedViewFilterConditions) && Object.keys(selectedViewFilterConditions).length) {
            requestSourceGr.addQuery("table", "IN", Object.keys(selectedViewFilterConditions).join(","));
        } else {
            return tableConfigMap;
        }
        requestSourceGr.addEncodedQuery("portalsIN" + this.portalSysID + "^ORall_portals=true");
        requestSourceGr.orderBy("order");
        requestSourceGr.orderBy('sys_updated_on');
        requestSourceGr.query();

        while (requestSourceGr.next()) {
            var sourceTable = requestSourceGr.getValue('table');
            var sourceTableFilters = requestSourceGr.getValue('filter') || "";
            var selectedViewFilterCondition = selectedViewFilterConditions[sourceTable];
            tableConfigMap[sourceTable] = tableConfigMap[sourceTable] || {};
            tableConfigMap[sourceTable].conditions = sourceTableFilters;
            if (selectedViewFilterCondition) {
                // Merge conditions of selected view filter and request source
                tableConfigMap[sourceTable].conditions += "^" + selectedViewFilterCondition;
            }
            tableConfigMap[sourceTable].titleField = requestSourceGr.getValue('title_field');
            tableConfigMap[sourceTable].descriptionFields = requestSourceGr.getValue('description_fields') ? requestSourceGr.getValue('description_fields').split(",") : [];
            tableConfigMap[sourceTable].portalPage = requestSourceGr.getDisplayValue('portal_page');
        }

        this._putInScopedCache(this.CACHE_NAME, selectedViewCacheKey, tableConfigMap);

        return tableConfigMap;
    },

    /**
     * Returns merged conditions for each table by combining the UI filters
     * @param appliedFilters Object containing the filter details that are applied on the UI.
     * {"req_filter_definition_1": {"filterType": [choice|reference], "selectedOptions: [<list of selected request filter config ids>]"}}
     * @returns Object {"table_1": "encoded query", "table_2": "encoded query"}
     */
    _getTableFiltersFromAppliedFilters: function(appliedFilters) {

        var filterConditions = [];

        for (var filterDefnID in appliedFilters) {
            var filterType = appliedFilters[filterDefnID].filterType;
            var selectedValues = appliedFilters[filterDefnID].selectedOptions;

            if (filterType == this.FILTER_TYPES.CHOICE) {
                filterConditions.push(this._getTableFiltersFromChoiceFilter(filterDefnID, selectedValues));
            }
            if (filterType == this.FILTER_TYPES.REFERENCE) {
                filterConditions.push(this._getTableFiltersFromReferenceFilter(filterDefnID, selectedValues));
            }
        }

        // Filter only those tables which are defined in all the applied filters (intersection)
        var tableConditionsMap = {};
        filterConditions.forEach(function(filterCond) {
            Object.keys(filterCond).forEach(function(tableName) {
                tableConditionsMap[tableName] = tableConditionsMap[tableName] ? tableConditionsMap[tableName] : [];
                tableConditionsMap[tableName].push(filterCond[tableName]);
            });
        });

        var tableFilters = {};
        Object.keys(tableConditionsMap).forEach(function(tableName) {
            if (tableConditionsMap[tableName].length == filterConditions.length) {
                tableFilters[tableName] = tableConditionsMap[tableName].join("^");
            }
        });

        // filter non-empty conditions
        Object.keys(tableConditionsMap).forEach(function(tableName) {
            if (tableConditionsMap[tableName].length == filterConditions.length) {
                var nonEmptyConditions = tableConditionsMap[tableName].filter(function(condition) {
                    return Boolean(condition);
                });
                tableFilters[tableName] = nonEmptyConditions.join("^");
            }
        });

        return tableFilters;

    },

    /**
     * For a given choice filter, returns an object containing the tables and the corresponding filter conditions
     * @param filterDefinitionID SysID of the RequestFilterDefinition
     * @param selectedConfigIDs List of SysIDs of the selected RequestFilterConfig records
     * @returns Object {"table_1": "encoded query", "table_2": "encoded query"}
     */
    _getTableFiltersFromChoiceFilter: function(filterDefinitionID, selectedConfigIDs) {
        var tableFilters = {};
        var filterDefinition = this._getRequestFilterDefinitions(false);
        filterDefinition = filterDefinition.filter(function(def) {
            return def.sys_id == filterDefinitionID;
        });

        if (filterDefinition === null || filterDefinition === undefined || filterDefinition.length == 0)
            return tableFilters;

        filterDefinition = filterDefinition[0];

        var filterConfigurations = this._getFilterConfigurations(filterDefinition.sys_id);
        filterConfigurations = filterConfigurations.filter(function(config) {
            return selectedConfigIDs.indexOf(config.sys_id) !== -1;
        });

        filterConfigurations.forEach(function(filterConfig) {
            var filterConditions = this._getFilterConditions(filterConfig.sys_id);
            if (filterConditions && Object.keys(filterConditions).length) {
                Object.keys(filterConditions).forEach(table => {
                    var conditions = filterConditions[table];
                    if (conditions) {
                        tableFilters[table] = tableFilters[table] ? tableFilters[table] + '^OR' + conditions : conditions;
                    } else {
                        tableFilters[table] = tableFilters[table] ? tableFilters[table] : '';
                    }
                });
            }
        }, this);

        return tableFilters;
    },

    /**
     * For a given reference filter, returns an object containing the tables and the corresponding filter conditions
     * @param filterDefinitionID SysID of the RequestFilterDefinition
     * @param selectedReferenceIDs List of SysIDs of the selected reference records
     * @returns Object {"table_1": "encoded query", "table_2": "encoded query"}
     */
    _getTableFiltersFromReferenceFilter: function(filterDefinitionID, selectedReferenceIDs) {
        var filterConfigurations = this._getFilterConfigurations(filterDefinitionID);
        var tableFilters = {};

        filterConfigurations.forEach(function(filterConfig) {
            var referenceTable = filterConfig.reference_table;
            var referenceTableField = filterConfig.request_filter_column;

            if (!referenceTable || !referenceTableField) {
                return;
            }
            var cond;
            if (selectedReferenceIDs.length === 1) {
                cond = referenceTableField + "=" + selectedReferenceIDs[0];
            } else {
                cond = referenceTableField + "IN" + selectedReferenceIDs.join(",");
            }
            tableFilters[referenceTable] = tableFilters[referenceTable] ? tableFilters[referenceTable] + "^" + cond : cond;
        }, this);

        return tableFilters;
    },

    /**
     * Sorts the request results based on the timestamp in descending order
     * @param requests Array of request objects
     * @private
     */
    _sortRequestResults: function(requests) {
        requests.sort(function(a, b) {
            return new GlideDateTime(b.timestamp).getNumericValue() - new GlideDateTime(a.timestamp).getNumericValue();
        });
    },

    copyValueFromOldToNewColumn: function() {
        var oldColumn = 'ref_filter_col';
        var newColumn = 'request_filter_column';

        var gr = new GlideRecord('sn_ex_sp_request_filter_config');
        gr.addQuery(oldColumn, '!=', '');
        gr.query();
        while (gr.next()) {
            gr.setValue(newColumn, gr.getValue(oldColumn));
            gr.update();
        }
    },

    type: 'RequestUtilSNC'
};
