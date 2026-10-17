var ScriptDetails = Class.create();
ScriptDetails.prototype = {
    initialize: function() {
        this.CACHE_CATALOG = "oe_tool_executor_script_func_params_cache";
        this.cacheManager = sn_scoped_cache.ScopedCacheManager;
    },

    getScript: function(sys_id) {
        try {
            var isEsLatest = true;
            var script = "";

            // Fetch the Script Include record
            var gr = new GlideRecord('sys_script_include');
            if (gr.get(sys_id)) {
                script = gr.getValue('script') || "";
                var sysScopeId = gr.getValue('sys_scope');

                // Fetch the Store App record for js_level
                var scopeGr = new GlideRecord('sys_store_app');
                if (scopeGr.get(sysScopeId)) {
                    var jsLevel = scopeGr.getValue('js_level') || "";
                    if (jsLevel && jsLevel !== 'es_latest') {
                        isEsLatest = false;
                    }
                }
            }

            // Use acorn if es12 is enabled, otherwise fall back to esprima
            if (isEsLatest) {
                return new global.acorn().parseScript(script);
            } else {
                // Fallback to the old implementation using esprima
                var util = new global.CatalogScriptStaticAnalyser();
                return esprima.parse(script);
            }
        } catch (e1) {
            try {
				// Parse the script using the preferred parser (based on js_level) and fall back to the alternate parser if parsing fails 
                if (isEsLatest) {
                    var util2 = new global.CatalogScriptStaticAnalyser();
                    return esprima.parse(script);
                }
                return new global.acorn().parseScript(script);
            } catch (e2) {
                gs.error(sn_i18n.Message.getMessage("global", "ScriptDetails.getScript failed to parse script include sys_id={sys_id} acorn/esprima errors: {e1}  | {e2}", {
                    sys_id: sys_id,
                    e1: e1.message,
                    e2: e2.message
                }));
                return null;
            }
        }
    },

    getAllFunctionNamesUtil: function(node, result) {
        if (!node || typeof node !== 'object') return;

        // Handle method definitions in object literals
        if (node.type === 'Property' &&
            node.value &&
            (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression') &&
            node.key &&
            node.key.name) {
            result.push(node.key.name);
        }

        // Handle function declarations
        if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
            result.push(node.id.name);
        }

        // Recursively process child nodes
        for (var key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
                this.getAllFunctionNamesUtil(node[key], result);
            }
        }
    },

    getFuncParamsWithInitParams: function(sysId, functionName) {
        var cacheKey = sysId + "#" + functionName;
        var funcParamsMap = this.cacheManager.get(this.CACHE_CATALOG, cacheKey);

        // If not in cache, parse the script and extract parameters
        if (gs.nil(funcParamsMap)) {
            var parsedScript = this.getScript(sysId);
            var funcParams = this.getFunctionParamsByNameUtil(parsedScript, functionName);
            var initializeFuncParams = this.getFunctionParamsByNameUtil(parsedScript, "initialize");

            funcParamsMap = {
                "funcParams": funcParams,
                "initFuncParams": initializeFuncParams
            };
            // persist in cache
            this.cacheManager.putRow(this.CACHE_CATALOG, cacheKey, JSON.stringify(funcParamsMap), sysId);
            return funcParamsMap;
        }
        // Return parsed cache entry
        return JSON.parse(funcParamsMap);
    },

    getAllFunctionNames: function(sys_id) {
        var result = [];
        this.getAllFunctionNamesUtil(this.getScript(sys_id), result);
        if (result)
            return Array.from(new Set(result)); // Remove duplicates with Set
    },

    getFunctionParamsByNameUtil: function(node, functionName) {
        if (!node || typeof node !== 'object') return null;

        // Check for method in object literal
        if (node.type === 'Property' &&
            node.value &&
            (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression') &&
            node.key &&
            node.key.name === functionName) {
            return node.value.params.map(param => param.name);
        }

        // Check for function declaration
        if (node.type === 'FunctionDeclaration' &&
            node.id &&
            node.id.name === functionName) {
            return node.params.map(param => param.name);
        }

        // Recursively check children
        for (var key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
                var result = this.getFunctionParamsByNameUtil(node[key], functionName);
                if (result) return result;
            }
        }

        return null;
    },

    getFunctionParamsByName: function(sys_id, function_name) {
        return this.getFunctionParamsByNameUtil(this.getScript(sys_id), function_name);
    },

    getFunctionNodeByName: function(node, functionName) {
        if (!node || typeof node !== 'object') return null;

        // Check for method in object literal
        if (node.type === 'Property' &&
            node.value &&
            (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression') &&
            node.key &&
            node.key.name === functionName) {
            return node.value;
        }

        // Check for function declaration
        if (node.type === 'FunctionDeclaration' &&
            node.id &&
            node.id.name === functionName) {
            return node;
        }

        // Recursively check children
        for (var key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
                var result = this.getFunctionNodeByName(node[key], functionName);
                if (result) return result;
            }
        }

        return null;
    },

    containsReturnStatement: function(node) {
        if (!node || typeof node !== 'object') return false;

        if (node.type === 'ReturnStatement' && node.argument !== null && node.argument !== undefined) {
            return true;
        }

        for (var key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
                if (this.containsReturnStatement(node[key])) {
                    return true;
                }
            }
        }

        return false;
    },

    doesFunctionReturn: function(sys_id, functionName) {
        var script = this.getScript(sys_id);

        var functionNode = this.getFunctionNodeByName(script, functionName);

        if (!functionNode || !functionNode.body) return false;

        return this.containsReturnStatement(functionNode.body);
    },

    type: 'ScriptDetails'
};
