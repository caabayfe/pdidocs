var DiscoveryApiAttribute;

(function() {
    DiscoveryApiAttribute = {
        getCIAttributes: getCIAttributes,
        insertCIAttributeHistoryForRange: insertCIAttributeHistoryForRange,
        insertCIAttributeHistoryForRangeList: insertCIAttributeHistoryForRangeList,
        insertCIAttributeHistoryForIP: insertCIAttributeHistoryForIP,
        getCIAttributeHistoryGr: getCIAttributeHistoryGr,
        reconcileCIAttributes: reconcileCIAttributes,
        populateAttributesToCiItems: populateAttributesToCiItems,
        deleteCIAttributeHistory: deleteCIAttributeHistory,
        deleteCIScheduleAttributeHistory: deleteCIScheduleAttributeHistory
    };

    /**
     * Get CI attributes configured for a specific discovery scope
     * @param scopeId {String} - Discovery scope sys_id (discovery_attribute.scope)
     * @returns {Array} - Array of attribute objects with structure:
     *                    [{ ci_class, field, value, attribute }, ...]
     *                    Returns empty array if scopeId is nil or no attributes found
     */
    function getCIAttributes(scopeId) {
        if (JSUtil.nil(scopeId))
            return [];

        var attributeArray = [];
        var gr = new GlideRecord('discovery_attribute');
        gr.addQuery('attr_scope', scopeId);
        gr.addQuery('action', 'select_ci_field');
        gr.query();

        while (gr.next()) {
            var targetTable = gr.getValue('target_table');
            var targetField = gr.getValue('target_field');
            var fieldValue = gr.getValue('value_reference') || gr.getValue('value_static');
            var sysId = gr.getUniqueValue();

            attributeArray.push({
                ci_class: targetTable,
                field: targetField,
                value: fieldValue + '',
                attribute: sysId
            });
        }

        return attributeArray;
    }

    /**
     * Insert CI attribute history for schedule or IP range
     * @param scheduleId {String} - Discovery schedule sys_id
     * @param attributeValue {String} - JSON string of attribute values
     * @param startIp {String} - (Optional) Starting IP address for range scope
     * @param endIp {String} - (Optional) Ending IP address for range scope
     * @returns {String} - Inserted record sys_id
     * 
     * Usage:
     * - Schedule: insertCIAttributeHistoryForRange(scheduleId, attributeValue)
     * - IP Range: insertCIAttributeHistoryForRange(scheduleId, attributeValue, startIp, endIp)
     */
    function insertCIAttributeHistoryForRange(scheduleId, attributeValue, startIp, endIp) {
        var scope = (JSUtil.notNil(startIp) && JSUtil.notNil(endIp)) ? 'range' : 'schedule';

        if (JSUtil.nil(scheduleId) || JSUtil.nil(attributeValue) || (scope !== "schedule" && attributeValue == "[]"))
            return;

        var gr = new GlideRecord('discovery_attribute_history');
        gr.discovery_schedule = scheduleId;
        gr.attribute_value = attributeValue;
        gr.attr_scope = scope;
        gr.action = 'select_ci_field';

        if (scope === 'range') {
            gr.start_ip_address = startIp;
            gr.end_ip_address = endIp;
        }

        return gr.insert();
    }

    /**
     * Insert CI attribute history for IP range list
     * @param scheduleId {String} - Discovery schedule sys_id
     * @param attributeValue {String} - JSON string of attribute values
     * @param rangeItemId {String} - Range item sys_id
     * @returns {String} - Inserted record sys_id
     */
    function insertCIAttributeHistoryForRangeList(scheduleId, attributeValue, rangeItemId) {
        if (JSUtil.nil(scheduleId) || JSUtil.nil(attributeValue) || JSUtil.nil(rangeItemId) || attributeValue == "[]")
            return;

        var gr = new GlideRecord('discovery_attribute_history');
        gr.discovery_schedule = scheduleId;
        gr.attribute_value = attributeValue;
        gr.attr_scope = 'range';
        gr.action = 'select_ci_field';
        gr.ip_address_list = rangeItemId;

        return gr.insert();
    }

    /**
     * Insert CI attribute history for specific IP address
     * @param scheduleId {String} - Discovery schedule sys_id
     * @param attributeValue {String} - JSON string of attribute values
     * @param ip {String} - IP address
     * @returns {String} - Inserted record sys_id
     */
    function insertCIAttributeHistoryForIP(scheduleId, attributeValue, ip) {
        if (JSUtil.nil(scheduleId) || JSUtil.nil(attributeValue) || JSUtil.nil(ip) || attributeValue == "[]")
            return;

        var gr = new GlideRecord('discovery_attribute_history');
        gr.discovery_schedule = scheduleId;
        gr.attribute_value = attributeValue;
        gr.action = 'select_ci_field';
        gr.attr_scope = 'ip';
        gr.ip = ip;

        return gr.insert();
    }

    /**
     * Get CI attribute history record based on scope and location
     * Handles three scope types: 'schedule', 'ip', and 'range'
     * For range scope with IPv6, automatically falls back to IP list lookup
     * 
     * @param scheduleId {String} - Discovery schedule sys_id
     * @param scope {String} - Scope type: 'schedule', 'ip', or 'range'
     * @param ip {String} - (Optional) IP address for 'ip' or 'range' scope
     * @param rangeItemId {String} - (Optional) Range item sys_id for targeted range lookup
     * @returns {GlideRecord} - GlideRecord positioned on matching record, or undefined if not found
     */
    function getCIAttributeHistoryGr(scheduleId, scope, ip, rangeItemId) {
        if (JSUtil.nil(scope) || JSUtil.nil(scheduleId))
            return;

        var gr = new GlideRecord('discovery_attribute_history');
        gr.addQuery('discovery_schedule', scheduleId);
        gr.addQuery('attr_scope', scope);
        gr.addQuery('action', 'select_ci_field');

        switch (scope) {
            case 'schedule':
                gr.query();
                if (gr.next())
                    return gr;
                break;
            case 'ip':
                gr.addQuery('ip', ip);
                gr.query();
                if (gr.next())
                    return gr;
                break;
            case 'range':
                // For IPv4, check if IP falls within a range or a list
                var ipAddress = SncIPAddress.fromString(ip);

                // For IPv6 addresses or invalid IPs, skip range query and check IP list directly
                if (!ipAddress || !ipAddress.isV4())
                    return getCIAttributeHistoryForIpList(ip, scheduleId, rangeItemId);

                var ipExpanded = ipAddress.toExpanded();
                gr.addQuery('start_ip_address', '<=', ipExpanded);
                gr.addQuery('end_ip_address', '>=', ipExpanded);
                gr.query();
                if (gr.next())
                    return gr;
                else
                    return getCIAttributeHistoryForIpList(ip, scheduleId, rangeItemId);
        }
        return;
    }

    function getCIAttributeHistoryForIpList(ip, scheduleId, rangeItemId) {
        var gr = new GlideRecord('discovery_attribute_history');
        gr.addQuery('discovery_schedule', scheduleId);
        gr.addQuery('attr_scope', 'range');
        gr.addQuery('action', 'select_ci_field');
        if (JSUtil.nil(rangeItemId)) {
            gr.addNotNullQuery('ip_address_list');
            gr.query();
            while (gr.next()) {
                var currentRangeItemId = gr.getValue('ip_address_list');
                if (ipExistsInRangeItem(currentRangeItemId, ip))
                    return gr;
            }
        } else {
            gr.addQuery('ip_address_list', rangeItemId);
            gr.query();
            if (gr.next()) {
                if (ipExistsInRangeItem(rangeItemId, ip))
                    return gr;
            }
        }

        return;
    }

    function ipExistsInRangeItem(rangeItemId, ip) {
        var gr = new GlideRecord('discovery_range_item_ip');
        gr.addQuery('item_parent', rangeItemId);
        gr.addQuery('ip_address', ip);
        gr.query();

        return gr.hasNext();
    }

    /**
     * Delete all CI attribute history records for a discovery schedule
     * Only deletes records with action='select_ci_field'
     * Removes records from all scopes (schedule, ip, range)
     * 
     * @param scheduleId {String} - Discovery schedule sys_id
     * @returns {void}
     */
    function deleteCIAttributeHistory(scheduleId) {
        var gr = new GlideRecord('discovery_attribute_history');
        gr.addQuery('discovery_schedule', scheduleId);
        gr.addQuery('action', 'select_ci_field');
        gr.deleteMultiple();
    }

    /**
     * Delete CI attribute history records for schedule scope only
     * Only deletes records with scope='schedule' and action='select_ci_field'
     * Preserves IP and range level attribute history
     * 
     * @param scheduleId {String} - Discovery schedule sys_id
     * @returns {void}
     */
    function deleteCIScheduleAttributeHistory(scheduleId) {
        var gr = new GlideRecord('discovery_attribute_history');
        gr.addQuery('discovery_schedule', scheduleId);
        gr.addQuery('attr_scope', 'schedule');
        gr.addQuery('action', 'select_ci_field');
        // Expecting to delete single record 
        gr.deleteMultiple();
    }

    /**
     * Reconcile CI attributes from different scopes
     * 
     * Attributes are prioritized by scope: schedule (lowest) < range set < range item (highest)
     * When the same ci_class.field combination appears in multiple scopes, only the highest
     * priority version is included in the result.
     * 
     * @param scheduleAttrs {Array} - Attributes from schedule scope (lowest priority)
     * @param rangeItemAttrs {Array} - Attributes from range item scope (highest priority)
     * @param rangeSetAttrs {Array} - Attributes from range set scope (medium priority)
     * @returns {Array} - Returns array of reconciled attributes ordered by 
     *                    priority (schedule first, then range set, then range item), or [] if empty
     * 
     * @example
     * var scheduleAttrs = [{ ci_class: 'cmdb_ci_server', field: 'location', value: 'Seattle' }];
     * var rangeSetAttrs = [{ ci_class: 'cmdb_ci_server', field: 'location', value: 'Denver' }];
     * var result = reconcileCIAttributes(scheduleAttrs, [], rangeSetAttrs);
     * // Returns: [{ ci_class: 'cmdb_ci_server', field: 'location', value: 'Denver' }]
     * // Denver wins because range set has higher priority than schedule
     */
    function reconcileCIAttributes(scheduleAttrs, rangeItemAttrs, rangeSetAttrs) {
        var map = {};

        // Add in reverse priority order - highest priority first prevents overwrites
        addToMap(rangeItemAttrs);
        addToMap(rangeSetAttrs);
        addToMap(scheduleAttrs);

        // Reverse to get final order: schedule → range set → range item
        var result = [];
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                result.push(map[key]);
            }
        }
        result.reverse();

        return result;

        // Helper to add attributes to map with deduplication
        // Uses ci_class.field as key - duplicates are ignored (first wins)
        function addToMap(attrs) {
            if (!attrs || !Array.isArray(attrs) || attrs.length === 0)
                return;

            attrs.forEach(function(attr) {
                var key = attr.ci_class + '.' + attr.field;
                map[key] = map[key] || attr; // Keep existing (higher priority)
            });
        }
    }

    /**
     * Populate attributes to all CIs in the payload based on class hierarchy
     * Input attributesData format: Array of attributes [{ ci_class, field, value, attribute }, ...]
     * Applies attributes to all items where item.className is instance of attribute's className
     * Returns: Modified payload as JSON string, or original if no attributes or error
     */
    function populateAttributesToCiItems(discoveredJson, attributesData) {
        if (!discoveredJson || !attributesData)
            return discoveredJson;

        try {
            var attributeArray = (typeof attributesData === 'string') ? JSON.parse(attributesData) : attributesData;

            // Handle empty array case - no attributes to populate
            if (!Array.isArray(attributeArray) || attributeArray.length === 0) {
                return discoveredJson;
            }

            // Only parse JSON after validating we have attributes to apply
            var payload = JSON.parse(discoveredJson);

            if (!payload || !payload.items) {
                return discoveredJson;
            }

            // Inject attributes into all items based on class hierarchy
            for (var i = 0; i < payload.items.length; i++) {
                var item = payload.items[i];
                if (!item || !item.values || !item.className) continue;

                // Process attributes in array order (later entries override earlier ones)
                for (var j = 0; j < attributeArray.length; j++) {
                    var attr = attributeArray[j];

                    // Check if item's className is instance of attribute's className
                    // e.g., cmdb_ci_linux_server.isInstanceOf(cmdb_ci_hardware) = true
                    if (SNC.ClassModel.isInstanceOf(item.className, attr.ci_class)) {
                        var value = attr.value != null ? attr.value + '' : '';
                        item.values[attr.field] = value;
                    }
                }
            }

            return JSON.stringify(payload);

        } catch (e) {
            gs.error('Error populating attributes to CIs in payload: ' + e);
            return discoveredJson;
        }
    }
})();
