// Constants
var SPOKE_INSTALLED_CHECK_TYPES = ['SPOKE_INSTALLED', 'TEMPLATE_SPOKE_INSTALLED'];
var SPOKE_CONFIGURED_CHECK_TYPES = ['CONNECTION_CONFIGURED'];
var INSTALL_SPOKE_URL = 'https://store.servicenow.com/sn_appstore_store.do#!/store/search?q=<scope_name>';
var CONFIGURE_SPOKE_URL = '/$flow-designer.do?sysparm_nostack=true#/welcome/connection-dashboard/<alias_id>';
var UNINSTALLED_STATUS = 'UNINSTALLED';
var NOT_CONFIGURED_STATUS = 'NOT_CONFIGURED';
var INSTALLED_CONFIGURED_STATUS = 'INSTALLED_CONFIGURED';
var STATUS_MAPPING = {};
STATUS_MAPPING[UNINSTALLED_STATUS] = gel('uninstalled').value;
STATUS_MAPPING[NOT_CONFIGURED_STATUS] = gel('needsConfig').value;
STATUS_MAPPING[INSTALLED_CONFIGURED_STATUS] = gel('installed').value;

// Get templates
var xhr = getTemplatesRequest(new XMLHttpRequest());
xhr.onreadystatechange = function() {
if (xhr.readyState == XMLHttpRequest.DONE) {
		try {
			var templates =  JSON.parse(xhr.responseText);
			var spokes = extractSpokes(templates.result);
			setSpokesInTable(spokes); // inject the spokes into the HTML
		} catch (e) {
			console.error('Error parsing templates response', e);
		}
	}
};

function getTemplatesRequest(xhr) {
	xhr.open('GET', '/api/now/templates', true);
	xhr.setRequestHeader("X-UserToken", window.g_ck);
	xhr.send(null);
	return xhr;
}

function extractSpokes(templates) {
	var spokes = {};
	var spokesStatuses = SPOKE_INSTALLED_CHECK_TYPES.concat(SPOKE_CONFIGURED_CHECK_TYPES);

    if (templates.length === 0) {
		return spokes;
	}

	templates.forEach(function (template) {
		var dependenciesResult = template.dependency_evaluation_results || [];

		var dependenciesSpokesResults = dependenciesResult.filter(function(result) {
			var dependency = result.dependency || {};
			var inputs = dependency.inputs || {};
			return spokesStatuses.includes(result.type) && inputs.hasOwnProperty('scope_name');
		});

		dependenciesSpokesResults.forEach(function(result) {
			var dependencyScope = result.dependency.inputs.scope_name;
			var existingSpokeObject = spokes[dependencyScope] || {};
			spokes[dependencyScope] = Object.assign(existingSpokeObject, {
				name: result.dependency.inputs.spoke_name || dependencyScope,
				scopeName: dependencyScope,
				id: dependencyScope
			});

			setSpokeStatusAndLink(spokes[dependencyScope], result);
		});
	});
	
	return spokes;
}

function setSpokeStatusAndLink(currentSpoke, result) {
	if (currentSpoke.status === UNINSTALLED_STATUS) { // It is uninstalled. This trumps all other checks
		return;
	}
	if (SPOKE_INSTALLED_CHECK_TYPES.includes(result.type) && result.checkFailed) {
		currentSpoke.status = UNINSTALLED_STATUS;
		currentSpoke.link = INSTALL_SPOKE_URL.replace('<scope_name>', result.dependency.inputs.scope_name);
		return;
	}
	if (currentSpoke.status === NOT_CONFIGURED_STATUS) { // It is not configured. This trumps other checks below
		return;
	}
	if (SPOKE_CONFIGURED_CHECK_TYPES.includes(result.type) && result.checkFailed) {
		currentSpoke.status = NOT_CONFIGURED_STATUS;
		currentSpoke.link = CONFIGURE_SPOKE_URL.replace('<alias_id>', result.dependency.inputs.alias_id);
		return;
	}
	currentSpoke.status = INSTALLED_CONFIGURED_STATUS;
	currentSpoke.link = null;
}

function setSpokesInTable(spokes) {
	var html = '';
	Object.keys(spokes).map(function(key) {
		html = html + '<tr>' + getSpokeNameCell(spokes[key]) + getSpokeStatusCell(spokes[key]) +'</tr>';
	});
	
	var tBodyNode = document.getElementById('insert-spokes-here');
	tBodyNode.insertAdjacentHTML('afterbegin', html);
}

function getSpokeNameCell(spoke) {
	if (spoke.link) {
		return '<td><a href="' + spoke.link + '" target="_blank" class="spokeName">' + spoke.name + '</a></td>';
	}
	return '<td class="spokeName">' + spoke.name + '</td>';
}

function getSpokeStatusCell(spoke) {
	return '<td>' + STATUS_MAPPING[spoke.status] + '</td>';
}
