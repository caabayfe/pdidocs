function(controlData, responseValue) {
    /* Provide an input response handler function for the custom control

        vaVars.script_var_1 = vaVars.script_var_1
            + ', and I want to '
            + responseValue.action;
   */

  vaVars.answer = responseValue.yesOrNo;
}
