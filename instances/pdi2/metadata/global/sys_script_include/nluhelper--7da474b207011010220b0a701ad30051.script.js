var NLUHelper = Class.create();

(function() {

    NLUHelper.objValues = function(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    };

    NLUHelper.isEmpty = function(obj) {
        if (!obj || obj === '')
            return true;
        else if (typeof obj === "object")
            return 0 === Object.keys(obj).length;
        else if (Array.isArray(obj))
            return 0 === obj.length;
        return false;
    };

    NLUHelper.wordToRegex = function(word) {
        return '\\b(?i)' + word + '\\b';
    };

    NLUHelper.getIntValue = function(val) {
        return (val ? parseInt(val, 10) : 0);
    };

    NLUHelper.cloneDeep = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    NLUHelper.extend = function(dest, src) {
        if (!src || NLUHelper.isEmpty(src)) return dest;
        for (var key in src) {
            dest[key] = src[key];
        }
        return dest;
    };

    NLUHelper.compareArrays = function(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        } else {
            for (var i in arr1) {
                if (arr2.indexOf(arr1[i]) === -1) {
                    return false;
                }
            }
        }
        return true;
    };

    NLUHelper.getLatestDate = function(date1, date2) {
        if (!date2) return date1;
        if (!date1 || (date2.getNumericValue() > date1.getNumericValue())) {
            return date2;
        }
        return date1;
    };

    NLUHelper.toTimezoneAdjustedTimestamp = function(glideDateTime) {
        if (gs.nil(glideDateTime)) return;
        return (parseInt(glideDateTime.getNumericValue()) + parseInt(glideDateTime.getTZOffset()));
    };

    NLUHelper.getErrorsFromResponse = function(response) {
        var messages = response.messages;
        var errors = [];
        var fields = {
            name: 'name',
            sys_id: 'sys_id',
            displayName: 'display_name'
        };
        messages.forEach(function(record) {
            var at, type, path, modelName;
            var intentName, utterance, unknown, entityObj, entityName;
            var modelObj, nluModel, intentObj, utteranceObj, intentGr, entityGr;
            var errorObj = {};
            if (record.type === 'ERROR') {
                if (record.fields) {
                    gs.debug('Invalid json : ' + record.at);
                    gs.debug('Invalid json fields : ' + record.fields);
                }
                if (record.at) {
                    at = record.at;
                    path = at.split(':');
                    type = path[0];
                    path = path[1].split('.');
                    modelName = path[0];
                    if (type === 'intent') {
                        intentName = path[1];
                    } else if (type === 'entity') {
                        entityName = path[path.length - 1];
                        if (path.length == 3) {
                            intentName = path[1];
                        }
                    }

                    modelObj = NLUSystemUtil.getObjectFromGR(
                        NLUModel.getGRByName(modelName), fields);
                    modelObj.name = modelObj.displayName;

                    nluModel = new NLUModel(modelObj.sys_id);
                    intentGr = intentName && nluModel.getIntents('name=' + intentName);
                    intentObj = intentGr.next() && NLUSystemUtil.getObjectFromGR(intentGr, fields);

                    entityGr = entityName && nluModel.getEntities('name=' + entityName);
                    entityObj = entityGr.next() && NLUSystemUtil.getObjectFromGR(entityGr, fields);

                    errorObj = {
                        message: gs.getMessage(record.messageKey, record.replacements),
                        type: type,
                        model: modelObj,
                        intent: intentObj,
                        entity: entityObj,
                        originalMessage: record.message
                    };
                    if (record.sample) {
                        utterance = record.sample.value;
                        unknown = record.sample.tokens;
                        errorObj.utterance = utterance;
                        errorObj.unknown = unknown;
                    }
                    errors.push(errorObj);
                }
            }
        });

        return errors;
    };

    NLUHelper.prototype = {
        type: 'NLUHelper',
        initialize: function() {}
    };
})();
