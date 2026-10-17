gs.include("PrototypeServer");

var LogoutRedirect = Class.create();
LogoutRedirect.prototype = {

        process : function() {
          var gotoURL = "http://www.google.com";

          response.sendRedirect("logout_redirect.do?sysparm_url=" + gotoURL);

          return true;
        }

}
