var __scriptName = Class.create();
__scriptName.prototype = {
  category: 'password_reset.extension.__scriptCategory',	// DO NOT REMOVE THIS LINE!

  /**********
   * Process the identification form request, and returns the user's sys_id.  if user was not identified return null.
   *
   * @param params.processId   The sys-id of the calling password-reset process (table: pwd_process)
   * @param request            The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
   *                           Supported request paramters:
   *                               sysparm_user_id - the user identifier value entered in the form.                        
   * @return The sys-id of the user that corresponds to the requested input; if no user was found, null should be returned.
   **********/
  processForm: function(params, request) {
    return null;
  },

  type: '__scriptName'

};
