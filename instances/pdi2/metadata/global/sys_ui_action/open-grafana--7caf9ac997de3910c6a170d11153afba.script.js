var grafanaServerScriptExecuted;

function runGrafanaScript() {
	if (typeof g_list != 'undefined' && g_list)
		g_list.action('7caf9ac997de3910c6a170d11153afba', 'open_grafana');
	else
		gsftSubmit(document.getElementById('7caf9ac997de3910c6a170d11153afba'));
}

(function() {
	if (typeof window == "undefined") {
		if (!grafanaServerScriptExecuted)
			runServerScript();
		grafanaServerScriptExecuted = true;
	} else
		openWindows();

	function openWindows() {
		var dcrs, instance, dbhost, dbi, url,
			allOpened = true,
			el = document.getElementById('grafanaData');

		if (!el)
			return setTimeout(openWindows, 1000);

		dcrs = JSON.parse(el.innerText);
		dbi = dcrs.pop();
		dbhost = dcrs.pop();
		instance = dcrs.pop();

		dcrs.forEach(function(dcrs) {
			url = 'https://bdgrafanav7.servicenow.net/d/g4vpYvXZk/application-performance-monitoring-dashboard?viewPanel=20&from=' + dcrs.startedAt + 
			'&orgId=26&tab=error&to=' + dcrs.completedAt + '&var-purpose=Subproduction' +
			'&var-instance=' + instance +
			'&var-host=All&var-node=All' +
			'&var-dbhosts=' + dbhost + 
			'&var-dbi=' + dbi;
			allOpened = window.open(url, dcrs.sysId) && allOpened;
		});
		if (allOpened)
			el.parentElement.innerText = 'Grafana Opened at ' + url;
		else
			el.parentElement.innerText = 'Failed to open Grafana. Popup blocked?';
	}

	function runServerScript() {
		var parmId, gr, instance, dbhost, dbi,
			dcrs = [ ];

		action.setRedirectURL(current);
		parmId = action.getGlideURI().get('sysparm_checked_items');
		if (parmId) {
			parmId = ('' + parmId).split(',');
			action.setRedirectURL(action.getGlideURI() + '');
		} else {
			gr = new GlideRecord('discovery_status');
			if (gr.get(current.sys_id + ''))
				parmId = [ current.sys_id + '' ];
		}
		parmId.forEach(function(id) {
			var info = { sysId: id + '' };
			gr = new GlideRecord('discovery_log');
			gr.setLimit(1);
			gr.addQuery('status', info.sysId);
			gr.orderBy('sys_created_on');
			gr.query();
			gr.next();
			info.startedAt = new GlideDateTime(gr.sys_created_on).getNumericValue();
			gr = new GlideRecord('discovery_log');
			gr.setLimit(1);
			gr.addQuery('status', info.sysId);
			gr.orderByDesc('sys_created_on');
			gr.query();
			gr.next();
			info.completedAt = new GlideDateTime(gr.sys_created_on).getNumericValue() + 5 * 60 * 1000;
			dcrs.push(info);
		});
		getInstanceInfo();
		dcrs.push(instance, dbhost, dbi);
		gs.addInfoMessage('Opening Grafana for ' + parmId.join(', ') + '...<div id="grafanaData" style="display:none">' + JSON.stringify(dcrs) + '</div>');

		function getInstanceInfo() {
			var db,
				xs = new XMLDocument(new GlideXMLStats().toStringWithInclude('database,instance'));

			instance = xs.getNodeText('/xmlstats/instance_name');
			db = xs.getNodeText('/xmlstats/db.url');
			db = db.split('//');
			db = db[1];
			db = db.split(':');
			dbhost = db[0];
			dbi = dbhost + '_' + db[1].split('/')[0];
		}

	}
})();
