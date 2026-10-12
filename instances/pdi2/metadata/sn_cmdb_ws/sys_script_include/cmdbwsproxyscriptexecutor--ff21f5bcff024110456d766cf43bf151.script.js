var CMDBWSProxyScriptExecutor = Class.create();
CMDBWSProxyScriptExecutor.prototype = {

	STR_FUNCTION: "function",

    initialize: function(namespace, className) {
		this.namespace = namespace; //namespace object
		this.className = className; //scripted class name (string type)
    },

	isValidClass: function() {
		if (global.JSUtil.nil(this.className))
			return false;
		try {
			return (typeof this.namespace[this.className] === this.STR_FUNCTION);
		} catch(e) {
			gs.error('Error while validating the className: {0}\nError Message: {1}', [this.className, e.message]);
			return false; //return false, if the given namespace is null/undefined or invalid className
		}
	},

	isValidFunction: function(functionName) {
		if (global.JSUtil.nil(functionName) || !this.isValidClass())
			return false;
		try {
			return (typeof this.namespace[this.className][functionName] === this.STR_FUNCTION);
		} catch(e) {
			gs.error('Error while validating the functionName: {0}.{1}\nError Message: {1}',
                        [this.className, functionName, e.message]);
			return false; //return false, if the given namespace/class is null/undefined or invalid functionName
		}
	},

	/**
	 * safely convert to array if an given arguments isn't an array
	 */
	_toArray: function(args) {

		if (!global.JSUtil.nil(args) && !(args instanceof Array))
			return [args];

		return args;
	},

	/**
	 *
	 * To invoke and return static scripted function(s)
	 *
	 * functionName - name of the function to be executed
	 * args - argument array to pass for the function
	 * defaultObject - default object to be returned incase of any
	 *                 catastrophic events (rhino unable to find/execute the class/function)
	 *
	 * ex:
	 * var safeScriptExec = new CMDBWSProxyScriptExecutor(sn_cmdb, 'CMDBWSScriptUtil');
	 * var input  = 'REL_LIST';
	 * var output = safeScriptExec.executeStaticFunction('nodeMapCacheGet', input);
	 *
	 * input = ['table_name', 'fields', 'workspaceId', glideRecord]; - (pass array incase of multiple arguments)
	 * output = safeScriptExec.executeStaticFunction('getHighlightedValueStyles', input, {});
	 *
	 */
	executeStaticFunction: function(functionName, args, defaultObject) {

		if (global.JSUtil.nil(functionName))
			return defaultObject;

		var isValid = (this.isValidClass() && this.isValidFunction(functionName));
		if (isValid)
			return this.namespace[this.className][functionName].apply(
				null, this._toArray(args));

        return defaultObject;
	},

	/**
	 * TODO: Let's comment this for now.
	 * Open it once we get ES6 support so that I can use spread (...) operator
	 * to instantiate the scripted classes & return their objects.
	 * (as of now unable to access scripted class prototype to instantiate)
	 */

// 	/**
// 	 * To instantiate the class & return the runtime object or null incase of invalid inputs/error
// 	 *
// 	 * ex:
// 	 * var constructorArgs = [1, 2];
// 	 * var safeScriptExec = new CMDBWSProxyScriptExecutor(sn_cmdb, 'CMDBWSScopedScript', constructorArgs);
// 	 * var object = safeScriptExec.instantiateObject();
// 	 *
// 	 */
// 	instantiateObject: function() {
// 		if (this.isValidClass()) {
// 			try {
// 				var constructor = this.namespace[this.className];
// 				var instance = Object.create(constructor);
// 				constructor.apply(instance, this._toArray(this.classArguments));
// 				return instance;
// 			} catch(e) {
// 				gs.error('Error while trying to instantiate the class: {0}\nError Message: {1}',[this.className, e.message]);
// 			}
// 		}
// 		return null;
// 	},

// 	/**
// 	 * To invoke scope instant functions the class & return the output or null incase of invalid inputs/error
// 	 *
// 	 * ex:
// 	 * var constructorArgs = [1, 2];
// 	 * var safeScriptExec = new CMDBWSProxyScriptExecutor(sn_cmdb, 'CMDBWSScopedScript', constructorArgs);
// 	 * var object = safeScriptExec.instantiateObject();
// 	 * var output1 = safeScriptExec.executeFunction(object, 'scopedFunction1', 'dummyArg');
// 	 * var output2 = safeScriptExec.executeFunction(object, 'scopedFunction2', [3, 4, 5]);
// 	 *
// 	 */
// 	executeFunction: function(instanceObject, functionName, functionArguments) {
// 		if (!global.JSUtil.nil(instanceObject) 
// 			&& !global.JSUtil.nil(functionName) 
// 			&& !global.JSUtil.nil(functionArguments)) {

// 			if (this.isValidFunction(functionName)) {
// 				try {
// 					return instanceObject[functionName].apply(instanceObject, 
// 																this._toArray(functionArguments));
// 				} catch(e) {
// 					gs.error('Error while trying to execute function: {0}.{1}\nError Message: {2}', 
//                         [this.className, this.functionName, e.message]);
// 				}
// 			}
// 		}
// 		return null;
// 	},

// 	/**
// 	 * To instantiate the class and invoke scope instant functions the class & return the output or 
// 	 * null incase of invalid inputs/error
// 	 * ex:
// 	 * var constructorArgs = [1, 2];
// 	 * var safeScriptExec = new CMDBWSSafeScriptExecutor(sn_cmdb, 'CMDBWSScopedScript', constructorArgs);
// 	 * var output = safeScriptExec.instantiateAndExecute('scopedFunction1', 'dummyArg');
// 	 *
// 	 */
// 	instantiateAndExecute: function(functionName, functionArguments) {
// 		var object = this.instantiateObject();
// 		return this.executeFunction(object, functionName, functionArguments);
// 	},

    type: 'CMDBWSProxyScriptExecutor'
};
