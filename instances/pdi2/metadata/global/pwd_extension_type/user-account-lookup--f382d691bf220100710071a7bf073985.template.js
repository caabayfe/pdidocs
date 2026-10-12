var __scriptName = Class.create();
__scriptName.prototype = {
  category: 'password_reset.extension.__scriptCategory',	// DO NOT REMOVE THIS LINE!

  /**********
   * Returns the credential-store account id for a given user
   * 
   * @param params.userId  The sys-id of the user being checked (table: sys_user)
   * @return               The credential-store account-id (string) for a given user
   **********/
  process: function(params) {
    return 'john.doe';
  },

  type: '__scriptName'

};
