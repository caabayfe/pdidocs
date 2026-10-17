var __scriptName = Class.create();
__scriptName.prototype = {
  category: 'password_reset.extension.__scriptCategory',	// DO NOT REMOVE THIS LINE!

  /**********
   * Returns boolean telling whether the user is enrolled.
   * 
   * @param params.enrolledUserId The sys-id of the user being checked (table: sys_user)
   * @param params.verificationId The sys-id of the verification being checked (table: pwd_verification)
   * @return boolean telling whether the user is enrolled into the specified verification
   **********/
  process: function(params) {
    return false;
  },

  type: '__scriptName'

};
