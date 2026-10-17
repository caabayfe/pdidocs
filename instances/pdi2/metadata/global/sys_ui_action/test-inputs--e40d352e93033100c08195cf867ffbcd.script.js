function doIt() {
	"use strict";
	
	var ti18n = new GwtMessage();
	
	if (g_form.modified) {
		var withoutsave = confirm(ti18n.getMessage('Changes have been made to the activity.\nThis test will not include unsaved changes.\n\nContinue test without saving?'));
		if (!withoutsave) 
			return false;
	}
	
	var inputTransform = g_form.getValue('input_transform');
	var iT = JSON.parse(inputTransform);
	var inputs = getDollarBraces(iT);
	inputs = inputs.join(',');

    var dialogType = (window.GlideModal) ? GlideModal : GlideDialogWindow;
    var dialog = new dialogType("provider_runner");
	
    dialog.setSize(800, 400);
    dialog.setTitle(ti18n.getMessage("Fill in your test values")); 
    dialog.setPreference("input_transform", encodeURI(inputTransform));
	dialog.setPreference("input_fields", encodeURI(inputs));
    dialog.setPreference("sysparm_provider_sys_id", g_form.getValue('base_provider'));
    dialog.render();

	
	
	function arrayUniqueOrder(a1) {
		var a = [];
		for (var i=0; i != a1.length; i++) {
			var foundFlag = false;
			for (var o=0; o!=a.length; o++) {
				if (a[o] == a1[i])
					foundFlag=true;
			}
			if (!foundFlag)
				a.push(a1[i]);
		}
		return a;
	}

	function getDollarBraces(obj) {
	    var a = [];
	    var recurse = function (ob) {
	        var key;
	        if ('object' !== typeof (ob)) {
	
	            var re = /\$\{\s*(.*?)\s*\}/g;
	            var tempmatch;
	            var matches = [];
	            while ((tempmatch = re.exec(ob)) !== null)
	                matches.push(tempmatch[1]);
	
	            a = a.concat(matches);
	
	        } else {
	            for (key in ob) {
	                if (ob.hasOwnProperty(key)) {
	                    recurse(ob[key]);
	                }
	            }
	        }
	    };
	    recurse(obj);
	
	    return arrayUniqueOrder(a);
	}
}
