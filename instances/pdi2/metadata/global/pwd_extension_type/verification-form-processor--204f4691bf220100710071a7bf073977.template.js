var __scriptName = Class.create();
__scriptName.prototype = {
  category: 'password_reset.extension.__scriptCategory',	// DO NOT REMOVE THIS LINE!

  /**********
   * Process the verification form request, and return whether the user was successfully verified
   * 
   * @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
   * @param params.userId         The sys-id of the user trying to be verified (table: sys_user)
   * @param params.verificationId The sys-id of the verification to be processed (table: pwd_verification)
   * @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
   * @return boolean telling whether the user is successfully verified
   **********/
  processForm: function(params, request) {
    return false;
  },

  type: '__scriptName'

};
