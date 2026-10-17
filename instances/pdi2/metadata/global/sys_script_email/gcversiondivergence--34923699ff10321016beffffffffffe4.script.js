(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

        var data = JSON.parse(event.parm1);
		var message = gs.getMessage("One or more applications on this instance are out of sync with the Now Assist suite version. Immediate review and update via the Application Manager is required to maintain system integrity.");
		template.print(message);
		template.print("\n");
		template.print("<ul>");
		var apps = data.apps;
		for (let i = 0; i < apps.length; i++) {
			var app = apps[i];
			var appName = app.name;
			var appId = app.id;
			var appVersion = app.version;
			console.log("HI:"+appName);
			var appLink = gs.getProperty('glide.servlet.uri') + "now/app-manager/home/app/id/" + appId + "/v/" + appVersion;
			template.print("<li><a title="+appName+" href="+appLink+">"+appName+"</a></li>");
		}
		template.print("</ul>");

})(current, template, email, email_action, event);
