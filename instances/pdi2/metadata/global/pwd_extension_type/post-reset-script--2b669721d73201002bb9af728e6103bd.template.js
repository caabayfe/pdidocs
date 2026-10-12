var __scriptName = Class.create();
 __scriptName.prototype = {
   category: 'password_reset.extension.__scriptCategory',       // DO NOT REMOVE THIS LINE!
 
   /**********
   * Execute custom actions after the password reset process has completed.
   * 
   * @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
   * @param params.wfSuccess      A flag indicating if workflow completed sucessfully. True if (and only if) sucessful.
   * @return no return value
    **********/
   process: function(params) {
     return;
   },
 
   type: '__scriptName'
}
