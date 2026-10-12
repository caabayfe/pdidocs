var __scriptName = Class.create();
__scriptName.prototype = {
  category: 'password_reset.extension.__scriptCategory',	// DO NOT REMOVE THIS LINE!

  /**********
   * Returns an auto-generated string password
   * 
   * @param params.credentialStoreId The sys-id of the target password-reset credential store to generate a password for (table: pwd_cred_store)
   * @return An auto-generated string password. 
   **********/
  process: function(params) {
    return '12345678';
  },

  type: '__scriptName'

};
