function include({ imports }) {
    //unifiedMapUtils client script include
    const _rightPanelSelectedTabIndexPrefName = "cmdb_ws.unifiedmap.rightPanelSelectedTabIndex";
    const _rightPanelSelectedTabIndexEditModePrefName = "cmdb_ws.unifiedmap.rightPanelSelectedTabIndexEditMode";
    const _rightPanelNonCollapsedPositionPrefName = "cmdb_ws.unifiedmap.rightPanelNonCollapsedPosition";
    const _rightPanelIsCollapsedPrefName = "cmdb_ws.unifiedmap.rightPanelIsCollapsed";
    const _rightPanelCurrentPositionPrefName = "cmdb_ws.unifiedmap.rightPanelCurrentPosition";
    const _rightPanelMinWidthPositionPrefName = "cmdb_ws.unifiedmap.rightPanelMinWidthPosition";
    const _rightPanelAddCiToMapPanelMinWidthPositionPrefName = "cmdb_ws.unifiedmap.rightPanelAddCiToMapPanelMinWidthPosition";
    const _relatedItemsExcludedCategoriesPrefName = "sn.cmdb.ws.node.map.user.excluded.rel.items";
    const _relatedItemsSortOrderPrefName = "sn.cmdb.ws.node.map.user.sort.order.rel.items";

    const _rightPanelCollapsedPosition = '100';
    const _rightPanelMinWidthPositionMinPixels = '48';
    const _rightPanelMinWidthPositionMinRatioCollapsed = '0';
    const _rightPanelMinWidthPositionMinRatioNonCollapsed = '15';

    //first time defaults
    const _rightPanelSelectedTabIndexDefault = 0;
    const _rightPanelIsCollapsedDefault = true;
    const _rightPanelNonCollapsedPositionDefault = '80';
    const _rightPanelCurrentPositionDefault = '100';
    const _rightPanelMinWidthPositionDefault = JSON.stringify({
        minRatio: 0,
        minPixels: 48
    });

    const _rightPanelMinWidthPositioAddCiToMapPanelDefault = JSON.stringify({
        minRatio: 40,
        minPixels: 450
    });

    const _emptySysIdKey = 'emptysysid';
    const _ALERT = {
        TYPE: {
            DISMISS: 'dismiss',
            ACKNOWLEDGE: 'acknowledge',
            OPEN: 'open'
        },
        STATUS: {
            INFO: 'info',
            CRITICAL: 'critical',
            WARNING: 'warning',
            POSITIVE: 'positive'
        },
        ICON: {
            INFO_CIRCLE_OUTLINE: 'Info Circle Outline',
            TRIANGLE_EXCLAMATION_OUTLINE: 'Triangle Exclamation Outline'
        }
    };

    //filter (and levels) stuff
    const _defaultLevels = 3;
    const _DELIMITER = '|-|';
    const _CATEGORY = {
        SHOW_FILTERED_ITEMS: 'showFilteredItems',
        LAYER: 'layer',
        RELATIONSHIP: 'relationship',
        REFERENCE: 'reference',
        ATTRIBUTE: 'attribute'
    };
    const _ATTRIBUTE = {
        CLASS: 'Class',
        DISCOVERY_SOURCE: 'discovery_source',
        LOCATION: 'location',
        OWNED_BY: 'owned_by'
    };
    const _MAP_TYPE = {
        DEPENDENCY: 'dependency',
        SERVICE_INSTANCE: 'service_instance'
    };

    const _SELECT_ALL = 'Select All'; //this is the actual key, and not to be confused with the translated value for 'Select All' in api.state.translations.SELECT_ALL
    const _BUSINESS = 'Business';
    const _APPLICATION_SERVICE = 'Application Service';
    const _APPLICATION = 'Application';
    const _INFRASTRUCTURE = 'Infrastructure';
    const _BUSINESS_KEY = 'business';
    const _APPLICATION_SERVICE_KEY = 'application_service';
    const _INFRASTRUCTURE_KEY = 'infrastructure';
    const _APPLICATION_KEY = 'application';
    const _SELECT_ALL_KEY = 'select_all';
    const _LAYER = {
        SELECT_ALL: {
            NAME: _SELECT_ALL,
            ID: _CATEGORY.LAYER + _DELIMITER + _SELECT_ALL,
            KEY: _SELECT_ALL_KEY
        },
        BUSINESS: {
            NAME: _BUSINESS,
            ID: _CATEGORY.LAYER + _DELIMITER + _BUSINESS,
            KEY: _BUSINESS_KEY
        },
        APPLICATION_SERVICE: {
            NAME: _APPLICATION_SERVICE,
            ID: _CATEGORY.LAYER + _DELIMITER + _APPLICATION_SERVICE,
            KEY: _APPLICATION_SERVICE_KEY
        },
        APPLICATION: {
            NAME: _APPLICATION,
            ID: _CATEGORY.LAYER + _DELIMITER + _APPLICATION,
            KEY: _APPLICATION_KEY
        },
        INFRASTRUCTURE: {
            NAME: _INFRASTRUCTURE,
            ID: _CATEGORY.LAYER + _DELIMITER + _INFRASTRUCTURE,
            KEY: _INFRASTRUCTURE_KEY
        }
    };

    const _DEFAULT_ICON = 'configuration-item-outline';

    const _MAP_CONTAINER_DEFAULT_STYLE = {
        "height": "100%"
    };
    const _MAP_CONTAINER_EDIT_STYLE = {
        "border-color": "rgb(var(--now-color_brand--primary))",
        "border-style": "solid",
        "border-width": "var(--now-static-space--xs)",
        "box-shadow": "var(--now-static-drop-shadow--md)",
        "height": "calc(100% - 2*var(--now-static-space--xs)",
        "margin-bottom": "var(--now-static-space--xs)"
    };
    const _generateUniqueId = () => {
        const timestamp = Date.now().toString(36); // Convert timestamp to base 36
        const random = Math.random().toString(36).substr(2, 9); // Generate random string in base 36

        return timestamp + random;
    }

    const _getHash = (sysids, seed = 0) => {
        if (!Array.isArray(sysids) || sysids.length === 0) {
            return _emptySysIdKey;
        } else if (sysids.length === 1) {
            // this is a single sys_id which is unique so return it
            return sysids[0];
        }
        const str = sysids.join();
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString();
    };

    const _getConnections = (ciData) => {
        return Object.keys(ciData).map(sysid => ciData[sysid].connections).flat(1) || [];
    };

    const _logErrorToConsole = (msgs) => {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        console.error('Unified Map: ', ...msgs);
    };

    const _logToConsole = (msgs) => {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        console.log('Unified Map: ', ...msgs);
    };

    const _cloneDeep = (entity, cache = new WeakMap) => {
        //this clones array items too
        const referenceTypes = ['Array', 'Object', 'Map', 'Set', 'Date'];
        const entityType = Object.prototype.toString.call(entity);
        if (
            !new RegExp(referenceTypes.join('|')).test(entityType) ||
            entity instanceof WeakMap ||
            entity instanceof WeakSet
        ) return entity;
        if (cache.has(entity)) {
            return cache.get(entity);
        }
        const c = new entity.constructor;

        if (entity instanceof Map) {
            entity.forEach((value, key) => c.set(_cloneDeep(key), _cloneDeep(value)));
        }
        if (entity instanceof Set) {
            entity.forEach((value) => c.add(_cloneDeep(value)));
        }
        if (entity instanceof Date) {
            return new Date(entity);
        }
        cache.set(entity, c);
        return Object.assign(c, ...Object.keys(entity).map((prop) => ({
            [prop]: _cloneDeep(entity[prop], cache)
        })));
    };

    const _mergeDeep = (target, source) => {
        let output = Object.assign({}, target);
        if (_isObject(target) && _isObject(source)) {
            Object.keys(source).forEach(key => {
                if (_isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = _mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    };

    const _isObject = (item) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    const _isEqual = (a, b) => {
        if (a == b) {
            return true;
        }
        if (a && !b || !a && b) {
            return false;
        }
        if (!(a instanceof Object) || !(b instanceof Object)) {
            return false;
        }
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        if (aKeys.length === 0 && bKeys.length === 0) {
            return true;
        } // two empty objects are equal
        for (let i = 0; i < aKeys.length; i++) {
            if (!_isEqual(a[aKeys[i]], b[aKeys[i]])) {
                return false;
            }
        }
        return true;
    };

    const _addAlerts = (alerts, api, helpers) => {
        /* example format to supply (id is generated if not supplied):
            [{
                status: ALERT.STATUS.INFO,
                icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
                content: translatedMsg,
                action: { type: ALERT.TYPE.DISMISS },
                autoDismiss: false
            }]
        */
        alerts.forEach(n => n.id = (n.id || _generateUniqueId()));
        api.emit('SN_UNIFIED_MAP_CTRL#ADD_ALERTS', { alerts: alerts });
        api.setState('alerts', alerts.concat(api.state.alerts));

        //auto dismiss any after 5 seconds that have flag set
        var autoDismiss = alerts.filter(o => o.autoDismiss);
        if (autoDismiss.length) {
            helpers.timing.setTimeout(() => {
                _removeAlerts(autoDismiss , api);
            }, 5000);
        }
    };

    const _removeAlerts = (alerts, api) => {
        api.emit('SN_UNIFIED_MAP_CTRL#REMOVE_ALERTS', { alerts: alerts });
        var remainingAlerts = api.state.alerts.filter(({ id: id1 }) => !alerts.some(({ id: id2 }) => id2 === id1));
        api.setState('alerts', remainingAlerts);
    };

    const _buildToolTipText = (label, value, prevValue) => {
        const currentLabelValue = label + ": " + value;
        if (prevValue) {
            if (!prevValue.includes(currentLabelValue)) {
              prevValue += "<br/>" + currentLabelValue;
            }
            return prevValue;
          }
        return currentLabelValue;
    };

    const _buildUserPrefWithAppId = function(preferenceKeys, appId) {
        if (!preferenceKeys?.length) return {};
        return preferenceKeys.reduce((acc, baseKey) => {
            acc[baseKey] = `${baseKey}_${appId}`;
            return acc;
        }, {});
    }


    return {
        generateUniqueId: _generateUniqueId,
        getHash: _getHash,
        getConnections: _getConnections,
        logErrorToConsole: _logErrorToConsole,
        logToConsole: _logToConsole,
        cloneDeep: _cloneDeep,
        mergeDeep: _mergeDeep,
        isEqual: _isEqual,
        addAlerts: _addAlerts,
        removeAlerts: _removeAlerts,
        buildToolTipText: _buildToolTipText,
        buildUserPrefWithAppId: _buildUserPrefWithAppId,

        rightPanelCollapsedPosition: _rightPanelCollapsedPosition,
        rightPanelMinWidthPositionMinPixels: _rightPanelMinWidthPositionMinPixels,
        rightPanelMinWidthPositionMinRatioCollapsed: _rightPanelMinWidthPositionMinRatioCollapsed,
        rightPanelMinWidthPositionMinRatioNonCollapsed: _rightPanelMinWidthPositionMinRatioNonCollapsed,

        rightPanelNonCollapsedPositionPrefName: _rightPanelNonCollapsedPositionPrefName,
        rightPanelIsCollapsedPrefName: _rightPanelIsCollapsedPrefName,
        rightPanelCurrentPositionPrefName: _rightPanelCurrentPositionPrefName,
        rightPanelSelectedTabIndexPrefName: _rightPanelSelectedTabIndexPrefName,
        rightPanelSelectedTabIndexEditModePrefName: _rightPanelSelectedTabIndexEditModePrefName,
        rightPanelMinWidthPositionPrefName: _rightPanelMinWidthPositionPrefName,
        rightPanelAddCiToMapPanelMinWidthPositionPrefName: _rightPanelAddCiToMapPanelMinWidthPositionPrefName,
        relatedItemsExcludedCategoriesPrefName: _relatedItemsExcludedCategoriesPrefName,
        relatedItemsSortOrderPrefName: _relatedItemsSortOrderPrefName,

        rightPanelSelectedTabIndexDefault: _rightPanelSelectedTabIndexDefault,
        rightPanelIsCollapsedDefault: _rightPanelIsCollapsedDefault,
        rightPanelNonCollapsedPositionDefault: _rightPanelNonCollapsedPositionDefault,
        rightPanelCurrentPositionDefault: _rightPanelCurrentPositionDefault,
        rightPanelMinWidthPositionDefault: _rightPanelMinWidthPositionDefault,
        rightPanelMinWidthPositioAddCiToMapPanelDefault: _rightPanelMinWidthPositioAddCiToMapPanelDefault,

        emptySysIdKey: _emptySysIdKey,
        //filter (and levels) stuff
        defaultLevels: _defaultLevels,
        DELIMITER: _DELIMITER,
        SELECT_ALL: _SELECT_ALL,
        ATTRIBUTE: _ATTRIBUTE,
        LAYER: _LAYER,
        CATEGORY: _CATEGORY,
        DEFAULT_ICON: _DEFAULT_ICON,
        ALERT: _ALERT,
        CMDBUM_ERROR_CODES: _CMDBUM_ERROR_CODES,
        MAP_TYPE: _MAP_TYPE,
        MAP_CONTAINER_DEFAULT_STYLE: _MAP_CONTAINER_DEFAULT_STYLE,
        MAP_CONTAINER_EDIT_STYLE: _MAP_CONTAINER_EDIT_STYLE
    };
}
