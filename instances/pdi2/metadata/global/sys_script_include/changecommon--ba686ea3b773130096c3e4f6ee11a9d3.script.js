var ChangeCommon = Class.create();

ChangeCommon.LOG_PROPERTY = "com.snc.change_management.core.log";
ChangeCommon.MATCH_ALL_PROPERTY = "com.snc.change_management.process.match.all";
ChangeCommon.READ_REPLICA_CATEGORY_CHANGE_MANAGEMENT_HISTORICAL_QUERIES = "Change management - historical queries";

ChangeCommon.prototype = {
    initialize: function() {},

    type: "ChangeCommon"
};

ChangeCommon.DATE_ELEMENT_TYPE = {
    "glide_date_time": true,
    "glide_date": true,
    "due_date": true,
    "date": true,
    "datetime": true
};

ChangeCommon.assign = function(target, varArgs) {
    var _log = global.ChangeCommon.getLog();

    if (global.JSUtil.nil(target))
        throw new TypeError("Cannot convert undefined or null to object");

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (global.JSUtil.notNil(nextSource))
            for (var nextKey in nextSource) {
                if (_log.atLevel(global.GSLog.DEBUG))
                    _log.debug("[assign] nextKey: " + nextKey);

                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey))
                    to[nextKey] = nextSource[nextKey];
            }
    }

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[assign] return: " + JSON.stringify(to));

    return to;
};

ChangeCommon.sanitizeHTML = function(html) {
    return SNC.GlideHTMLSanitizer.sanitize(html);
};

ChangeCommon.matchAll = function() {
    return gs.getProperty(global.ChangeCommon.MATCH_ALL_PROPERTY, "true") + "" !== "true" ? "IR_AND_OR_QUERY" : "IR_AND_QUERY";
};

ChangeCommon.toJS = function(_gr, excludes, includeCanWrite) {
    var _log = global.ChangeCommon.getLog();

    var obj = {};

    if (!_gr || typeof _gr === "undefined" || !_gr.canRead())
        return obj;

    excludes = excludes || {
        sys_scope: true,
        sys_replace_on_upgrade: true,
        sys_policy: true,
        sys_package: true,
        sys_customer_update: true,
        sys_update_name: true
    };

    if (includeCanWrite)
        obj._canWrite = _gr.canWrite();

    var elements = _gr.getElements();
    var jsArr = Array.isArray(elements);

    // Scoped vs Global calls to getElements returns different objects
    var elementsLength = jsArr ? elements.length : elements.size();
    for (var i = 0; i < elementsLength; i++) {
        var element = jsArr ? elements[i] : elements.get(i);
        var elementName = element.getName() + "";
        if (!element.canRead() || !elementName || excludes[elementName])
            continue;

        var fieldType = element.getED().getInternalType() + "";
        var fieldValue = element.toString();
        if (fieldType === "boolean")
            fieldValue = fieldValue === "true" ? true : false;
        else if (fieldType === "integer" || fieldType === "decimal")
            fieldValue = !fieldValue ? fieldValue : fieldValue - 0;

        obj[elementName] = {
            "display_value": element.getDisplayValue(),
            "value": fieldValue
        };
        if (includeCanWrite)
            obj[elementName]._canWrite = element.canWrite();

        // Augment object for date types
        if (global.ChangeCommon.DATE_ELEMENT_TYPE[fieldType]) {
            var gdt = new GlideDateTime();
            gdt.setValue(element.toString());
            obj[elementName].display_value_internal = gdt.getDisplayValueInternal();
        }
    }

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[_toJS] return: " + JSON.stringify(obj));

    return obj;
};

ChangeCommon.resolveChoiceLabel = function(recordClassName, field, value) {
    var _log = global.ChangeCommon.getLog();

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveChoiceLabel] field: " + field + " - value: " + value);

    if (!recordClassName || !field || !value)
        return null;

    var fieldChoices = GlideChoiceList.getChoiceList(recordClassName, field);

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveChoiceLabel] (GlideChoiceList.getChoiceList) fieldChoices: " + fieldChoices);

    if (fieldChoices.size() === 0)
        return value;

    // Case sensitive matching of choice value
    for (var i = 0; i < fieldChoices.getSize(); i++)
        if (fieldChoices.getChoice(i).getValue() + "" === value + "")
            return fieldChoices.getChoice(i).getLabel() + "";

    // Case insensitive matching of choice value
    for (var j = 0; j < fieldChoices.getSize(); j++)
        if ((fieldChoices.getChoice(j).getValue() + "").toUpperCase() === value.toUpperCase())
            return fieldChoices.getChoice(j).getLabel() + "";

    // Try and match using label instead, and if match, value is a label
    if (fieldChoices.getValueOf(value))
        return value;

    // Case insensitive matching of choice Label
    for (var k = 0; k < fieldChoices.getSize(); k++)
        if ((fieldChoices.getChoice(k).getLabel() + "").toUpperCase() === value.toUpperCase())
            return fieldChoices.getChoice(k).getLabel() + "";

    return value;
};

ChangeCommon.resolveChoice = function(recordClassName, field, value) {
    var _log = global.ChangeCommon.getLog();

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveChoice] field: " + field + " - value: " + value);

    if (!recordClassName || !field || !value)
        return value || null;

    var fieldChoices = GlideChoiceList.getChoiceList(recordClassName, field);

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveChoice] (GlideChoiceList.getChoiceList) fieldChoices: " + fieldChoices);

    if (fieldChoices.size() === 0)
        return value;

    // Case sensitive matching of choice value
    for (var i = 0; i < fieldChoices.getSize(); i++)
        if (fieldChoices.getChoice(i).getValue() + "" === value + "")
            return value;

    // Case insensitive matching of choice value
    for (var j = 0; j < fieldChoices.getSize(); j++)
        if ((fieldChoices.getChoice(j).getValue() + "").toUpperCase() === value.toUpperCase())
            return fieldChoices.getChoice(j).getValue();

    // Try and match using label instead
    var valueByLabel = fieldChoices.getValueOf(value);

    if (valueByLabel)
        return valueByLabel;

    // Case insensitive matching of choice Label
    for (var k = 0; k < fieldChoices.getSize(); k++)
        if ((fieldChoices.getChoice(k).getLabel() + "").toUpperCase() === value.toUpperCase())
            return fieldChoices.getChoice(k).getValue();

    // We allow non-existent choice values, but Table REST API checks glide.rest.choice.allow_non_existing_value === true
    // However implementing this check would change behaviour for existing customers
    return value;
};

ChangeCommon.resolveReference = function(fieldED, value) {
    var _log = global.ChangeCommon.getLog();

    if (!fieldED || !value)
        return value;

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveReference] fieldED.getReferenceKey(): " + fieldED.getReferenceKey() + " - value: " + value);

    var referenceKey = fieldED.getReferenceKey();
    if (referenceKey !== null && referenceKey + "" !== "sys_id")
        return value;

    var resolvedSysId = GlideReferenceField.getSysID(fieldED.getReference(), value, false);
    resolvedSysId = GlideStringUtil.notNil(resolvedSysId) ? resolvedSysId : value;

    if (_log.atLevel(global.GSLog.DEBUG))
        _log.debug("[resolveReference] resolvedSysId: " + resolvedSysId);

    return resolvedSysId;
};

ChangeCommon.isReferenceField = function(fieldED) {
    if (!fieldED)
        return false;

    var internalType = fieldED.getInternalType() + "";
    return internalType === "reference" || internalType === "domain_id" || internalType === "glide_var";
};

ChangeCommon.getRoles = function() {
    return GlideStringUtil.join(GlideSecurityManager.get().getRoles());
};

ChangeCommon.isAccessibilityEnabled = function() {
    return GlideAccessibility.isEnabled();
};

ChangeCommon.isPluginActive = function(pluginName) {
    if (!pluginName)
        return false;

    return GlidePluginManager.isActive(pluginName);
};

ChangeCommon.canRead = function(tableName) {
    if (!tableName)
        return false;

    var tableDescriptor = GlideTableDescriptor.get(tableName);
    if (!tableDescriptor)
        return false;

    return tableDescriptor.canRead();
};

/**
 *  Get a subset of the records supplied
 *  limit  : Maximum record size to be returned
 *  offset : Starting point of the return records
 *
 *  Returns array of JS'd GlideRecords
 */
ChangeCommon.getWindow = function(_gr, limit, offset) {
    var obj = [];

    if (!_gr || typeof _gr === "undefined")
        return obj;

    if (!offset || offset < 0)
        offset = 0;
    if (!limit || limit < 0)
        limit = 500;

    var currentOffset = 0;
    while (_gr.next() && limit > 0) {
        currentOffset++;
        if (!_gr.canRead())
            continue;
        if (currentOffset >= offset) {
            obj.push(global.ChangeCommon.toJS(_gr));
            limit--;
        }
    }

    return obj;
};

/**
 *	Get a subset of the records supplied
 *	nameValuePairs : which will be used to build query unless it contains sysparm_query
 *	in which case the value of sysparm_query is used to build the query
 *
 *	Returns Object with containing encodedQuery and fields applied and ignored
 */
ChangeCommon.buildEncodedQuery = function(nameValuePairs, tableName) {
    var _log = global.ChangeCommon.getLog();

    var result = {
        encodedQuery: '',
        fields: {
            applied: [],
            ignored: []
        }
    };

    if (!nameValuePairs || typeof nameValuePairs === 'undefined')
        return result;

    if (!tableName || typeof tableName === 'undefined')
        tableName = 'change_request';

    var gr = new GlideRecord(tableName);
    var qc = null;
    if (nameValuePairs.sysparm_query && typeof nameValuePairs.sysparm_query !== 'undefined') {
        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[buildEncodedQuery] encoded query");

        var sysparmQuery = nameValuePairs.sysparm_query + '';
        var queryString = new GlideQueryString(tableName, sysparmQuery);
        queryString.deserialize();

        var terms = queryString.getTerms();
        var previousTerm = null;
        for (var i = 0; i < terms.size(); i++) {
            if (i > 0)
                previousTerm = terms.get(i - 1);

            var term = terms.get(i);
            var field = term.getTermField();

            // handle ^EQ at end of encoded query
            if (field !== null) {
                // Validate only the first dot walk field
                var dotWalkField = (field + '').split('.');
                if (gr.isValidField(field) || (dotWalkField.length > 1 && gr.isValidField(dotWalkField[0]))) {

                    // handle ^OR inside of encoded query
                    if (term.isOR() && previousTerm !== null && qc !== null)
                        qc.addOrCondition(field, term.getOperator(), term.getValue());
                    else
                        qc = gr.addQuery(field, term.getOperator(), term.getValue());

                    result.fields.applied.push(field);
                } else
                    result.fields.ignored.push(field);
            }
        }

        result.encodedQuery = gr.getEncodedQuery();
    } else {
        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[buildEncodedQuery] name-value pair object");

        Object.keys(nameValuePairs).forEach(function(name) {
            var value = nameValuePairs[name] + '';
            if (gr.isValidField(name)) {
                gr.addQuery(name, value);
                result.fields.applied.push(name);
            } else
                result.fields.ignored.push(name);
        }, this);
        result.encodedQuery = gr.getEncodedQuery();
    }

    return result;
};

ChangeCommon.isNil = function(value) {
    return JSUtil.nil(value) || value === "undefined";
};

ChangeCommon.methods = {

    update: function() {
        if (!this._gr.canWrite())
            return;

        return this._gr.update();
    },

    insert: function() {
        var _log = global.ChangeCommon.getLog();

        var canCreate = this._gr.canCreate();

        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[insert] canCreate: " + canCreate);

        if (!canCreate)
            return;

        var sysId = this._gr.insert();

        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[insert] sysId: " + sysId);

        return sysId;
    },

    deleteRecord: function() {
        return this._gr.deleteRecord();
    },

    refreshGlideRecord: function() {
        var gr = new GlideRecord(this._gr.getTableName());
        gr.addQuery("sys_id", this._gr.getUniqueValue());
        gr.query();
        if (!gr._next())
            this._gr = null;
        this.initialize(gr);
    },

    getGlideRecord: function() {
        return this._gr;
    },

    setValue: function(name, value) {
        var nameValuePairs = {};
        if (name)
            nameValuePairs[name] = value || "";
        return this.setValues(nameValuePairs);
    },

    setValues: function(nameValuePairs) {
        var _log = global.ChangeCommon.getLog();

        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[setValues] nameValuePairs: " + JSON.stringify(nameValuePairs));

        var fields = {
            applied: [],
            ignored: []
        };

        if (!nameValuePairs || !this._gr.canWrite())
            return fields;

        var encryptedFields;
        if (nameValuePairs.hasOwnProperty('encrypted_fields')) {
            if (typeof nameValuePairs.encrypted_fields === 'string')
                encryptedFields = nameValuePairs.encrypted_fields.split(',');
            else if (Array.isArray(nameValuePairs.encrypted_fields))
                encryptedFields = nameValuePairs.encrypted_fields;
            else
                encryptedFields = Object.keys(nameValuePairs.encrypted_fields);

            delete nameValuePairs.encrypted_fields;

            if (_log.atLevel(global.GSLog.DEBUG))
                _log.debug("[setValues] encryptedFields: " + encryptedFields);
        }

        Object.keys(nameValuePairs).forEach(function(name) {
            var value = nameValuePairs[name] + "";
            if (this._gr.isValidField(name) && this.canWriteTo(name)) {
                var fieldED = this._gr[name].getED();

                // Handle Reference and Choice
                if (global.ChangeCommon.isReferenceField(fieldED))
                    value = ChangeCommon.resolveReference(fieldED, value);
                else if (fieldED.isChoiceTable())
                    value = ChangeCommon.resolveChoice(this._gr.getRecordClassName(), fieldED.getName(), value);

                //  Handle Journal Field types
                if (fieldED.getInternalType() + "" === "journal_input")
                    this._gr[name].setJournalEntry(value);
                else {
                    // Support for encrypted fields
                    if (encryptedFields && Array.isArray(encryptedFields) && encryptedFields.indexOf(name) !== -1)
                        this._gr.setDisplayValue(name, value);
                    else
                        this._gr.setValue(name, value);
                }

                fields.applied.push(name);
            } else
                fields.ignored.push(name);
        }, this);

        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[setValues] fields: " + JSON.stringify(fields));

        return fields;
    },

    canWriteTo: function(fieldName) {
        var _log = global.ChangeCommon.getLog();

        if (!fieldName)
            return false;

        var canWrite = this._gr[fieldName].canWrite();

        if (_log.atLevel(global.GSLog.DEBUG))
            _log.debug("[canWriteTo] fieldName: " + fieldName + " canWrite: " + canWrite);

        return canWrite;
    },

    // provides legacy API
    resolveChoice: ChangeCommon.resolveChoice,
    resolveReference: ChangeCommon.resolveReference,
    isReferenceField: ChangeCommon.isReferenceField
};

ChangeCommon.filters = {

    sysId: function(sysId) {
        var re = /^[a-f0-9]{32}$/i;
        return re.test(sysId);
    },

    unique: function(value, index, arr) {
        return arr.indexOf(value) === index;
    }

};

/**
 * Used to invalidate browser cache. 
 * E.g. UI Macros, when applied through AngularJS templates, must include 
 * the flushstamp from the macro cache to ensure customers get the latest file
 */
ChangeCommon.cacheInvalidation = {

    getUIMacroFlushStamp: function() {
        return GlideCacheManager.getFlushStamp('syscache_ui_macro');
    }

};

ChangeCommon.getLog = function() {
	return this._log || new global.GSLog(global.ChangeCommon.LOG_PROPERTY, "ChangeCommon.toJS").setLog4J();
};
