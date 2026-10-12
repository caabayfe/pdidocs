(function() {
	console.log('here');
    var diagInfo = document.getElementById('diagInfo');
    if (!diagInfo)
		console.error('#diagInfo is missing');

    var diagStatus = document.getElementById('diagStatus');
    if (!diagStatus)
        console.error('#diagStatus is missing');

    var diagSetupSchema = document.getElementById('diagSetupSchema');
    if (!diagSetupSchema)
        console.error('#diagSetupSchema is missing');

    var testInfo = document.getElementById('testInfo');
    if (!testInfo)
        console.error('#diagInfo is missing');

    var diagTestSchema = document.getElementById('diagTestSchema');
    if (!diagTestSchema)
        console.error('#diagTestSchema is missing');

    function renderSetupDiagnostic(status) {
        if (!status) {
            console.error('status cannot be null');
            return false;
        }

        diagInfo.innerText = 'Last checked: ' + status.date;
        diagSetupSchema.innerText = '';
        updateStatusBadge(diagStatus, status.health);
        diagStatus.style.display = 'inline';
        renderTree(diagSetupSchema, status);
        console.debug("Hermes Setup Health", status);
    }

    function renderTestMessageDiagnostic(status) {
        if (!status) {
            console.error('status cannot be null');
            return false;
        }
		
        updateStatusBadge(diagStatus, status.health);
        renderTree(diagTestSchema, status);
        console.debug("Hermes Test Message", status);
        testInfo.innerText = "";
        testInfo.classList.remove("status-badge");
    }

    function updateStatusBadge(el, status) {
        switch (status) {
            case "RED":
                el.innerText = "MALFUNCTION";
                el.classList.add('red');
                break;
            case "YELLOW":
                el.innerText = "DEGRADED";
                el.classList.add('yellow');
                break;
            case "GREEN":
                el.innerText = "OPERATIONAL";
                el.classList.add('green');
                break;
            case "GRAY":
                el.innerText = "DISABLED";
                el.classList.add('gray');
                break;
            default:
                el.innerText = "UNKNOWN";
                break;
        }
    }

    function renderTree(parent, component, nesting) {
        nesting = nesting || 0;
        if (!component.children)
            return;
        var keys = Object.keys(component.children);
        if (!keys.length === 0)
            return;

        for (var i = 0; i < keys.length; ++i) {
            var childId = keys[i];
            var child = component.children[childId];

            var childEl = document.createElement('div');
            childEl.id = parent.id + "." + childId;

            var childTitle = document.createElement('h4');
            childTitle.innerText = toName(keys[i]);

            var childStatus = document.createElement('span');
            childStatus.classList.add('status-badge');
            updateStatusBadge(childStatus, child.health);

            childEl.append(childTitle);
            childEl.append(childStatus);

            if (child.warnings && child.warnings.length > 0) {
                for (var j = 0; j < child.warnings.length; ++j){
                    var warnings = document.createElement('pre');
					var warning = (typeof child.warnings[j]) === 'object' ? child.warnings[j].message : child.warnings[j];
                    warnings.append(warning + '\n');
                    childEl.append(warnings);
				}
            }
            renderTree(childEl, child, nesting + 1);
            parent.append(childEl);
        }
    }

    function toName(id) {
        output = "";
        words = id.split('_');
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            if (i > 0)
                output += " ";
         
            if (word.length <= 1)
                output += word;
             else
                output += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
         }
        
        return output;
    }

	// AJAX call to run diagnostics for setup, which should be immediate
	var ajax = new GlideAjax('HermesDiagnostics');
	ajax.addParam('sysparm_name', 'getSetupStatus');
	ajax.getXML(function(response) {
		if (!response || !response.responseXML || !response.responseXML.documentElement) {
			diagInfo.innterText = 'Invalid response received from server';
			diagInfo.classList.add('error');
			return;
		}

		var answer = response.responseXML.documentElement.getAttribute("answer");
        if (!answer) {
            diagInfo.innerText = 'Empty response received from server';
            diagInfo.classList.add('error');
            return;
        }

        var status;
        try {
            status = JSON.parse(answer);
        } catch (e) {
			console.error('Malformed response received from server', e, answer);
            diagInfo.innerText = 'Malformed response received from server';
            diagInfo.classList.add('error');
            return;
        }

        // Render the health
		renderSetupDiagnostic(status);
	});
	
	// AJAX call to run test message, which will take a few seconds
	var ajaxTestMessage = new GlideAjax('HermesDiagnostics');
	ajaxTestMessage.addParam('sysparm_name', 'getTestMessage');
	ajaxTestMessage.getXML(function(response){
		if (!response || !response.responseXML || !response.responseXML.documentElement) {
			diagInfo.classList.add('error');
			return;
		}

		var answer = response.responseXML.documentElement.getAttribute("answer");
        if (!answer) {
            diagInfo.innerText = 'Empty response received from server';
            diagInfo.classList.add('error');
            return;
        }

		var status;
        try {
            status = JSON.parse(answer);
        } catch (e) {
			console.error('Malformed response received from server', e, answer);
            diagInfo.innerText = 'Malformed response received from server';
            diagInfo.classList.add('error');
            return;
        }
		renderTestMessageDiagnostic(status);
	});
})();
