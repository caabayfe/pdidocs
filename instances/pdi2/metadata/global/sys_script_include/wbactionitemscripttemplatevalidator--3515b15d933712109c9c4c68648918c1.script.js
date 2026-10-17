const WBActionItemScriptTemplateValidator = Class.create();
WBActionItemScriptTemplateValidator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  ITEM_PARAMS_SCRIPT_HEADER: "(function WriteBackAction(input",
  
  INPUT_SCREEN_SCRIPT_HEADER: "(function WriteBackAction(parm_input",
  
  WB_INPUT_PARAM_SCRIPT_TEMPLATE: "(function WriteBackAction(input) {" +
    "\r\n    //Type appropriate comment here, and begin script below\r\n\r\n})(input);",
  
  WB_INPUT_SCREEN_SCRIPT_TEMPLATE: "(function WriteBackAction(parm_input, parm_variable, additionalData, actionResult) {" +
    "\r\n    //Type appropriate comment here, and begin script below\r\n\r\n})(parm_input, parm_variable, additionalData, actionResult);", 

  FORM_MODE: {
    ITEM_PARAM_MODE: "itemParamMode",
    INPUT_SCREEN_MODE: "inputScreenMode"
  },
  
  SCRIPT_MODE: {
    EMPTY: 'emptyMode',
    ITEM_PARAM_NON_MODIFIED: 'itemParamNonModified',
    ITEM_PARAM_MODIFIED: 'itemParamModified',
    INPUT_SCREEN_NON_MODIFIED: 'inputScreenNonModified',
    INPUT_SCREEN_MODIFIED: 'inputScreenModified',
    UNKNOWN: 'unknownMode'
  },

  getFormMode: function(parameterScreenValue) {
    return parameterScreenValue ? this.FORM_MODE.INPUT_SCREEN_MODE : this.FORM_MODE.ITEM_PARAM_MODE;
  },

  getScriptMode: function(executionScriptValue) {
    if (executionScriptValue === '')
      return this.SCRIPT_MODE.EMPTY;
      
    const normalizedScript = executionScriptValue.replace(/\s/g, "");
    if (normalizedScript === this.WB_INPUT_PARAM_SCRIPT_TEMPLATE.replace(/\s/g, ""))
      return this.SCRIPT_MODE.ITEM_PARAM_NON_MODIFIED;
    if (normalizedScript === this.WB_INPUT_SCREEN_SCRIPT_TEMPLATE.replace(/\s/g, ""))
      return this.SCRIPT_MODE.INPUT_SCREEN_NON_MODIFIED;
      
    if (executionScriptValue.indexOf(this.ITEM_PARAMS_SCRIPT_HEADER) >= 0)
      return this.SCRIPT_MODE.ITEM_PARAM_MODIFIED;
    if (executionScriptValue.indexOf(this.INPUT_SCREEN_SCRIPT_HEADER) >= 0)
      return this.SCRIPT_MODE.INPUT_SCREEN_MODIFIED;
    
    return this.SCRIPT_MODE.UNKNOWN;
  },

  shouldReplaceTemplate: function(formCurrentMode, scriptCurrentMode) {
    if (formCurrentMode === this.FORM_MODE.ITEM_PARAM_MODE &&
        (scriptCurrentMode === this.SCRIPT_MODE.ITEM_PARAM_NON_MODIFIED || scriptCurrentMode === this.SCRIPT_MODE.ITEM_PARAM_MODIFIED)
    ) {
      return false;
    }
      
    if (formCurrentMode === this.FORM_MODE.INPUT_SCREEN_MODE &&
        (scriptCurrentMode === this.SCRIPT_MODE.INPUT_SCREEN_NON_MODIFIED || scriptCurrentMode === this.SCRIPT_MODE.INPUT_SCREEN_MODIFIED)
    ) {
      return false;
    }
      
    return true;
  },

  getExecutionResult: function(resultObj) {
    return JSON.stringify(resultObj);
  },

  getReplacementTemplate: function(formCurrentMode) {
    if (formCurrentMode === this.FORM_MODE.INPUT_SCREEN_MODE)
      return this.WB_INPUT_SCREEN_SCRIPT_TEMPLATE;
    if (formCurrentMode === this.FORM_MODE.ITEM_PARAM_MODE)
      return this.WB_INPUT_PARAM_SCRIPT_TEMPLATE;
    return '';
  },

  shouldShowWarningDialog: function(scriptCurrentMode, formCurrentMode) {
    // If the script mode is unknown, show the warning.
    if (scriptCurrentMode === this.SCRIPT_MODE.UNKNOWN) return true;
    
    // Cross-check modifications between modes.
    if (formCurrentMode === this.FORM_MODE.ITEM_PARAM_MODE && scriptCurrentMode === this.SCRIPT_MODE.INPUT_SCREEN_MODIFIED)
      return true;
    if (formCurrentMode === this.FORM_MODE.INPUT_SCREEN_MODE && scriptCurrentMode === this.SCRIPT_MODE.ITEM_PARAM_MODIFIED)
      return true;
    
    return false;
  },

  validate: function() {
    const parameterScreenValue = String(this.getParameter("parameter_screen"));
    const executionScriptValue = String(this.getParameter("execution_script"));
    
    const result = {};
    const formCurrentMode = this.getFormMode(parameterScreenValue);
    result["formCurrentMode"] = formCurrentMode;

    const scriptCurrentMode = this.getScriptMode(executionScriptValue);
    result["scriptCurrentMode"] = scriptCurrentMode;
    
    const shouldReplace = this.shouldReplaceTemplate(formCurrentMode, scriptCurrentMode);
    result["shouldReplace"] = shouldReplace;
    if (!shouldReplace)
      return this.getExecutionResult(result);
    
    result["execution_script"] = this.getReplacementTemplate(formCurrentMode);
    
    const shouldShowDialog = this.shouldShowWarningDialog(scriptCurrentMode, formCurrentMode);
    result["shouldShowDialog"] = shouldShowDialog;
    if (!shouldShowDialog)
      return this.getExecutionResult(result);
      
    result["dialogTitle"] = gs.getMessage('Warning: Script template misconfiguration detected');
    result["dialogPreferences"] = {
      body: gs.getMessage('It was detected that the script template is not appropriate for the current parameter screen configuration. Do you want to modify the script template? If so, all script changes will be deleted'),
      focusTrap: true,
      buttonLabelComplete: gs.getMessage('Yes'),
      buttonLabelCancel: gs.getMessage('No')
    };
    
    return this.getExecutionResult(result);
  },

  type: 'WBActionItemScriptTemplateValidator'
});
