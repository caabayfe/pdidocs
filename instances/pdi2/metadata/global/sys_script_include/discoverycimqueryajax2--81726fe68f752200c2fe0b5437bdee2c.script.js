/**
 * Provides AJAX controller methods for the CIM Query UI Page
 */
var DiscoveryCimQueryAjax2 = Class.create();

// DiscoveryIncludes
var g_array_util = new ArrayUtil();

DiscoveryCimQueryAjax2.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	ajaxFunction_query: function() {
		var prefGr,
			query = {
				ip: ''+this.getParameter('sysparm_ip'),
				namespace: ''+this.getParameter('sysparm_namespace'),
				query: ''+this.getParameter('sysparm_query'),
				parsedQuery: '' + this.getParameter('sysparm_parsedQuery'),
				current: '' + this.getParameter('sysparm_current'),
				xmlRequest: '' + this.getParameter('sysparm_xmlRequest'),
				xmlResponse: '' + this.getParameter('sysparm_xmlResponse'),
				jsonResponse: '' + this.getParameter('sysparm_jsonResponse'),
				mid: '' + this.getParameter('sysparm_mid'),
				chunksize: '' + this.getParameter('sysparm_chunksize'),
				limit: this.getParameter('sysparm_limit')
			};

		if (!query.mid) {
			// select the appropriate MID for the specified IP based on MID IP ranges
			var midFinder = new MIDServerFinder();
			midFinder.setRangesByIPOrHostname(query.ip);
			var midNames = midFinder.getMIDServers();
			if (midNames.length === 0)
				return 'error:' + midFinder.getStatusMessage();
			query.mid = midNames[0];
		}

		// save user preferences
		var userId = ''+gs.getSession().getUser().getID();
		for (var shortName in query) {
			prefGr = new GlideRecord('sys_user_preference');
			prefGr.addQuery('user', userId);
			prefGr.addQuery('name', 'cimquery2.' + shortName);
			prefGr.query();
			if (!prefGr.next()) {
				prefGr = new GlideRecord('sys_user_preference');
				prefGr.user = userId;
				prefGr.type = 'string';
				prefGr.name = 'cimquery2.' + shortName;
			}

			prefGr.value = query[shortName];
			prefGr.update();
		}      

		var probe = SncProbe.get('CIM Query 2');
		probe.setType('JavascriptProbe');
		probe.setName('CIMQuery2Tool');
		probe.setProbeName('CIM Query 2');
		probe.setTopic('JavascriptProbe');
		probe.setSource(query.ip);
		probe.addParameter('source', query.ip);
		probe.addParameter('port', '5989');
		probe.addParameter('namespace', query.namespace);
		probe.addParameter('queries', query.parsedQuery);
		probe.addParameter('instance', query.instance);

		probe.addParameter('cimquery.show.xml.request', query.xmlRequest);
		probe.addParameter('cimquery.show.xml.response', query.xmlResponse);
		probe.addParameter('cimquery.show.json.response', query.jsonResponse);
		probe.addParameter('chunkSize', query.chunksize);
		probe.addParameter('limit', query.limit || 0);
		probe.addParameter('skip_sensor', "true");
		probe.addParameter('allQueryParms', JSON.stringify(query));

		probe.setEccPriority('0');
		var probeId = probe.create(query.mid);
		return probeId;
	},

	ajaxFunction_poll: function() {

		try {
			var probeId = ''+this.getParameter('sysparm_probe_id'),
				eccqGr = new GlideRecord('ecc_queue');

			eccqGr.addQuery('queue', 'input');
			eccqGr.addQuery('response_to', probeId);
			eccqGr.orderByDesc('sequence');
			eccqGr.query();
			if (!eccqGr.next())
				return;

			var payload = ''+eccqGr.payload;
			if (payload == '<see_attachment/>') {
				var sa = new GlideSysAttachment();
				payload = sa.get(eccqGr, 'payload');
			}

			if (('' + eccqGr.state) != 'processed') {
				eccqGr.state = 'processed';
				eccqGr.processed = new GlideDateTime();
				if (this.getParameter('sysparm_mid'))
					eccqGr.agent = '' + this.getParameter('sysparm_mid');
				if (this.getParameter('sysparm_ip'))
					eccqGr.source = ''+this.getParameter('sysparm_ip');
				eccqGr.update();
			}

			var xml = GlideXMLUtil.parse(payload);
			xml = xml.getElementsByTagName('output');
			xml = xml && xml.item(0);
			xml = xml && xml.getTextContent();
			if (xml)
				return xml;

			payload = new XMLHelper().toObject(payload);
			return 'error:' + JSON.stringify((payload['@error'] || payload.error || payload));

		} catch (e) {
			return 'error:' + e + ' ' + e.stack;
		}
	},

	ajaxFunction_getMids: function() {
		var midNames, gr,
			ipRegex = /^(?:.*?:\/\/)?(.*?)(?::.*)?$/,
			ip = ipRegex.exec(''+this.getParameter('sysparm_ip'))[1],
			midFinder = new MIDServerFinder();
		
		midFinder.setRangesByIPOrHostname(ip);
		midNames = midFinder.getMIDServers();
		
		if (midNames.length)
			return JSON.stringify(midNames);

		midNames = [ ];
		gr = new GlideRecord('ecc_agent');
		gr.query();
		while (gr.next())
			midNames.push('' + gr.name);
		
		return JSON.stringify(midNames);
	},

	type: 'DiscoveryCimQueryAjax2'
});
