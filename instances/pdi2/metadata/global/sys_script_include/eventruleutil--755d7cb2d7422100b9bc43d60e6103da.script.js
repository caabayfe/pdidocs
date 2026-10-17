var EventRuleUtil = Class.create();
EventRuleUtil.prototype = {
    initialize: function() {
        this.FIELD_MAPPING_RUN_AFTER_BINDING_ENABLED_PROPERTY = "evt_mgmt.field_mapping_run_after_binding_enabled";
        this.FIELD_MAPPING_RUN_AFTER_BINDING_ENABLED_DEFAULT_VALUE = "true";

        this.FIELD_MAPPING_FROM_FIELD_CMDB_CI_PROPERTY = "evt_mgmt.field_mapping_alert_cmdb_ci_prefix";
        this.FIELD_MAPPING_FROM_FIELD_CMDB_CI_DEFAULT_VALUE = "alert_cmdb_ci.";

        this.FIELD_MAPPING_FROM_FIELD_CMDB_KEY_VALUE_PROPERTY = "evt_mgmt.field_mapping_alert_cmdb_ci_key_prefix";
        this.FIELD_MAPPING_FROM_FIELD_CMDB_KEY_VALUE_DEFAULT_VALUE = "alert_cmdb_ci_key.";

        this.FIELD_MAPPING_FROM_FIELD_ADD_INFO_VALUE_PROPERTY = "evt_mgmt.add_info_prefix";
        this.FIELD_MAPPING_FROM_FIELD_ADD_INFO_DEFAULT_VALUE = "additional_info.";

        this.SUPPORTED_FIELD_MAPPING_TYPES_WITH_RUN_AFTER_BINDING = [
            1, // Single field
            3, // Copy value
            4, // Single field with regex
			6, // Copy groups from regex
			7, // Script
			8, // Map field from reference table
		];
    },


    parseXMLFromTable: function() {
        var xmlGr = new GlideRecord('em_rule_xml');
        xmlGr.addQuery();
        xmlGr.query();
        var resultCount = {
            mapRule: 0,
            mapRuleFailed: 0,
            matchRule: 0,
            matchRuleFailed: 0
        };

        while (xmlGr.next()) {
            this.parseXML(xmlGr.rule_xml, xmlGr.name, resultCount);
        }

        gs.message(gs.getMessage("Transform rules: {0} imported successfully, {1} failed.", [resultCount.matchRule, resultCount.matchRuleFailed]));
        gs.message(gs.getMessage("Match rules: {0} imported successfully, {1} failed.", [resultCount.mapRule, resultCount.mapRuleFailed]));
    },

    parseXML: function(rule_xml, file_name, resultCount) {
        var xmlDoc = new XMLDocument(rule_xml);

        //determine whether it is matching rule or mapping rule
        var nodelist = xmlDoc.getNodes("//fieldMappingRule");
        //it is a mapping rule
        if (nodelist.getLength() == 1) {
            this.parseMappingRule(xmlDoc, file_name, resultCount);
        }
        //it is a matching rule
        else {
            var matchnodelist = xmlDoc.getNodes("//matchRule");
            //it is a matching rule
            if (matchnodelist.getLength() >= 1) {
                var res = this.parseMatchingRule(xmlDoc);
                if (res) {
                    resultCount.matchRule++;
                } else {
                    resultCount.matchRuleFailed++;
                    resultCount.success = false;
                }
            } else {
                gs.addErrorMessage(gs.getMessage('XML malformed, or XML structure incorrect.'));
                resultCount.success = false;
            }
        }
    },

    parseMappingRule: function(xmlDoc, file_name, resultCount) {
        var nodelist = {};
        var node = {};
        var xmlUtil = GlideXMLUtil;

        //get name - note: for field mapping rules name may be replaced below.
        var name = file_name;

        //get ems
        node = xmlDoc.getNode("//fieldMappingRule/ems");
        var source = xmlUtil.getText(node);

        //get constant mapping
        nodelist = xmlDoc.getNodes("//fieldMappingRule/constantMappings/entry");
        var k = nodelist.getLength();
        nodelist = xmlDoc.getNodes("//fieldMappingRule/constantMappings/entry/*");
        for (var i = 0; i < k; i++) {
            var toField = xmlUtil.getText(nodelist.item(2 * i));
            var value = xmlUtil.getText(nodelist.item(2 * i + 1));
            if (toField == 'resolutionState' && value == 'NEW')
                continue;
            toField = this.translateField(toField);
            if (toField == 'severity')
                value = this.translateSeverity(value);
            if (toField == 'resolution_state')
                value = this.translateState(value);
            name = source + '-' + value;
            var res = this.insertConstantMapping(name, source, toField, value);
            if (res) {
                resultCount.mapRule++;
            } else {
                resultCount.mapRuleFailed++;
                resultCount.success = false;
            }
        }

        //get single field mapping
        nodelist = xmlDoc.getNodes("//fieldMappingRule/singleFieldMappings");
        var x = nodelist.getLength();
        for (var i = 0; i < x; i++) {
            var childs = nodelist.item(i).getChildNodes();
            var fromField = '';
            var toField = '';
            var mapping_id = '';
            for (var j = 0; j < childs.getLength(); j++) {
                if (childs.item(j).getNodeName() == 'fromField') {
                    fromField = xmlUtil.getText(childs.item(j));
                    fromField = this.translateField(fromField);
                    name = source + '-' + fromField;
                }

                if (childs.item(j).getNodeName() == 'toField') {
                    toField = xmlUtil.getText(childs.item(j));
                    toField = this.translateField(toField);
                    mapping_id = this.insertSingleFieldMapping(name, source, fromField, toField);
                    if (mapping_id) {
                        resultCount.mapRule++;
                    } else {
                        resultCount.mapRuleFailed++;
                        resultCount.success = false;
                    }

                }

                if (childs.item(j).getNodeName() == 'valueMappings') {
                    var entry = childs.item(j).getChildNodes();
                    for (var k = 0; k < entry.getLength(); k++) {
                        if (entry.item(k).getNodeName() == 'entry') {
                            var key = xmlUtil.getText(entry.item(k).getChildNodes().item(1));
                            var value = xmlUtil.getText(entry.item(k).getChildNodes().item(3));
                            if (toField == 'severity')
                                value = this.translateSeverity(value);
                            if (toField == 'resolution_state')
                                value = this.translateState(value);
                            if (fromField == 'severity')
                                key = this.translateSeverity(key);
                            if (fromField == 'resolution_state')
                                key = this.translateState(key);
                            this.insertEventMappingPair(mapping_id, key, value);
                        }
                    }
                }
            }
        }
        resultCount.success = (resultCount.mapRule > 0 || resultCount.matchRule > 0) &&
            resultCount.mapRuleFailed == 0 && resultCount.matchRuleFailed == 0;

    },

    parseMatchingRule: function(xmlDoc) {
        var nodelist = {};
        var node = {};
        var xmlUtil = GlideXMLUtil;

        //get ems
        node = xmlDoc.getNode("//matchRule/ems");
        var source = xmlUtil.getText(node);

        //get order
        node = xmlDoc.getNode("//matchRule/ruleOrder");
        var ruleOrder = xmlUtil.getText(node);

        //get name
        node = xmlDoc.getNode("//matchRule/name");
        var name = xmlUtil.getText(node);

        //get ignore
        node = xmlDoc.getNode("//matchRule/ignore");
        var ignore = xmlUtil.getText(node);

        //get ciTypeName
        ciTypeName = xmlDoc.getNode("//matchRule/ciTypeName");
        var ciTypeName = xmlUtil.getText(ciTypeName);

        //get ciTypeName
        swId = xmlDoc.getNode("//matchRule/id");
        var swId = xmlUtil.getText(swId);

        var match_id = this.insertMatchRule(swId, name, source, ignore, parseInt(ruleOrder) + 100, ciTypeName);

        if (match_id == null)
            return false;

        //get field composition
        nodelist = xmlDoc.getNodes("//matchRule/fieldCompositions");
        var k = nodelist.getLength();
        for (var i = 0; i < k; i++) {
            var childs = nodelist.item(i).getChildNodes();
            for (var a = 0; a < childs.getLength(); a++) {
                if (childs.item(a).getNodeName() == 'composingFields') {
                    var composingFields = xmlUtil.getText(childs.item(a));
                }
                if (childs.item(a).getNodeName() == 'fieldName') {
                    var field = xmlUtil.getText(childs.item(a));
                }
            }

            field = this.translateField(field);
            if (field == 'severity')
                composingFields = this.translateSeverity(composingFields);
            else if (field == 'resolution_state')
                composingFields = this.translateState(composingFields);
            else
                composingFields = this.translateComposition(composingFields);
            this.insertComposeField(match_id, field, composingFields);
        }

        //get matchFields
        nodelist = xmlDoc.getNodes("//matchRule/matchFields");
        var k = nodelist.getLength();
        for (var i = 0; i < k; i++) {
            var childNodes = nodelist.item(i).getChildNodes();
            var hasRegex = false;
            for (var j = 0; j < childNodes.getLength(); j++) {
                if (childNodes.item(j).getNodeName() == 'regex') {
                    hasRegex = true;
                    break;
                }
            }
            //we remove this, because we wan't also to save exact match fields
            //if (!hasRegex) 
            //	continue;
            var hasGroupMapping = false;
            var groupMapping = '';
            for (var j = 0; j < childNodes.getLength(); j++) {
                if (childNodes.item(j).getNodeName() == 'field') {
                    var field = xmlUtil.getText(childNodes.item(j));
                }
                if (childNodes.item(j).getNodeName() == 'regex') {
                    var regex = xmlUtil.getText(childNodes.item(j));
                }
                if (childNodes.item(j).getNodeName() == 'groupMappings') {
                    var mapping = this.translateField(xmlUtil.getText(childNodes.item(j)));
                    if (!hasGroupMapping) {
                        groupMapping = mapping;
                        hasGroupMapping = true;
                    } else {
                        groupMapping += ',' + mapping;
                    }
                }
                if (childNodes.item(j).getNodeName() == 'example') {
                    //if the field has no regex part- use the example field
                    if (!hasRegex) {
                        var regex = xmlUtil.getText(childNodes.item(j));
                    }
                }
            }
            field = this.translateField(field);
            this.insertMatchField(match_id, field, groupMapping, regex);
        }
        return true;
    },

    insertConstantMapping: function(name, source, toField, value) {
        var mappingRule = new GlideRecord('em_mapping_rule');
        mappingRule.addQuery('name', name);
        mappingRule.query();
        if (mappingRule.hasNext()) {
            var msg = gs.getMessage('A mapping rule named "{0}" already exists, rule not imported.', [name]);
            gs.addErrorMessage(msg);
            return false;
        }

        mappingRule.initialize();
        mappingRule.name = name;
        mappingRule.event_class = source;
        mappingRule.mapping_type = '2'; //constant type
        mappingRule.to_field = toField;
        mappingRule.value = value;
        return mappingRule.insert();
    },

    insertSingleFieldMapping: function(name, source, fromField, toField) {
        var mappingRule = new GlideRecord('em_mapping_rule');
        mappingRule.addQuery('name', name);
        mappingRule.query();
        if (mappingRule.hasNext()) {
            var msg = gs.getMessage('A mapping rule named "{0}" already exists, rule not imported.', [name]);
            gs.addErrorMessage(msg);
            return false;
        }

        mappingRule.initialize();
        mappingRule.name = name;
        mappingRule.event_class = source;
        mappingRule.mapping_type = '1'; //singleField type
        mappingRule.from_field = fromField;
        mappingRule.to_field = toField;
        return mappingRule.insert();
    },

    insertEventMappingPair: function(mapping_id, key, value) {
        var mappingPair = new GlideRecord('em_mapping_pair');
        mappingPair.initialize();
        mappingPair.mapping_rule = mapping_id;
        mappingPair.key = key;
        mappingPair.value = value;
        mappingPair.insert();
    },

    insertMatchRule: function(swId, name, source, ignore, order, ciTypeName) {
        var matchRule = new GlideRecord('em_match_rule');
        matchRule.initialize();
        matchRule.addQuery('name', name);
        matchRule.query();
        if (matchRule.hasNext()) {
            var msg = gs.getMessage('A transform rule named "{0}" already exists, rule not imported.', [name]);
            gs.addErrorMessage(msg);
            return null;
        }

        matchRule.initialize();
        matchRule.name = name;
        matchRule.event_class = source;
        matchRule.ignore_event = ignore;
        matchRule.order = order;
        matchRule.ci_type = ciTypeName;
        //matchRule.sys_id = convertId(swId);
        return matchRule.insert();
    },

    insertMatchField: function(match_id, field, mapping, regex) {
        var matchField = new GlideRecord('em_match_field');
        matchField.initialize();
        matchField.match_rule = match_id;
        matchField.field = field;
        matchField.mapping = mapping;
        matchField.regexp = regex;
        matchField.insert();
    },

    insertComposeField: function(match_id, field, composingFields) {
        var composeField = new GlideRecord('em_compose_field');
        composeField.initialize();
        composeField.match_rule = match_id;
        composeField.field = field;
        composeField.composition = composingFields;
        composeField.insert();
    },

    translateField: function(field) {
        field = '' + field;
        switch (field) {
            case 'hostAddress':
                field = 'node';
                break;
            case 'messageKey':
                field = 'message_key';
                break;
            case 'resolutionState':
                field = 'resolution_state';
                break;
            case 'text':
                field = 'description';
            default:
                break;
        }
        return field;
    },

    translateComposition: function(composition) {
        composition = '' + composition;
        if (composition.indexOf("${hostAddress}") >= 0)
            composition = composition.replace("${hostAddress}", "${node}");
        if (composition.indexOf("${messageKey}") >= 0)
            composition = composition.replace("${messageKey}", "${message_key}");
        if (composition.indexOf("${resolutionState}") >= 0)
            composition = composition.replace("${resolutionState}", "${resolution_state}");
        if (composition.indexOf("${text}") >= 0)
            composition = composition.replace("${text}", "${description}");
        return composition;
    },

    translateSeverity: function(severity) {
        severity = '' + severity;
        switch (severity) {
            case 'CRITICAL':
                severity = '1';
                break;
            case 'MAJOR':
                severity = '2';
                break;
            case 'WARNING':
                severity = '4';
                break;
            case 'MINOR':
                severity = '3';
                break;
            case 'INFORMATION':
                severity = '5';
            default:
                break;
        }
        return severity;
    },

    translateState: function(state) {
        state = '' + state;
        switch (state) {
            case 'NEW':
                state = 'New';
                break;
            case 'CLOSED':
                state = 'Closing';
            default:
                break;
        }
        return state;
    },

    isFieldMappingRunAfterBindingEnabled: function() {
        var enabled = gs.getProperty(this.FIELD_MAPPING_RUN_AFTER_BINDING_ENABLED_PROPERTY,
            this.FIELD_MAPPING_RUN_AFTER_BINDING_ENABLED_DEFAULT_VALUE);

        return enabled == "true";
    },

    getFieldMappingFromFieldObject: function(fromField) {
        if (typeof fromField != 'string')
            return;

        var prefix = this.getFromFieldPrefix(fromField);
        var field = fromField.toLowerCase().substring(prefix.length);
        return {
            prefix: prefix,
            field: field
        };
    },

    getFromFieldPrefix: function(fromField) {
        if (typeof fromField != 'string')
            return;

        fromField = fromField.toLowerCase();

        var prefixes = [
            this.getFieldMappingFromFieldCmdbCiPrefix(),
            this.getFieldMappingFromFieldCmdbKeyValuePrefix(),
            this.getFieldMappingFromFieldAddInfoPrefix()
        ];

        for (var i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            if (fromField.startsWith(prefix))
                return prefix;
        }

        // Default value if a prefix was not found
        return '';
    },

    getFieldMappingFromFieldCmdbCiPrefix: function() {
        return gs.getProperty(this.FIELD_MAPPING_FROM_FIELD_CMDB_CI_PROPERTY, this.FIELD_MAPPING_FROM_FIELD_CMDB_CI_DEFAULT_VALUE);
    },

    getFieldMappingFromFieldCmdbKeyValuePrefix: function() {
        return gs.getProperty(this.FIELD_MAPPING_FROM_FIELD_CMDB_KEY_VALUE_PROPERTY, this.FIELD_MAPPING_FROM_FIELD_CMDB_KEY_VALUE_DEFAULT_VALUE);
    },

    getFieldMappingFromFieldAddInfoPrefix: function() {
        return gs.getProperty(this.FIELD_MAPPING_FROM_FIELD_ADD_INFO_VALUE_PROPERTY, this.FIELD_MAPPING_FROM_FIELD_ADD_INFO_DEFAULT_VALUE);
    },
	
	isFieldMappingTypeSupportedWithRunAfterBinding: function(fieldMappingTypeValue) {
		if (!(Number(fieldMappingTypeValue) && parseInt(fieldMappingTypeValue, 10)))
			return;

		var v = parseInt(fieldMappingTypeValue, 10);
		return this.SUPPORTED_FIELD_MAPPING_TYPES_WITH_RUN_AFTER_BINDING.indexOf(v) >= 0;
	},

    type: 'EventRuleUtil'
}
