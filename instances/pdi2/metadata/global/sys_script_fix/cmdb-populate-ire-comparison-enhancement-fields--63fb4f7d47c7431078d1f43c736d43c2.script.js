(function() {
    var LOG_PREFIX = 'fix_populate_ire_comparison_enhancement_fields: ';
    var TABLE = 'cmdb_ire_output_comparison_item';

    // Check if any records need population by looking for records with empty new fields
    var check = new GlideRecord(TABLE);
    check.addNullQuery('simplified_input_payload');
    check.setLimit(1);
    check.query();
    if (!check.hasNext()) {
        gs.info(LOG_PREFIX + 'No records need population, skipping');
        return;
    }

    gs.info(LOG_PREFIX + 'Starting population of enhancement fields');
    var startTime = new GlideDateTime();
    var count = 0;
    var errorCount = 0;

    // Per-class cache for IRE fields
    var _fieldCache = {};

    var BATCH_SIZE = 500;

    while (true) {
        var gr = new GlideRecord(TABLE);
        gr.addNullQuery('simplified_input_payload');
        gr.setLimit(BATCH_SIZE);
        gr.query();

        if (!gr.hasNext())
            break;

        while (gr.next()) {
            try {
                var inputItemStr = gr.getValue('input_item');
                if (!inputItemStr) {
                    gr.setValue('simplified_input_payload', '{}');
                    gr.update();
                    count++;
                    continue;
                }

                var inputItem = JSON.parse(inputItemStr);
                var className = inputItem.className;
                if (!className) {
                    gr.setValue('simplified_input_payload', '{}');
                    gr.update();
                    count++;
                    continue;
                }

                // Simplified input payload
                var ireFields = _getIREFields(className);
                var simplified = _simplifyItem(inputItem, ireFields);
                gr.setValue('simplified_input_payload', JSON.stringify(simplified, null, 2));

                // Static match
                gr.setValue('static_match', _computeStaticMatch(gr, inputItem));

                // Dynamic match
                gr.setValue('dynamic_match', _computeDynamicMatch(gr));

                // Static changes
                gr.setValue('static_changes', _computeChanges(gr.getValue('static_ci'), className, ireFields));

                // Dynamic changes
                gr.setValue('dynamic_changes', _computeChanges(gr.getValue('dynamic_ci'), className, ireFields));

                // Static identifier attributes
                gr.setValue('static_identifier_attributes', _computeStaticIdentifierAttributes(gr));

                // Dynamic identifier attributes
                gr.setValue('dynamic_identifier_attributes', _computeDynamicIdentifierAttributes(gr));

                gr.update();
            } catch (e) {
                errorCount++;
                if (errorCount <= 10)
                    gs.logError(LOG_PREFIX + 'Error processing record ' + gr.getUniqueValue() + ': ' + e.message);
                // Mark as processed to prevent infinite re-query
                gr.setValue('simplified_input_payload', '{}');
                gr.update();
            }

            count++;
            if (count % 100 === 0)
                gs.info(LOG_PREFIX + 'Processed ' + count + ' records');
        }
    }

    var elapsed = GlideDateTime.subtract(startTime, new GlideDateTime());
    gs.info(LOG_PREFIX + 'Completed. Processed ' + count + ' records, ' + errorCount + ' errors. Elapsed: ' + elapsed.getDisplayValue());

    // ========== Match Computation ==========

    function _computeStaticMatch(current, inputItem) {
        if (!current.static_ci) return '';
        try {
            var r = JSON.parse(current.static_item_output + '');
            if (!r.identificationAttempts) return '';
            for (var i = 0; i < r.identificationAttempts.length; i++) {
                var a = r.identificationAttempts[i];
                if (a.attemptResult == 'MATCHED') {
                    var values = current.static_ci.sys_class_name + '';

                    // Check for lookup-based match (searchOnTable differs from main class)
                    var isLookup = a.searchOnTable && inputItem && inputItem.lookup;
                    if (isLookup) {
                        var lookupValues = _getLookupValues(inputItem, a.searchOnTable);
                        if (lookupValues) {
                            values += '\n(lookup:' + a.searchOnTable + ')';
                            if (a.attributes) {
                                for (var j = 0; j < a.attributes.length; j++) {
                                    var lVal = lookupValues[a.attributes[j]] || '';
                                    values += '\n' + a.attributes[j] + '=' + lVal;
                                }
                            }
                        }
                    } else if (a.attributes) {
                        for (var j = 0; j < a.attributes.length; j++)
                            values += '\n' + a.attributes[j] + '=' + current.static_ci[a.attributes[j]];
                    }

                    if (a.hybridEntryCiAttributes && a.hybridEntryCiAttributes.length > 0) {
                        for (var k = 0; k < a.hybridEntryCiAttributes.length; k++)
                            values += '\n(hybrid) ' + a.hybridEntryCiAttributes[k] + '=' + current.static_ci[a.hybridEntryCiAttributes[k]];
                    }
                    return values;
                }
            }
        } catch (e) { /* ignore parse errors */ }
        return '';
    }

    function _getLookupValues(inputItem, searchTable) {
        if (!inputItem.lookup) return null;
        for (var i = 0; i < inputItem.lookup.length; i++) {
            if (inputItem.lookup[i].className === searchTable)
                return inputItem.lookup[i].values || null;
        }
        return null;
    }

    function _computeDynamicMatch(current) {
        try {
            var r = JSON.parse(current.dynamic_item_output + '');
            if (!r.identificationAttempts) return '';

            var ciSysId = current.getValue('dynamic_ci');
            var ciGr = null;
            if (ciSysId) {
                ciGr = new GlideRecord('cmdb_ci');
                if (!ciGr.get(ciSysId)) ciGr = null;
            }

            // Always include class name
            var className = r.className || '';
            var values = ciGr ? ciGr.getValue('sys_class_name') : className;

            for (var i = 0; i < r.identificationAttempts.length; i++) {
                var a = r.identificationAttempts[i];

                // Skip sys_object_source attempts — they don't participate in dynamic scoring
                if (a.searchOnTable === 'sys_object_source') continue;

                var matchedScore = a.matchedItemScore;
                var unmatchedScore = a.unmatchedItemScore;

                // Only show attributes with non-zero matched score
                if (matchedScore != null && matchedScore !== 0 && a.attributes) {
                    var posScore = ' (' + matchedScore + ')';
                    for (var j = 0; j < a.attributes.length; j++) {
                        var ciVal = ciGr ? ciGr.getValue(a.attributes[j]) : '';
                        values += '\n' + a.attributes[j] + '=' + (ciVal || '') + posScore;
                    }
                }

                // Only show extended attributes with non-zero unmatched score
                if (unmatchedScore != null && unmatchedScore !== 0 && a.extendedAttributes && a.extendedAttributes.length > 0) {
                    var negScore = ' (' + unmatchedScore + ')';
                    for (var p = 0; p < a.extendedAttributes.length; p++) {
                        var ext = a.extendedAttributes[p];
                        var field = ext;
                        if (ext.indexOf('-') === 0) field = ext.substring(1);
                        else if (ext.indexOf('(') === 0 && ext.indexOf(')') === ext.length - 1)
                            field = ext.substring(1, ext.length - 1);
                        var extVal = ciGr ? ciGr.getValue(field) : '';
                        values += '\n' + ext + '=' + (extVal || '') + negScore;
                    }
                }
            }
            return values;
        } catch (e) { /* ignore parse errors */ }
        return '';
    }

    // ========== Identifier Attributes ==========

    function _computeStaticIdentifierAttributes(current) {
        if (!current.static_ci) return '';
        try {
            var r = JSON.parse(current.static_item_output + '');
            if (!r.identificationAttempts) return '';
            for (var i = 0; i < r.identificationAttempts.length; i++) {
                var a = r.identificationAttempts[i];
                if (a.attemptResult == 'MATCHED') {
                    var attrs = [];
                    if (a.attributes)
                        for (var j = 0; j < a.attributes.length; j++) attrs.push(a.attributes[j]);
                    if (a.hybridEntryCiAttributes && a.hybridEntryCiAttributes.length > 0)
                        for (var k = 0; k < a.hybridEntryCiAttributes.length; k++) attrs.push('(hybrid) ' + a.hybridEntryCiAttributes[k]);
                    return attrs.join(', ');
                }
            }
        } catch (e) { /* ignore */ }
        return '';
    }

    function _computeDynamicIdentifierAttributes(current) {
        try {
            var r = JSON.parse(current.dynamic_item_output + '');
            if (!r.identificationAttempts) return '';
            var allAttrs = [];
            for (var i = 0; i < r.identificationAttempts.length; i++) {
                var a = r.identificationAttempts[i];
                if (a.attributes)
                    for (var j = 0; j < a.attributes.length; j++) allAttrs.push(a.attributes[j]);
                if (a.extendedAttributes && a.extendedAttributes.length > 0)
                    for (var k = 0; k < a.extendedAttributes.length; k++) allAttrs.push(a.extendedAttributes[k]);
            }
            return allAttrs.join(', ');
        } catch (e) { /* ignore */ }
        return '';
    }

    // ========== Changes ==========

    function _computeChanges(ciSysId, className, ireFields) {
        if (!ciSysId) return '';
        var identifierFields = [];
        for (var f in ireFields.itemFields)
            if (ireFields.itemFields.hasOwnProperty(f)) identifierFields.push(f);
        if (identifierFields.length === 0) return '';

        // Use sys_audit instead of sys_history_line to avoid the set.id dot-walk
        // which may not resolve during fix script execution context
        var changes = new GlideRecord('sys_audit');
        changes.addQuery('documentkey', ciSysId);
        changes.addQuery('fieldname', 'IN', identifierFields);
        changes.query();
        var result = '';
        while (changes.next()) {
            var oldVal = changes.getDisplayValue('oldvalue');
            // Skip initial insert records where old is empty (null -> value)
            if (!oldVal) continue;
            var newVal = changes.getDisplayValue('newvalue');
            result += (result === '' ? '' : '\n') + changes.getValue('fieldname') + ': ' + oldVal + ' -> ' + newVal;
        }
        return result === '' ? '' : result;
    }

    // ========== Simplified Payload ==========

    function _simplifyItem(item, ireFields) {
        var simplified = {
            className: item.className,
            values: _filterValues(item.values, ireFields.itemFields)
        };
        if (item.sys_object_source_info)
            simplified.sys_object_source_info = item.sys_object_source_info;
        if (item.lookup && item.lookup.length > 0) {
            simplified.lookup = [];
            for (var li = 0; li < item.lookup.length; li++) {
                var lookupItem = item.lookup[li];
                var lookupClass = lookupItem.className;
                var lookupFieldSet = ireFields.lookupFields[lookupClass] || {};
                simplified.lookup.push({ className: lookupClass, values: _filterValues(lookupItem.values, lookupFieldSet) });
            }
        }
        if (item.related && item.related.length > 0) {
            simplified.related = [];
            for (var ri = 0; ri < item.related.length; ri++) {
                var relatedItem = item.related[ri];
                var relatedClass = relatedItem.className;
                var relatedFieldSet = ireFields.relatedFields[relatedClass] || {};
                simplified.related.push({ className: relatedClass, values: _filterValues(relatedItem.values, relatedFieldSet) });
            }
        }
        return simplified;
    }

    function _filterValues(values, relevantFields) {
        if (!values) return {};
        var filtered = {};
        var SPECIAL = ['sys_class_name', 'discovery_source', 'sys_id'];
        for (var s = 0; s < SPECIAL.length; s++)
            if (values.hasOwnProperty(SPECIAL[s])) filtered[SPECIAL[s]] = values[SPECIAL[s]];
        for (var field in relevantFields)
            if (relevantFields.hasOwnProperty(field) && values.hasOwnProperty(field))
                filtered[field] = values[field];
        return filtered;
    }

    // ========== IRE Field Collection ==========

    function _getIREFields(className) {
        if (_fieldCache[className]) return _fieldCache[className];
        var result = { itemFields: {}, lookupFields: {}, relatedFields: {} };
        _getStaticIREFields(className, result);
        _getDynamicIREFields(className, result);
        _fieldCache[className] = result;
        return result;
    }

    function _getStaticIREFields(className, result) {
        var hierarchy = _getClassHierarchy(className);
        for (var h = 0; h < hierarchy.length; h++) {
            var table = hierarchy[h];
            var grId = new GlideRecord('cmdb_identifier');
            grId.addQuery('applies_to', table);
            grId.addActiveQuery();
            grId.query();
            var foundRules = false;
            while (grId.next()) {
                foundRules = true;
                var identifierSysId = grId.getUniqueValue();
                _collectIdentifierEntries(identifierSysId, 'cmdb_identifier_entry', result, table, false);
                _collectIdentifierEntries(identifierSysId, 'cmdb_related_entry', result, table, true);
            }
            if (foundRules) break;
        }
    }

    function _collectIdentifierEntries(identifierSysId, entryTable, result, appliesTo, isRelated) {
        var grEntry = new GlideRecord(entryTable);
        if (!grEntry.isValid()) return;
        grEntry.addQuery('identifier', identifierSysId);
        grEntry.addActiveQuery();
        grEntry.orderBy('order');
        grEntry.query();
        while (grEntry.next()) {
            var lookupTable = grEntry.getValue('table') || '';
            var attrList = _splitTrim(grEntry.getValue('attributes'));
            var hybridList = _splitTrim(grEntry.getValue('hybrid_entry_ci_criterion_attributes'));
            var mainAttrList = _splitTrim(grEntry.getValue('main_attributes'));
            if (!lookupTable || lookupTable === appliesTo) {
                _addToMap(result.itemFields, attrList);
                _addToMap(result.itemFields, mainAttrList);
            } else {
                var targetMap = isRelated ? result.relatedFields : result.lookupFields;
                if (!targetMap[lookupTable]) targetMap[lookupTable] = {};
                _addToMap(targetMap[lookupTable], attrList);
                _addToMap(result.itemFields, hybridList);
            }
        }
    }

    function _getDynamicIREFields(className, result) {
        var hierarchy = _getClassHierarchy(className);
        for (var h = 0; h < hierarchy.length; h++) {
            var table = hierarchy[h];
            var grModel = new GlideRecord('cmdb_dynamic_ire_model');
            grModel.addQuery('cmdb_class', table);
            grModel.addActiveQuery();
            grModel.query();
            if (grModel.next()) {
                var modelSysId = grModel.getUniqueValue();
                var grFC = new GlideRecord('cmdb_dynamic_ire_filter_condition');
                grFC.addQuery('dynamic_model', modelSysId);
                grFC.addActiveQuery();
                grFC.orderBy('order');
                grFC.query();
                while (grFC.next()) {
                    var fcSysId = grFC.getUniqueValue();
                    var fcClass = grFC.getValue('cmdb_class');
                    var refField = grFC.getValue('reference_field') || '';
                    var isLookup = (refField !== '' && refField !== 'sys_id');
                    var grFeat = new GlideRecord('cmdb_dynamic_ire_feature');
                    grFeat.addQuery('filter_condition', fcSysId);
                    grFeat.addActiveQuery();
                    grFeat.orderBy('order');
                    grFeat.query();
                    while (grFeat.next()) {
                        var attrs = _splitTrim(grFeat.getValue('attributes') || '');
                        var emptibutes = _splitTrim(grFeat.getValue('emptibutes') || '');
                        var contrabutes = _splitTrim(grFeat.getValue('contrabutes') || '');
                        var allAttrs = attrs.concat(emptibutes).concat(contrabutes);
                        if (isLookup) {
                            if (!result.lookupFields[fcClass]) result.lookupFields[fcClass] = {};
                            _addToMap(result.lookupFields[fcClass], allAttrs);
                        } else {
                            _addToMap(result.itemFields, allAttrs);
                        }
                    }
                }
                break;
            }
        }
    }

    // ========== Utilities ==========

    function _getClassHierarchy(className) {
        var hierarchy = [];
        var visited = {};
        var curr = className;
        while (curr && !visited[curr]) {
            visited[curr] = true;
            hierarchy.push(curr);
            var gr = new GlideRecord('sys_db_object');
            gr.addQuery('name', curr);
            gr.setLimit(1);
            gr.query();
            if (gr.next()) {
                var superClass = gr.getValue('super_class');
                if (superClass) {
                    var parentGr = new GlideRecord('sys_db_object');
                    if (parentGr.get(superClass)) {
                        curr = parentGr.getValue('name');
                        continue;
                    }
                }
            }
            break;
        }
        return hierarchy;
    }

    function _splitTrim(str) {
        if (!str) return [];
        var parts = str.split(',');
        var result = [];
        for (var i = 0; i < parts.length; i++) {
            var trimmed = parts[i].replace(/^\s+|\s+$/g, '');
            if (trimmed.length > 0) result.push(trimmed);
        }
        return result;
    }

    function _addToMap(map, fields) {
        for (var i = 0; i < fields.length; i++) map[fields[i]] = true;
    }

})();
