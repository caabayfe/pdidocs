gs.include("PrototypeServer");

var DigestSingleSignOn = Class.create();
DigestSingleSignOn.prototype = {

        process : function() {

          var headerKey = GlideProperties.get("glide.authenticate.header.key", "SM_USER");
          var headerDigestKey = GlideProperties.get("glide.authenticate.header.encrypted_key", "DIGEST");
          var fieldName = GlideProperties.get("glide.authenticate.header.value", "user_name"); 
          var fkey = GlideProperties.get("glide.authenticate.secret_key");

          // Look in the Headers
          var data = request.getHeader(headerKey);
          var encdata = request.getHeader(headerDigestKey);

          // If not, then check the URL Parameters
          if (data == null || encdata == null) {
            data = request.getParameter(headerKey);
            encdata = request.getParameter(headerDigestKey);
          }
     
          // then maybe its a cookie
          if (data == null || encdata == null) {
             var CookieMan = GlideCookieMan;
             var cookies = request.getCookies();
             data = CookieMan.getCookieValue(cookies, headerKey);
             encdata = CookieMan.getCookieValue(cookies, headerDigestKey);
          }

          // if found run encryption
          if (data != null && encdata != null) {
            try {

              // Replace all spaces with plus(+)'s, converted in url         
              encdata = encdata.replaceAll(' ', '+');

              // ----- Ecrypt the username 
              var key = this.getDigest(data, fkey);

              // Check for match of recieved encoded data
              // and your encoding of user name
              if (encdata == key) {
                var ugr = new GlideRecord("sys_user");
                ugr.initialize();
                if (!ugr.isValidField(fieldName)) {
                  var Log = GlideLog;
                  Log.warn("External authorization is set to use field: '"
                            + fieldName + "' which doesn't exist");

                  SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "failure", "user_name=" + data, "");
                  return "failed_missing_requirement";
                }
                ugr.addQuery(fieldName, data);
                ugr.query();
                if (!ugr.next()) {
                  var User = GlideUser;
                  var userLoad = User.getUser(data);
                  if (userLoad == null) {
                      SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "failure", "user_name=" + data, "");
					  return "failed_authentication";
				  }
                  ugr.initialize();
                  ugr.addQuery(fieldName, data);
                  ugr.query();
                  if (!ugr.next()) {
                    SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "failure", "user_name=" + data, "");
                    return "failed_authentication";
				  }
                }
                var userName = ugr.getValue("user_name");
                SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "success", "user_name=" + data, "");
                return userName;
              } else {
                SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "failure", "user_name=" + data, "");
                return "failed_authentication";
              }
            } catch(e) {
                gs.log(e);
                SNC.SecurityEventSender.sendLoginGCFEvent("Digest", "failure", "user_name=" + data, "");
                return "failed_authentication";
            }
          // Encoded data didn't match recieved Encoded data
          } else {
            return "failed_missing_requirement";
          }
        },

        getDigest : function( data, fkey ) {
          try {
            // default to something JDK 1.4 has
            var MAC_ALG = "HmacSHA1";
            return  SncAuthentication.encode(data, fkey, MAC_ALG);
            
          } catch (e) {
              gs.log(e.toString());
              throw 'failed_missing_requirement';
          }  
        }        
};
