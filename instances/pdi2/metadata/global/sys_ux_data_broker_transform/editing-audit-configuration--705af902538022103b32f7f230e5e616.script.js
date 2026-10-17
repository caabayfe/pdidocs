function transformFn(input) {

    function getAuditType(table) {
        var auditType = GlideTableDescriptor.get(table).getED().getAttribute("audit_type");
        if (auditType == null)
            auditType = 'blacklist';
        return auditType;
    }

    function getParentTable(tableName) {
        var tableRec = new GlideRecord('sys_db_object');
        if (tableRec.get('name', tableName)) {
            var parentTable = tableRec.super_class;
            if (parentTable) {
                var parentTableRec = new GlideRecord('sys_db_object');
                parentTableRec.get('sys_id', parentTable);
                return parentTableRec.name;
            } else {
                return '';
            }
        } else {
            return 'Table not found';
        }
    }

    function hasElementAttribute(table, element, attributeKey) {
        var hasAttr = GlideTableDescriptor.get(table).getElementDescriptor(element).hasAttribute(attributeKey);
        return hasAttr;
    }

    function getOverrideAttributes(table, element) {
        var overrideGR = new GlideRecord('sys_dictionary_override');
        overrideGR.addQuery('name', table);
        overrideGR.addQuery('element', element);
        overrideGR.query();

        if (overrideGR.next() && overrideGR.attributes !== '' && overrideGR.attributes_override == true) {
            return overrideGR.attributes || '';
        } else if (overrideGR.attributes != '' && overrideGR.attributes_override == false) {
            gs.info("throw error");
        }
        return '';
    }

    function finaliseAttribute(table, element, attributes) {
        var dictGR = new GlideRecord('sys_dictionary_override');
        dictGR.addQuery('name', table);
        dictGR.addQuery('element', element);
        dictGR.query();
        if (dictGR.next()) {
            dictGR.attributes = attributes;
            dictGR.attributes_override = true;
            dictGR.update();
        } else {
            var dictGROverride = new GlideRecord('sys_dictionary_override');
            dictGROverride.name = table;
            dictGROverride.element = element;
            dictGROverride.base_table = getParentTable(table);
            dictGROverride.attributes_override = true;
            dictGROverride.attributes = attributes;
            dictGROverride.insert();
        }
    }

    function finaliseUpdatedAttribute(table, element, attributes) {
        var dictGR = new GlideRecord('sys_dictionary_override');
        dictGR.addQuery('name', table);
        dictGR.addQuery('element', element);
        dictGR.query();
        if (dictGR.next()) {
            dictGR.attributes = attributes;
            dictGR.attributes_override = true;
            dictGR.update();
        }
    }

    function updateAttributesString(attributes, attributeKey, newValue) {
        var attributePairs = {};
        var attributeList = attributes.split(',');

        attributeList.forEach(function(attribute) {
            var keyValue = attribute.split('=');
            if (keyValue.length === 2) {
                attributePairs[keyValue[0].trim()] = keyValue[1].trim();
            }
        });

        attributePairs[attributeKey] = newValue;

        var updatedAttributes = [];
        for (var key in attributePairs) {
            updatedAttributes.push(key + '=' + attributePairs[key]);
        }

        return updatedAttributes.join(',');
    }

    function updateAttributes(table, element, attributeKey, newValue) {
        var parentTable = getParentTable(table);
        if (parentTable != '' && parentTable != 'Table not found') {
            var overrideAttr = getOverrideAttributes(table, element);
            if (overrideAttr != '') {
                var updatedAttr = updateAttributesString(overrideAttr, attributeKey, newValue);
                finaliseUpdatedAttribute(table, element, updatedAttr);
            } else {
                finaliseAttribute(table, element, attributeKey + "=" + newValue);
            }
        } else if (parentTable != 'Table not found') {
            SNC.DictionaryAttribute.set(table, element, attributeKey, newValue);
        }
    }

    function removeAttributesString(attributes, attributeKey) {
        var attributePairs = {};
        var attributeList = attributes.split(',');

        attributeList.forEach(function(attribute) {
            var keyValue = attribute.split('=');
            if (keyValue.length === 2) {
                attributePairs[keyValue[0].trim()] = keyValue[1].trim();
            }
        });

        delete attributePairs[attributeKey];

        var updatedAttributes = [];
        for (var key in attributePairs) {
            updatedAttributes.push(key + '=' + attributePairs[key]);
        }
        return updatedAttributes.join(',');
    }

    function removeAttribute(table, element, attributeKey) {
        var parentTable = getParentTable(table);
        if (parentTable != '' && parentTable != 'Table not found') {
            var overrideAttr = getOverrideAttributes(table, element);
            if (overrideAttr != '') {
                var updatedAttr = removeAttributesString(overrideAttr, attributeKey) || '';
                finaliseUpdatedAttribute(table, element, updatedAttr);
            } else {
				if (attributeKey == 'no_audit') {
					updateAttributes(table, element, 'audit', 'true');
				} else if (attributeKey == 'audit') {
					updateAttributes(table, element, 'no_audit', 'true');
				}
            }
        } else if (parentTable != 'Table not found') {
            SNC.DictionaryAttribute.remove(table, element, attributeKey);
        }
    }

    var selectedItems = input.selected_items || [];
    var itemsChanged = input.items_changed || [];
    var table = input.table || '';

    if (!table)
        return;

    var auditType = getAuditType(table);

    selectedItems.forEach((itemArray, outerIndex) => {
        itemArray.forEach((item, index) => {
            if (item.id && item.label) {

                var element = item.id;

                if (auditType == 'whitelist') {
                    if (!hasElementAttribute(table, element, "audit")) {
                        updateAttributes(table, element, 'audit', 'true');
                    }

                    if (hasElementAttribute(table, element, "no_audit")) {
                        removeAttribute(table, element, 'no_audit');
                    }

                } else if (auditType == 'blacklist' || !auditType) {
                    if (hasElementAttribute(table, element, "no_audit")) {
                        removeAttribute(table, element, 'no_audit');
                    }

                    if (hasElementAttribute(table, element, "audit")) {
                        removeAttribute(table, element, 'audit');
                    }
                }
            }
        });
    });

    itemsChanged.forEach((items, index) => {
        var item = items[0];
        if (item.id && item.label) {

            var element = item.id;

            var isInSelected = false;
            selectedItems.forEach((itemArray1, outerIndex1) => {
                if (isInSelected) return;

                itemArray1.forEach((item1, index1) => {
                    if (item1.id === element) {
                        isInSelected = true;
                    }
                });
            });

            if (isInSelected) {
                if (auditType == 'whitelist') {
                    if (!hasElementAttribute(table, element, "audit")) {
                        updateAttributes(table, element, 'audit', 'true');
                    }
                }

                if (hasElementAttribute(table, element, "no_audit")) {
                    removeAttribute(table, element, 'no_audit');
                }
            } else {
                if (auditType == 'blacklist') {
                    if (!hasElementAttribute(table, element, "no_audit")) {
                        updateAttributes(table, element, 'no_audit', 'true');
                    }
                }

                if (hasElementAttribute(table, element, "audit")) {
                    removeAttribute(table, element, 'audit');
                }
            }
        }
    });
}
