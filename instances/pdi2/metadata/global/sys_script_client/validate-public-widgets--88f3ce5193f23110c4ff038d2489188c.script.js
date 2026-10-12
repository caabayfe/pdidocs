
			function onLoad() {
   //Type appropriate comment here, and begin script below
   if (g_form.getValue("public") == 'true') {
		var server_script = g_form.getValue('script');
		var message = "Secure public widgets using widget access controls. This widget is public and queries data from tables. <a href=https://docs.servicenow.com/?context=secure-widgets target='_blank' > Learn more.</a>";
		if (server_script && (server_script.indexOf('GlideRecord') > -1 || server_script.indexOf('GlideRecordSecure') > -1))
				g_form.addInfoMessage(typeof GwtMessage === 'function'
					? new GwtMessage().getMessage(message)
					: getMessage(message, function(msg){
					return msg;
				}));
   }
}
