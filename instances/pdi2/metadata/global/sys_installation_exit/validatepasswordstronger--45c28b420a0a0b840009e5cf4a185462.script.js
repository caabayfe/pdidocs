gs.include("PrototypeServer");

var ValidatePasswordStronger = Class.create();
ValidatePasswordStronger.prototype = {

        process : function() {
           var user_password = request.getParameter("user_password");
           if (GlideStringUtil.nil(user_password)) {
			   user_password = request.getParameter("sysparam_new_password");
		   }

           var min_len = 8;

           var rules = gs.getMessage("Password must be at least {0} characters long and contain a digit, an uppercase letter, and a lowercase letter.", min_len);

           if (user_password.length() < min_len) {
              gs.addErrorMessage(gs.getMessage("TOO SHORT") + ": " + rules);
              return false;
           }

           var digit_pattern = new RegExp("[0-9]", "g");
           if (!digit_pattern.test(user_password)) {
              gs.addErrorMessage(gs.getMessage("DIGIT MISSING") + ": " + rules);
              return false;
           }

           var upper_pattern = new RegExp("[A-Z]", "g");
           if (!upper_pattern.test(user_password)) {
              gs.addErrorMessage(gs.getMessage("UPPERCASE MISSING") + ": " + rules);
              return false;
           }

           var lower_pattern = new RegExp("[a-z]", "g");
           if (!lower_pattern.test(user_password)) {
              gs.addErrorMessage(gs.getMessage("LOWERCASE MISSING") + ": " + rules);
              return false;
           }

           return true; // password is OK
        }
}
