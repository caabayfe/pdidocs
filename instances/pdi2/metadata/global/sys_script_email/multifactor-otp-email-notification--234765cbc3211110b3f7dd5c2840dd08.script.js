(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
    var otpCode = event.parm2;
	var expiry = new GlideBoundedIntProperty("glide.multifactor.onetime.code.validity", 5, 3, 10).getInt();
	var message = gs.getMessage('Your 6-digit verification code is {0} it expires in {1} minutes. Enter the code to complete the authentication. Thank you.', [otpCode,expiry]);
	template.print(message);

})(current, template, email, email_action, event);
