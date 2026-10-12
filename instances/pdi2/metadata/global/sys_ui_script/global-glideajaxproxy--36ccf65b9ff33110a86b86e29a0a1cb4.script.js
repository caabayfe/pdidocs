function GlideAjaxProxy(scriptName) {
	var _params_ = {};
	var scriptGr;
	var response;
	var glideAjaxDocument;

	this.addParam = function(name, value) {
		_params_[name] = value;
	};

	this.getXML = function(callback) {
		glideAjaxDocument = new GlideAjaxDocument();
		_execAjax_();
		var xmlReponse = {
			// TBD
			responseXML: {
				documentElement: {
					getAttribute: function() {
						if (response == null || response == undefined) {
							return response;
						}
						return response.toString();
					}
				},
				getElementsByTagName: function(name) {
					return glideAjaxDocument.getDocumentItemsByName(name);
				}
			}
		};
		callback(xmlReponse);
		return xmlReponse;
	};
	this.getXMLAnswer = function(callback) {
		glideAjaxDocument = new GlideAjaxDocument();
		_execAjax_();
		if (response != null) {
			callback(response);
		}
		return response;
	};

	this.getAnswer = function() {
		return response;
	};

	this.setScope = function(scope) {
		this.addParam('sysparm_scope', scope);
		return this;
	}

	function __validateAPI__(scriptName) {
		var gr = new GlideRecord('sys_script_include');
		gr.addQuery('client_callable', true);
		gr.addQuery('api_name', scriptName);
		gr.query();
		return gr.hasNext();
	}

	function __getScriptInstantiation__(name) {
		return new Script()
			.append('var scriptInstance = new ' + name + '();')
			.append('scriptInstance.getParameter = function(name) { return _ctx[name]; }')
			.append('scriptInstance.newItem = function(name) { return ajaxDocument.createNewItem(name); }')
			.build();
	}

	function __getContextInjection__() {
		return new Script()
			.append('var _ctx = ' + JSON.stringify(_params_) + ';')
			.build();
	}

	function __getScriptMethodCall__() {
		return new Script()
			.append('var __response__ = scriptInstance["' + _params_['sysparm_name'] + '"].call(scriptInstance);')
			.append('answer = __response__;')
			.build();
	}

	function resolveScriptNameHelper(scriptName) {
		var scopeAndName = scriptName.split(".");
		var scope, name;
		if (scopeAndName.length > 1) {
			scope = scopeAndName[0];
			name = scopeAndName[1];
		} else if (scopeAndName.length === 1) {
			scope = scriptRecordScopeName || 'global';
			name = scopeAndName[0];
		}

		return scope + '.' + name;
	}

	/* Forms a wrapper script that can be executed in the Rhino environment */
	function _execAjax_() {
		var currentResponse = null;
		try {
			var sb = new Script();
			var resolvedScriptName = resolveScriptNameHelper(scriptName);
			// 1. validate the script include with the given 'scriptName'
			if (__validateAPI__(resolvedScriptName)) {
				// 2. Feed the params to the SI, so that they are accessible via 'this.getParameter()'
				sb.append(__getContextInjection__(resolvedScriptName));
				// 3. Instantiate the script include
				sb.append(__getScriptInstantiation__(resolvedScriptName));
				// 4. Call the Script Include method (sysparm_name)
				sb.append(__getScriptMethodCall__());
				var se = new ScriptExecutor(sb.build(), glideAjaxDocument);
				currentResponse = se.execute();
			}
		} catch (e) {

		}
		response = currentResponse;
	}
}

function GlideAjaxDocument() {
	var documentItems = [];

	this.createNewItem = function(name) {
		if (!name)
			name = "item";
		var documentItem = new DocumentItem(name);
		documentItems.push(documentItem);
		return documentItem;
	};

	this.getDocumentItemsByName = function(name) {
		if (!name)
			name = "item";
		var resultItems = [];
		documentItems.forEach(function(item) {
			if (item.getName() == name)
				resultItems.push(item);
		});
		return resultItems;
	};

	function DocumentItem(itemName) {
		var name = itemName;
		var attributes = {};

		this.setAttribute = function(key, value) {
			attributes[key] = value;
		};

		this.getName = function() {
			return name;
		};

		this.getAttribute = function(key) {
			return attributes[key];
		};
	}
}

function Script() {
	var scriptPartials = [];
	this.append = function(partial) {
		if (partial) {
			scriptPartials.push(partial);
		}
		return this;
	};

	this.newLine = function() {
		scriptPartials.append('\n');
	};

	this.run = function() {
		return new ScriptExecutor(this.build()).execute();
	};

	this.build = function() {
		return scriptPartials.join('\n\n');
	};
}

function ScriptExecutor(script, glideAjaxDocument) {
	script = script || '';
	this.execute = function() {
		try {
			// Wrap in IIFE ?
			return __eval__(script, glideAjaxDocument);
		} catch (e) {
			return {
				status: 'failure',
				error: e.message
			};
		}
	};

	function __eval__(script, glideAjaxDocument) {
		var scriptGr = new GlideRecord('sys_ux_client_script_include');
		if (scriptGr.get('8d8b046a9fd00210a86b86e29a0a1c5a')) {
			scriptGr.setValue('script', script);
			scriptGr.setValue('sys_scope', scriptRecordScope);
			return g_va_proxy_script_evaluator.executeClientScript(scriptGr, {'ajaxDocument': glideAjaxDocument});
		}
	}
}

// Initialise GlideAjax
csGlobals['GlideAjax'] = GlideAjaxProxy;
