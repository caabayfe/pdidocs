var methodBrowser = {
	methodPrefix : 'pa.',
	hideParameterFields: function() {
		document.getElementById('element_methodBrowser_date1').style.display = 'none';
		document.getElementById('element_methodBrowser_date2').style.display = 'none';
	},
	formatDate: function(date) {
		if (date === 'score_start' || date === 'score_end')
			return date;
		return '\'' + date + '\'';
	},
	changeMethod: function(element) {
		this.hideParameterFields();
		var method = methods[element.selectedIndex];
		var description = document.getElementById('methodBrowser_description');
		description.innerHTML = this.setDescription(method);
		if (!method.paramTypes)
			return;

		var params = method.paramTypes.split(',');
		var hasDate = false;
		for (var i = 0; i < params.length; i++) {
			switch (params[i]) {
				case 'Date':
					if (!hasDate) {
						hasDate = true;
						document.getElementById('element_methodBrowser_date1_label').innerHTML = singleDateLabel;
						document.getElementById('element_methodBrowser_date1').style.display = 'block';
						document.getElementById('methodBrowser_date1_msg').style.display = 'block';
					} else {
						document.getElementById('element_methodBrowser_date1_label').innerHTML = multiDateLabel;
						document.getElementById('element_methodBrowser_date2').style.display = 'block';
						document.getElementById('methodBrowser_date1_msg').style.display = 'none';
					}
					break;
				case 'Indicator':
					//ignore Indicator parameters
					break;
				default:
					window.console.log('methodBrowser: unknown parameter type - ' + params[i]);
					break;
			}
		}
	},
	setDescription: function(method) {
		//remove any non-printable characters in the example string.
		var example = method.example.replace(/[^a-zA-Z0-9_\[\{\}\]\\(\).$%\'\-, ]/gmi,'');
		var description = '<p>' + methodLabel + ' <b><i>' +
			this.methodPrefix + method.name + '(' + method.params + ')</i></b></p><p>' +
			method.returnDescription + '</p>';
		if (method.returnType === 'String')
			description += '<p>' + nonNumericWarning + '</p>';

        description += '<br><p>' + method.description + '</p><br><p>' +
            exampleLabel + ': <i>' + example + '</i></p>';
        return description;
    },
    initDescription: function() {
        var element = document.getElementById('methodBrowser_method');
        element.onchange();

		var isULBSupported = false;
		var isULBEnabled = false;
		var isMlbSysPropertyEnabled = '$[JS:gs.getProperty("com.snc.pa.dm.enable.mlb", "false")]';

        if (isMlbSysPropertyEnabled == 'true') {
            var gr = new GlideRecord('pa_indicators');
            gr.addQuery('sys_id', g_scratchpad.sys_id);
            gr.query();
            while (gr.next()) {
                isULBSupported = gr.getValue('is_mlb_supported');
                isULBEnabled = gr.getValue('is_mlb_enabled');
            }

            if (isULBEnabled == 'true' && isULBSupported == 'true') {
                var element_ULB_message = document.getElementById('element_methodBrowser_ULB');
                element_ULB_message.style.display = 'block';
            }
        }		        
	},
	getMethodString: function() {
		var method = methods[document.getElementById('methodBrowser_method').selectedIndex];
		var preview = this.methodPrefix + method.name + '(';
		if (!method.paramTypes)
			return preview + ')';

		var params = method.paramTypes.split(',');
		var hasDate = false;
		var firstParm = true;
		for (var i = 0; i < params.length; i++) {
			if (!firstParm)
				preview += ',';

			firstParm = false;
			switch (params[i]) {
				case 'Date':
					if (!hasDate) {
						hasDate = true;
						preview += this.formatDate(document.getElementById('methodBrowser_date1').getValue());
					} else {
						preview += this.formatDate(document.getElementById('methodBrowser_date2').getValue());
					}
					break;
				case 'Indicator':
					preview += 'Indicator';
					break;
				default:
					window.console.log('methodBrowser: unknown parameter type - ' + params[i]);
					break;
			}
		}
		preview += ')';
		return preview;
	}
};

addLoadEvent(methodBrowser.initDescription);
