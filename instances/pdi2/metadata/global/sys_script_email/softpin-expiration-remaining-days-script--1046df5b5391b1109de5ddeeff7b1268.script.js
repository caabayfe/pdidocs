(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
			var daysRemaining = JSON.parse(event.parm1).daysRemaining;
			var message ;
			switch(daysRemaining) {
				case '0': 
				message = "Your Soft PIN will expire today.";
				break;
				case '1':
				message = "Your Soft PIN will expire in a day.";
				break;
				default: 
				message = "Your Soft PIN will expire in " + '<b>' + daysRemaining + '</b>' + " days.";
			}

          template.print(message);

})(current, template, email, email_action, event);
