gs.include("PrototypeServer");

var Logout = Class.create();
Logout.prototype = {

        process : function() {
        var s = request.getParameter('sysparm_goto_url');
        var localLoginMethod = request.getSession().getAttribute("glide.authenticate.local.login.method");
        if ( localLoginMethod == "certificate" ) {
			if (s)
				response.sendRedirect("logout_certificate_complete.do?sysparm_goto_url=" + s);
			else
				response.sendRedirect("logout_certificate_complete.do");
			
			return true;
        }
    	if (s && GlideSecurityUtils.isURLWhiteListedStrict(s))
          response.sendRedirect(s);
        else
          response.sendRedirect("logout_success.do");

          return true;
        }

}
