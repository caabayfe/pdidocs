var MutualAuth = Class.create();

MutualAuth.prototype = {
   initialize : function(request, response, auth_type, auth_value) {
      this.request = request;
      this.response = response;
      this.auth_type = auth_type;
      this.auth_value = auth_value;
   },
   
   getAuthorized : function() {
      var result = GlideUser.authenticateMutualAuthToken();
      if (!result) {
         gs.log("Mutual authentication failed.");
         return null;
      }
      
      // user is authenticated, so return it...
      return result;
   }
};
