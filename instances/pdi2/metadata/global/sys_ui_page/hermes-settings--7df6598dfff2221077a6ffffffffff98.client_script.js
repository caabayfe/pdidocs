(function() {
	var categoriesContainer = document.getElementById('categories-container');
	var saveButton = document.getElementById('saveSettings');

	var modifiedSettings = {};
	
	const jobsByCategory = {
		"Topic Management": ["Hermes Topics Util"],
		"Client Connection": ["Hermes Active Cluster Heartbeat"],
		"Health Status": ["Hermes Health Status Check", "Auto Flush hermes_system_status"],
		"Kafka Integration": ["Hermes Kafka Client Metrics Collection", "Hermes Usage Metrics Aggregation and Clean up Daily", "Hermes Usage Metrics Aggregation Monthly", "Hermes Flush Expired Idle Consumers", "Auto Flush hermes_metrics_collection"],
		"IP Access Control": ["Hermes IP ACL Publish Job", "Auto Flush hermes_ip_filtering_audit"],
		"High Availability and Failover": ["Hermes Failover State Refresh Job"],
		"Logging + Health Metrics": ["Hermes Periodic Purge", "Hermes Metadata Collection", "Auto Flush hermes_usage_metrics (Daily)", "Auto Flush hermes_usage_metrics (Yearly)"],
	};

	const AUTO_FLUSH_SYS_ID = {
		"Auto Flush hermes_system_status": "a33cddab4393021057521daa5ab8f2b6",
		"Auto Flush hermes_metrics_collection": "a48f175443133110fb2883678fb8f267",
		"Auto Flush hermes_ip_filtering_audit": "ebc880f77f231210423557accc866566",
		"Auto Flush hermes_usage_metrics (Daily)": "499f14174323311005d283678fb8f2fb",
		"Auto Flush hermes_usage_metrics (Yearly)": "2047906a43100210026cbbd32fb8f290"
	};

	var MSG_NO_CHANGES = "${gs.getMessage('No changes were made to the properties.')}";
	var MSG_ERROR = "${gs.getMessage('Error saving settings.')}";

	var ajax = new GlideAjax('HermesSettings');
	ajax.addParam('sysparm_name', 'getSettings');
	ajax.getXML(function(response) {
	
		if (!response || !response.responseXML || !response.responseXML.documentElement) {
			console.error('Invalid response received from server');
			return;
		}
		var answer = response.responseXML.documentElement.getAttribute("answer");
		if (!answer) {
			console.error('Empty response received from server');
			return;
		}
		try {
			var settings = JSON.parse(answer);

			var categories = {};
			settings.forEach(function(setting) {
				var category = setting.category;
				if (!categories[category]) {
					categories[category] = [];
				}
				categories[category].push(setting);
			});

			Object.keys(categories).sort().forEach(function(category) {
				var categorySection = document.createElement('div');
				categorySection.className = 'category-section';

				var categoryHeader = document.createElement('h2');
				categoryHeader.className = 'category-header';
				categoryHeader.textContent = category;
				categorySection.appendChild(categoryHeader);

				var table = document.createElement('table');
				table.className = 'settings-table';

				var thead = document.createElement('thead');
				thead.innerHTML = `
					<tr>
						<th>Property Name</th>
						<th>Value</th>
						<th>Valid Range</th>
						<th>Description</th>
					</tr>
				`;
				table.appendChild(thead);
				
				// Table body
				var tbody = document.createElement('tbody');
				categories[category].forEach(function(setting) {
					var tr = document.createElement('tr');
					var nameTd  = document.createElement('td');
					nameTd.innerHTML = '<div><strong>' + html(setting.displayName) + '</strong></div>' + '<div style="color:#888;font-size:smaller;word-break:break-all;">' + html(setting.propertyName) + '</div>';

					var valueTd = document.createElement('td');
					valueTd.appendChild(buildEditor(setting));

					var rangeTd = document.createElement('td');
					rangeTd.innerHTML = html(renderValidRange(setting));

					var descTd  = document.createElement('td');
					descTd.innerHTML = html(setting.description);

					tr.append(nameTd, valueTd, rangeTd, descTd);
					tbody.appendChild(tr);
				});

				table.appendChild(tbody);
				categorySection.appendChild(table);
				
				var userHasMaintRole = typeof g_user !== 'undefined' && g_user.hasRole('maint');
				if (userHasMaintRole && jobsByCategory[category]) {
					const jobDiv = document.createElement('div');
					jobDiv.className = 'job-list';
					jobDiv.innerHTML = 'Background Jobs:' + '<ul>' +
						jobsByCategory[category].map(function (job) {
							const link = AUTO_FLUSH_SYS_ID[job]
								? '/nav_to.do?uri=sys_auto_flush.do?sys_id=' + AUTO_FLUSH_SYS_ID[job]
								: '/nav_to.do?uri=sys_trigger.do?sysparm_query=name=' +
									encodeURIComponent(job);
							return '<li><a href="' + link + '" target="_blank" rel="noopener">' + job + '</a></li>';
						}).join('') + '</ul>';
					categorySection.appendChild(jobDiv);
				}

				categoriesContainer.appendChild(categorySection);
			});

			var inputs = document.querySelectorAll('.setting-input');
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].addEventListener('change', function(e) {
					var prop = this.getAttribute('data-property');
					var oldVal = this.getAttribute('data-original');
					var newVal = this.value;

					if (oldVal !== newVal) {
						modifiedSettings[prop] = { previous: oldVal, next: newVal };
					} else {
						delete modifiedSettings[prop];
					}
				});
			}

		} catch (e) {
			console.error('Failed to parse Hermes settings:', e, answer);
		}
	});

	saveButton.addEventListener('click', function() {
        if (Object.keys(modifiedSettings).length === 0) {
            alert(MSG_NO_CHANGES);
            return;
        }

		var saveAjax = new GlideAjax('HermesSettings');
		saveAjax.addParam('sysparm_name', 'saveSettings');
		saveAjax.addParam('sysparm_settings', JSON.stringify(modifiedSettings));
		saveAjax.getXML(function(response) {
		
			if (!response || !response.responseXML || !response.responseXML.documentElement) {
                alert(MSG_ERROR);
                return;
            }
			
			var answer = response.responseXML.documentElement.getAttribute("answer");

			try {
				result = JSON.parse(answer);
				if (result.savedProperties && Array.isArray(result.savedProperties)) {
					document.querySelectorAll('.setting-input').forEach(function(input) {
						var prop = input.getAttribute('data-property');
						if (result.savedProperties.indexOf(prop) !== -1) {
							input.setAttribute('data-original', input.value);
						}
					});
				}
			} catch (e) {
				console.log('Failed to parse saved Hermes properties', e, answer);
			}

			modifiedSettings = {};
			
			window.scrollTo({
				top: 0,
				behavior: 'smooth' 
			});
		});

	});
        

	function html(text) {
		var div = document.createElement('div');
		div.innerText = text || '';
		return div.innerHTML;
	}
})();



function renderValidRange(setting) {
    if (setting.type === 'BOOLEAN')
        return 'true | false';
    if (setting.type === 'INTEGER')
        return setting.min + ' - ' + setting.max;
	if (setting.type === 'STRING' && setting.options)
        return setting.options.join(' | ');
    return '';
}


function buildEditor(setting) {
    var current = setting.currentValue || setting.defaultValue;

    if (setting.type === 'BOOLEAN' || setting.type === 'STRING') {
        var sel = document.createElement('select');
        sel.className = 'setting-input';
        sel.setAttribute('data-property', setting.propertyName);
		sel.setAttribute('data-original', current);

		var opts = setting.type === 'BOOLEAN' ? ['true', 'false'] : setting.options;
        opts.forEach(function (opt) {
            var o = document.createElement('option');
            o.value = opt;
            o.text  = opt;
            if (String(current).toLowerCase() === opt) o.selected = true;
            sel.appendChild(o);
        });
        return sel;
    }

    // default: plain input
    var inp = document.createElement('input');
    inp.type  = 'text';
    inp.className = 'setting-input';
    inp.setAttribute('data-property', setting.propertyName);
	inp.setAttribute('data-original', current);
    inp.value = current;
    return inp;
}
