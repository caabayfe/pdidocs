var ListTransformUtils = Class.create();
ListTransformUtils.prototype = (function() {
    function initialize() {
    }

	function cloneDeep(x) {
        if (typeof x !== 'object') return x;

        var k, tmp, str=Object.prototype.toString.call(x);

        if (str === '[object Object]') {
            if (x.constructor !== Object && typeof x.constructor === 'function') {
                tmp = new x.constructor();
                for (k in x) {
                    if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
                        tmp[k] = cloneDeep(x[k]);
                    }
                }
            } else {
                tmp = {}; // null
                for (k in x) {
                    if (k === '__proto__') {
                        Object.defineProperty(tmp, k, {
                            value: cloneDeep(x[k]),
                            configurable: true,
                            enumerable: true,
                            writable: true,
                        });
                    } else {
                        tmp[k] = cloneDeep(x[k]);
                    }
                }
            }
            return tmp;
        }

        if (str === '[object Array]') {
            k = x.length;
            for (tmp=Array(k); k--;) {
                tmp[k] = cloneDeep(x[k]);
            }
            return tmp;
        }

        if (str === '[object Date]') {
            return new Date(+x);
        }

        if (str === '[object RegExp]') {
            tmp = new RegExp(x.source, x.flags);
            tmp.lastIndex = x.lastIndex;
            return tmp;
        }

        return x;
    }

    function validateTransformedCollection(initialMap, transformed, type) {
        var finalItems = [];
        
        // reconcile rows & columns. no adding/removing rows. no adding columns
        var transformedMap = {};
        transformed.forEach(function (item) {
            transformedMap[item.key] = item;
        });

        // Iterate through the initialRowsMap keys
        for (var item of initialMap) {
            var key = item['key'];
            // Check if the item exists in the transformed items
            var foundItem = transformedMap[key];

            // If the initial item exists in the transformed items, add it to finalItems
            if (foundItem) {
                finalItems.push(foundItem);
            }
            // if its a row and we didnt find the initial item in the transformed items, add it back
            else if (type === 'row') {
                gs.warn(`Transformation Script: Removing ${type}s in the transform script is not supported. Adding initial ${type} back. key = ${key}`);
                finalItems.push(initialMap[key]);
            }
        }
        if (Object.keys(transformedMap).length > Object.keys(initialMap).length) {
            gs.warn(`Transformation Script: Adding ${type}s in the transform script is not supported. Removing ${type}.`);
        }
        return finalItems;
    }

    function bootstrapTransformBuilder(data, featureFlags) {
        var actions = data.declarativeActions ? data.declarativeActions.declarativeActions : [];
        return new sn_now_list_common.ListTransformScriptBuilder(actions)
            .setRowDefinitions(data.rowDefinitions)
            .setColumnDefinitions(data.columnDefinitions)
            .setFeatureFlags(featureFlags)
            .setTableName(data.tableName);
    }

    function processFeatureFlags(data, featureFlags) { 
        var transformBuilder = bootstrapTransformBuilder(data, featureFlags);
        var transformResult =  transformBuilder.transform();

        return {
            columnDefinitions: transformResult.columnDefinitions,
            rowDefinitions: transformResult.rowDefinitions,
            declarativeActions: data.declarativeActions,
            shouldAggregatesRowBeSticky: transformResult.shouldAggregatesRowBeSticky
        };
    }

    const validateGalleryConfig = (galleryConfig) => {
        if (!galleryConfig || typeof galleryConfig !== 'object') {
            gs.warn('ListTransform: Invalid galleryConfig: Expected an object.');
            return false;
        }
        if (!galleryConfig.fields || typeof galleryConfig.fields !== 'object') {
            gs.warn('ListTransform: Invalid fields: Expected an object.');
            return false;
        }

        const primaryFields = ['heading', 'tagline', 'metadata', 'bodyText'];
        
        // Validate primary fields
        for (const field of primaryFields) {
            const fieldData = galleryConfig.fields[field];
			if(!fieldData) continue;
            if (typeof fieldData !== 'object') {
                gs.warn(`ListTransform: Missing or invalid field: ${field}`);
                return false;
            }
            if (typeof fieldData.column !== 'string') {
                gs.warn(`ListTransform: Invalid column type in field: ${field}`);
                return false;
            }
        }

        // Validate supplementaryFields
        const supplementaryFields = galleryConfig.fields.supplementaryFields;
		if(supplementaryFields) {
            // Validate supplementaryFields only if it exists
            if (!Array.isArray(supplementaryFields)) {
                gs.warn('ListTransform: Invalid supplementaryFields: Expected an array.');
                return false;
            }

            // Validate each item in supplementaryFields
            for (const item of supplementaryFields) {
                if (!item || typeof item !== 'object' || typeof item.column !== 'string') {
                    gs.warn('ListTransform: Invalid item in supplementaryFields: Each item must be an object with a string column.');
                    return false;
                }
            }
        }

        return true;
    };


    function processTransform(transformScriptSysId, transformScriptArgs, preTransformData, featureFlags) {
        var transformResult = null;
        var scriptFailedMessage = "Transformation script failed. ";
        var checkLogsMessage = "Please check debug logs for more details.";
        
        var gr = new GlideRecord('sys_script_include');
        var transformFound = gr.get(transformScriptSysId);

        if (!transformFound) {
            return preTransformData;
        }

        // Create maps of the initial rows and columns to reconcile after transform
        var initialRowsMap = 
            this.cloneDeep(preTransformData.rowDefinitions.rows)
                .reduce(function(map, row) {
                    map[row.key] = row;
                    return map;
                }, {});

        var initialColumnsMap = 
            this.cloneDeep(preTransformData.columnDefinitions.columns)
                .reduce(function(map, col) {
                    map[col.key] = col;
                    return map;
                }, {});
        
        var evaluator = new GlideScopedEvaluator();
        var transformBuilder = bootstrapTransformBuilder(preTransformData, featureFlags);
        evaluator.putVariable('transformBuilder', transformBuilder);
        evaluator.putVariable('transformScriptArgs', transformScriptArgs);
        transformResult = evaluator.evaluateScript(gr, 'script', null);

        // transform script error but try/catch not present in transform script so cant catch
        if (!transformResult) {
            throw new Error(scriptFailedMessage + checkLogsMessage);
        }
        // try / catch added in our default transform template is handled here
        if (transformResult.failed === true) {
            throw new Error(scriptFailedMessage + transformResult.error);
        }

        // reconcile rows. no adding/removing rows
        var validatedRows = validateTransformedCollection(
                                                    preTransformData.rowDefinitions.rows,
                                                    transformResult.rowDefinitions.rows,
                                                    'row'
                                                );
        transformResult.rowDefinitions.rows = validatedRows;

        const galleryConfig = transformResult.columnDefinitions.galleryConfig;
        if (galleryConfig && !validateGalleryConfig(galleryConfig)) {
            throw new Error(scriptFailedMessage + "Invalid gallery config. " + checkLogsMessage);
        }

        return {
            columnDefinitions: transformResult.columnDefinitions,
            rowDefinitions: transformResult.rowDefinitions,
            declarativeActions: preTransformData.declarativeActions,
            shouldAggregatesRowBeSticky: transformResult.shouldAggregatesRowBeSticky
        };
    }

    return {
        initialize: initialize,
        cloneDeep: cloneDeep,
        processFeatureFlags: processFeatureFlags,
        processTransform: processTransform,
        type: 'ListTransformUtils'
    };

})();
