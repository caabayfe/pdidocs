function runClientScript() {
	el = document.getElementById('29f2fbef93308300f4e3705bb47ffb82');
	gsftSubmit(el);
}

var sortBy = 'name',
	showingGraphs = { },
	graphingBy = { },
	defaultGraphBy = 'probeTime',
	avg = false,
	direction = 1;

function fetchTotalsFromDoc() {
	el = document.getElementById('rawData');
	if (!el)
		return;
	totals = JSON.parse(el.innerText);

	renderMessage('name');
}

function renderMessage(sortedBy) {

	if (sortedBy == sortBy) {
		direction *= -1;
		if (sortedBy != 'name' && direction == 1)
			avg = !avg;
	} else
		sortBy = sortedBy;

	msgs = document.querySelectorAll('.outputmsg');
	for (i = 0; i < msgs.length; i++) {
		if (i)
			msgs[i].style = 'display:none';
		else {
			msgs[i].style = "max-height:80vh;overflow:auto;padding-bottom:25px";
			el = document.querySelector('#output_messages');
			if (el)
				el.style = "max-height:unset";
		}
	}

	msgs = getInfoMessage();
	document.querySelectorAll(".outputmsg_text")[0].innerHTML = msgs;
}

if (typeof window == "undefined")
	runServerScript();
else
	fetchTotalsFromDoc();

action.setRedirectURL(current);

function runServerScript() {
	gr = new GlideRecord('ecc_queue');
	gr.addQuery('agent_correlator', current.sys_id);
	gr.addQuery('queue', 'input');
	gr.addQuery('state', 'processed');
	gr.orderBy('sys_created_on');
	//gr.addQuery('name', 'STARTSWITH', 'VMWare');

	gr.query();
	totals = { count: 0, queueTime: 0, probeTime: 0, instanceTime: 0, avgqueueTime: 0, avgprobeTime: 0, avginstanceTime: 0 };

	while (gr.next()) {
		name = '' + gr.name;
		totals[name] = totals[name] || { count: 0,
										queueTime: 0, probeTime: 0, instanceTime: 0, 
										queueTimes: [ ], probeTimes: [ ], instanceTimes: [ ],
									    maxqueueTime: 0, maxprobeTime: 0, maxinstanceTime: 0 };

		totals[name].count++;
		totals.count++;

		created = getTime(gr.sys_created_on);
		processed = getTime(gr.processed);
		updated = getTime(gr.sys_updated_on);

		if (!created || !processed || !updated)
			continue;

		queueTime = processed - created;
		instanceTime = updated - processed;

		// We're pulling the time out of the date strings but we assume the times
		// refer to the same date.  If the elapsed time is less than 0 assume they're
		// on different days and add a day's worth of seconds.
		if (queueTime < 0)
			queueTime += 86400;
		if (instanceTime < 0)
			instanceTime += 86400;

		totals[name].queueTime += queueTime;
		totals[name].instanceTime += instanceTime;

		totals[name].queueTimes.push(queueTime);
		totals[name].instanceTimes.push(instanceTime);

		totals[name].maxqueueTime = Math.max(totals[name].maxqueueTime, queueTime);
		totals[name].maxinstanceTime = Math.max(totals[name].maxinstanceTime, instanceTime);

		totals.queueTime += queueTime;
		totals.instanceTime += instanceTime;

		payload = '' + gr.payload;

		if (payload == '<see_attachment/>') {
			var saGr = new GlideRecord('sys_attachment');
			saGr.addQuery('table_sys_id', gr.getUniqueValue());
			saGr.addQuery('table_name', gr.getTableName());
			saGr.addQuery('file_name', 'payload.txt');
			saGr.query();
			if (saGr.next()) {
				var sa = new GlideSysAttachment(saGr.sys_id);
				payload = String(Packages.java.lang.String(sa.getBytes(saGr)));
			}
		}

		probeTime = payload.match(/probe_time="([0-9]+)"/);
		if (probeTime) {
			probeTime = (probeTime[1])/1000;
			totals.probeTime += probeTime;
			totals[name].probeTime += probeTime;
			totals[name].probeTimes.push(probeTime);
			totals[name].maxprobeTime = Math.max(totals[name].maxprobeTime, probeTime);
		} else
			gs.log('No probe time in ' + gr.sys_id);
	}

	var msg = '';
	try {
		msg = getInfoMessage();
	} catch (e) { }
	gs.addInfoMessage(msg + '<div id="rawData" style="display:none">' + JSON.stringify(totals) + '</div>');
}

function changeGraph(evt) {
	var header = evt.currentTarget.dataset.name,
		graphBy = graphingBy[header] || defaultGraphBy;

	if (graphBy == 'queueTime')
		graphBy = 'probeTime';
	else if (graphBy == 'probeTime')
		graphBy = 'instanceTime';
	else if (graphBy == 'instanceTime')
		graphBy = 'queueTime';

	graphingBy[header] = graphBy;
	
	msgs = getInfoMessage();
	document.querySelectorAll(".outputmsg_text")[0].innerHTML = msgs;
}

function toggleGraph(evt) {
	var header = evt.currentTarget.dataset.name;
	showingGraphs[header] = !showingGraphs[header];
	var style = evt.currentTarget.nextSibling.nextSibling.style;
	if (showingGraphs[header])
		style.display = '';
	else
		style.display = 'none';
}

function getInfoMessage() {
	var sb = sortBy;

	if (sb == 'name')
		sb = 'queueTime';
	else if (avg)
		sb = 'avg' + sb;

	msgs = '<table style="background-color: inherit"><tbody>';
	msgs += '<tr><td onclick="renderMessage(\'name\');">Probe Name</td><td /><td  onclick="renderMessage(\'queueTime\');">Queue Time&nbsp;&nbsp;&nbsp;&nbsp;</td><td onclick="renderMessage(\'probeTime\');">Probe Execution Time&nbsp;&nbsp;&nbsp;&nbsp;</td><td  onclick="renderMessage(\'instanceTime\');">Instance Execution Time&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>';

	keys = Object.keys(totals);
	keys.forEach(function(name) { addAvgs(totals[name]); });
	keys.sort(function(a,b) {
		if (sortBy == 'name')
			return direction*(a.toUpperCase() > b.toUpperCase() ? 1 : -1);
		return (totals[a][sb] - totals[b][sb]) * direction;
	});
	keys.forEach(
		function(name) {
			if (typeof totals[name] == 'object')
				addToMsg(totals[name], 'h4', '>', name);
		});
	addToMsg(totals, 'h3', ' style="margin:0">', 'Overall');
	msgs += '<div id="rawData" style="display:none">' + JSON.stringify(totals) + '</div></table>';
	msgs += 'Sorted by ' + (avg ? 'average ' : '') + sortBy + (direction == 1 ? ', ascending' : ', descending');
	return msgs;

	function addToMsg(obj, tag, style, header) {
		addAvgs(obj);
		msgs += '<tr><td><hr style="margin:0px"/></td><td><hr style="margin:0px"/></td><td><hr style="margin:0px"/></td><td><hr style="margin:0px"/></td><td><hr style="margin:0px"/></td></tr>';
		msgs += '<tr data-name="' + header + '" onclick="toggleGraph(event);"><td rowspan="2"><' + tag + style + header + ' (' + obj.count + ' probes)&nbsp;&nbsp;&nbsp;&nbsp;</' + tag + '></td>';
		msgs += '<td>Average&nbsp;&nbsp;&nbsp;&nbsp;</td><td>' + obj.avgqueueTime + ' sec</td><td>' + obj.avgprobeTime + ' sec</td><td>' + obj.avginstanceTime + ' sec</td></tr>';
		msgs += '<tr><td>Total</td><td>' + obj.queueTime + ' sec</td><td>' + obj.probeTime.toFixed(2) + ' sec</td><td>' + obj.instanceTime + ' sec</td></tr>';

		addGraph();
		
		function addGraph() {
			var graphBy = graphingBy[header] || defaultGraphBy;

			if (!obj[graphBy + 's'])
				return;

			msgs += '<tr onclick="changeGraph(event);" data-name="' + header + '"';
			if (!showingGraphs[header])
				msgs += ' style="display:none"';
			msgs += '><td>';
			obj[graphBy + 's'].forEach(function(val) { msgs += getStyle(val, obj['avg'+graphBy], obj['max'+graphBy]); });
			msgs += '</td><td>' + graphBy + '</td></tr>';

			function getStyle(val, avg, max) {
				var red = 255,
					green = 255,
					height = Math.round(10 * val / avg),
					margin = Math.round(10 * max / avg) - height;

				if (val > avg)
					green = Math.min(255, (255 * avg / val) | 0);
				else
					red = Math.min(255, (255 * val / avg) | 0);

				return '<div style="width:5px;height:' + height + 'px;margin-top: ' + margin + 'px;background-color:rgb(' + red + ',' + green + ',' + 0 + ');float:left"></div>';
			}
		}
	}
}

function addAvgs(obj) {
   obj.avgqueueTime = (obj.queueTime / obj.count).toFixed(2);
   obj.avgprobeTime = (obj.probeTime / obj.count).toFixed(2)
   obj.avginstanceTime = (obj.instanceTime / obj.count).toFixed(2);
}

function getTime(date) {
	date = '' + date;
	var d = date.match(/([0-9][0-9]:[0-9][0-9]:[0-9][0-9])/);
	if (!d || !d.length)
		return;
	d = new Date('Thu Aug 31 2017 ' + d[1] + ' GMT-700 (PDT)');
	return d.getTime()/1000;
}
