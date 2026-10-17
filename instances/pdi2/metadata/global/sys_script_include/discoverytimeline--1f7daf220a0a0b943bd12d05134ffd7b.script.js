// Discovery

/**
 * This script include parses an ecc_queue and performs custom sorting against the items returned to display
 * a list of node of sensor times with respect to their probe. 
 *
 * @author Mark.Johnson && Modified by Aleck.Lin
 */

// Class Imports
var TimelineItem = GlideTimelineItem;

// Constants
TABLE_NAME = 'ecc_queue';
DEVICE_SOURCE = 'sysparm_timeline_source';
AGENT_CORRELATOR = 'sysparm_timeline_agent_correlator';

var DiscoveryTimeline = Class.create();
DiscoveryTimeline.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// GET_ITEMS
	//////////////////////////////////////////////////////////////////////////////////////////////////

	getItems: function() {
		var device_source = this.getParameter(DEVICE_SOURCE);
		var agent_correlator = this.getParameter(AGENT_CORRELATOR);
		this._mapProbesAndSensors();
		this._constructPageTitle(agent_correlator, device_source);

		// Query database and parse each item
		var gr = new GlideRecord(TABLE_NAME);
		gr.orderBy('sys_created_on');

		addQuery(gr);

		var extra = gs.getMessage("The limit is set by the property glide.discovery.timeline.max_entries.");
		var max = gs.getProperty('glide.discovery.timeline.max_entries');

		if (max > 25000) {
			max = 25000;
			extra = gs.getMessage("This limit cannot be changed due to PRB1402520.");
		}
		gr.setLimit(max);

		gr.query();

		if (gr.getRowCount() >= max) {
			var count = countECCRecords();
			if (count > max) {
				gs.addErrorMessage(gs.getMessage("The number of ECC queue entries ({0}) in this discovery exceeds the allowable limit ({1}). {2}", [ count, max, extra ]));
				gs.addInfoMessage(gs.getMessage("Showing only {0} items", max));
			}
		}

		while (gr.next())
			this._parseItem(gr);

		// Now render the list of items
		this._treeify();
		for (var i = 0; i < this._item_roots.length; i++)
			this._renderTree(this._item_roots[i]);

		function addQuery(gr) {
			// TODO: is this the right thing to do?  Shouldn't we abort the whole thing, not get all records?
			if (JSUtil.notNil(agent_correlator))
				gr.addQuery('agent_correlator', agent_correlator);

			if (JSUtil.notNil(device_source)) {
				var q = gr.addQuery('source', device_source);
				q.addOrCondition("topic", "Shazzam");
			}
		}

		function countECCRecords() {
			var ga = new GlideAggregate("ecc_queue");
			addQuery(ga);
			ga.addAggregate('COUNT');
			ga.query();
			if (ga.next())
				return ga.getAggregate('COUNT');
		}
	},


	/**
   * Recursive depth-first item tree traversal...
   */  
	_renderTree: function(item) {
		this._renderItem(item);
		var kids = item.kids;
		// sort kids into descending start time order to make the display prettier...
		kids.sort(function(a, b) {
			return b.startTime - a.startTime;
		});
		for (var i = 0; i < kids.length; i++)
			this._renderTree(kids[i]);
	},

	_constructPageTitle: function(agent_correlator, device_source) {
		var pageTitle = "Discovery ";
		if (JSUtil.notNil(agent_correlator)) {
			var grs = new GlideRecord("discovery_status");
			// GlideRecord.get 1 arg form falls back to 'name' if not found by sys_id, 2 arg form throws exception if arg2 is null.
			if (grs.get('sys_id', agent_correlator))
				pageTitle += grs.number.toString();
			else
				pageTitle += 'UNKNOWN';
		}
		pageTitle += ' Timeline';   
		var titleSuffix = "";

		// if we're showing a device timeline...
		if (JSUtil.notNil(device_source)) {
			titleSuffix = " for " + device_source;
			var gr = new GlideRecord('discovery_device_history');
			gr.addQuery('source', device_source);
			gr.addQuery('status', agent_correlator);
			gr.query();
			if (gr.next()) {
				var cigr = new GlideRecord('cmdb_ci');
				cigr.addQuery('sys_id', gr.cmdb_ci);
				cigr.query();
				if (cigr.next()) 
					titleSuffix = " for " + cigr.name + " (" + device_source + ")";
			}
		}

		this.setPageTitle(pageTitle + titleSuffix);
	},

	_renderItem: function(queueItem) {
		var item = new TimelineItem(TABLE_NAME, queueItem.sysId);
		var span = item.createTimelineSpan(TABLE_NAME, queueItem.sysId);
		span.setTimeSpan(queueItem.startTime, queueItem.endTime);
		span.setSpanText(queueItem.text);
		span.setSpanColor(queueItem.spanColor);
		span.setInnerSegmentTimeSpan(queueItem.innerSegStartTime, queueItem.innerSegEndTime);
		span.setInnerSegmentClass(queueItem.innerClass);

		if (queueItem.predecessor)
			span.addPredecessor(queueItem.predecessor);
		var tooltip = '';
		for (var i = 0; i < queueItem.tips.length; i++) {
			var tip = queueItem.tips[i];
			tooltip += '<strong>' + tip.title + ': </strong>' + tip.value + '<br/>';
		}
		if (queueItem.cidata)
			tooltip += queueItem.cidata;
		if (tooltip)
			span.setTooltip(tooltip);

		// Finally, add the item (which contains the span).
		this.add(item);
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// CORE OBJECT
	//////////////////////////////////////////////////////////////////////////////////////////////////

	// map of items by sys_id
	_item_map: {},
	// root item (Shazzam probe)...
	_item_roots: [],

	_parseItem: function(gr) {
		var payload = '' + gr.payload;
		var name = '' + gr.name;
		var isProbe = (gr.queue == 'output');

		var probe = this._getProbe(payload, name);
		var item = this._getItem(gr, probe, isProbe, payload, name);
		this._addTooltips(item, gr, probe, isProbe, payload, name);

		this._item_map[item.sysId] = item;
	},

	_addTooltips: function(item, gr, probe, isProbe, payload, name) {
		if (isProbe)
			this._addTooltip(item, "Probe", probe.probe_name);
		else
			this._addTooltip(item, "Sensor", probe.sensor_name);

		this._addTooltip(item, "Topic", gr.topic.toString());
		this._addTooltip(item, "Name", gr.name.toString());
		var agent = '' + gr.agent;
		agent = agent.replace('mid.server.', '');
		this._addTooltip(item, "Agent", agent);

		if (!isProbe) {
			var i = payload.indexOf(' probe_time="');
			if (i >= 0) {
				var start = i + 13;
				var end = payload.indexOf('"', start);
				var probeMS = payload.substring(start, end);
				var pred = this._item_map[item.predecessor];
				this._addTooltip(pred, "Probe execution time", (probeMS/1000).toFixed(2) + ' Seconds'); // Convert it to the neareast 2nd decimal
			}
		}

		this._getProcessedTime(item, gr);
		this._parsePayload(item, payload, name);
	},

	_getItem: function(gr, probe, isProbe, payload, name) {
		var item = {};
		item.sysId = '' + gr.sys_id.toString();
		item.startTime = gr.sys_created_on.getGlideObject().getNumericValue();
		item.endTime = gr.sys_updated_on.getGlideObject().getNumericValue();
		item.innerSegStartTime = gr.sys_created_on.getGlideObject().getNumericValue();
		item.innerSegEndTime = gr.processed.getGlideObject().getNumericValue();
		item.innerClass = isProbe ? 'silver' : 'green';
		item.isProbe = isProbe;
		item.spanColor = isProbe ? '#000000': 'tomato';
		item.text = '' + gr.source;
		if (item.text.indexOf('.') >= 0)
			item.text += ': ';
		else
			item.text = '';
		item.text += isProbe ? probe.probe_name : probe.sensor_name;
		item.kids = [];
		item.tips = [];

		if (JSUtil.notNil(gr.response_to))
			item.predecessor = '' + gr.response_to.toString();

		return item;
	},

	_getProbe: function(payload, name) {
		var probe = this.probeMap[name];
		var i = payload.indexOf('<parameter name="probe" value="');
		if (i >= 0) {
			var probe_sys_id = payload.substr(i + 31, 32);
			probe = this.probeMap[probe_sys_id];
		}
		return probe;
	},

	_treeify: function() {
		for (var sys_id in this._item_map) {
			var item = this._item_map[sys_id];
			if (item.predecessor) {
				var parent = this._item_map[item.predecessor];
				if (parent)
					parent.kids.push(item);
				else
					this._item_roots.push(item);
			} else
				this._item_roots.push(item);
		}
		// sort roots into ascending start time order to make the display prettier...
		this._item_roots.sort(function(a, b) {
			return a.startTime - b.startTime;
		});
	},

	_getProcessedTime: function(item, gr) {
		var timeStart     = parseInt( gr.sys_created_on.getGlideObject().getNumericValue(), 10);
		var timeProcessed = parseInt( gr.processed.getGlideObject().getNumericValue(), 10);
		var timeEnd       = parseInt( gr.sys_updated_on.getGlideObject().getNumericValue(), 10);

		if (gr.queue == 'output') {
			this._addTooltip(item, "Instance queue time", this._getTimeDisplay(timeProcessed - timeStart));
			this._addTooltip(item, "MID server processing time", this._getTimeDisplay(timeEnd - timeProcessed)); 
		} else if (gr.queue == 'input') {
			this._addTooltip(item, "Instance queue time", this._getTimeDisplay(timeProcessed - timeStart));
			this._addTooltip(item, "Instance processing time", this._getTimeDisplay(timeEnd - timeProcessed)); 
		}
	},

	_getTimeDisplay: function(timeDuration) {
		if (timeDuration < 0)
			timeDuration = 0;

		var d = new GlideDuration(); 
		d.setNumericValue(timeDuration);
		return d.getDisplayValue();
	},

	_parsePayload: function(item, payload, name) {
		if (JSUtil.nil(payload))
			return;

		if ((name.indexOf("Classify") < 0) && (name.indexOf("Identity") < 0))
			return;

		var i = payload.indexOf('<parameter name="cidata" value="');
		if (i < 0)
			return;

		var start = i + 32;
		var end = payload.indexOf('"', start);
		var ciDataXML = payload.substring(start, end);
		ciDataXML = JSUtil.unescapeText(ciDataXML);
		ciDataXML = ciDataXML.replace(JSUtil.QT_ENT, '"');
		var ciData = new CIData();
		ciData.fromXML(ciDataXML);
		item.cidata = '<div style="margin:6px 12px; background-color:#ccc; font:0; height:1px;"></div><strong>CI Data: </strong>' + 
			this._constructCIDataOutput(ciData);
	},

	/**
   * Makes a single query of the probe and sensor tables to build a map of information that's used later to show probe and sensor names.
   */
	_mapProbesAndSensors: function() {
		var smap = {};
		var sgr = new GlideRecord('discovery_sensor');
		sgr.query();
		while (sgr.next()) {
			var probe = '' + sgr.reacts_to_probe;
			var name = '' + sgr.name;
			smap[probe] = name;
		}

		var pmap = {};
		var pgr = new GlideRecord('discovery_probes');
		pgr.query();
		while (pgr.next()) {
			var probe = {};
			probe.sys_id = '' + pgr.sys_id;
			probe.probe_name = '' + pgr.name;
			probe.sensor_name = smap[probe.sys_id];
			probe.ecc_queue_name = '' + pgr.ecc_queue_name;
			pmap[probe.sys_id] = probe;
			pmap[probe.ecc_queue_name] = probe;
		}
		this.probeMap = pmap;
	},

	_constructCIDataOutput: function(ciData) {
		var output = ciData.toString();
		output = output.substr(17);
		return '<div style="white-space:pre;">' + output + "</div>";
	},

	_addTooltip: function(item, title, value) {
		var tip = {};
		// PRB1699332: Avoid HTML injection
		tip.title = title.replaceAll('<', '&lt;');
		tip.value = value.replaceAll('<', '&lt;');
		item.tips.push(tip);
	},

	type: 'DiscoveryTimeline'
});
