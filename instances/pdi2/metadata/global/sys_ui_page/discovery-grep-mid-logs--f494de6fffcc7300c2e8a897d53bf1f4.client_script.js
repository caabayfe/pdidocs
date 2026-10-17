window.onload = function() {
	DiscoRPC.getProxy('DiscoveryQuickDiagnostics').then(function(dqd) {
		// Jelly(?) mangles these rules if they're included in the HTML - it changes the '>' to '&gt;'
		document.styleSheets[0].insertRule('.wide-container > .dragger { height: 4px; cursor: row-resize; width:100%; }');
		document.styleSheets[0].insertRule('.tall-container > .dragger { width: 4px; cursor: col-resize; height:100%; }');
		document.styleSheets[0].insertRule('.wide-container > .divider { height: 2px; width:100%; }');
		document.styleSheets[0].insertRule('.tall-container > .divider { width: 2px; height:100%; }');

	var renderLines, newContent, autoGrabbed,
			firstRender = true,
			regexes = { },
			logs = { },
			logLines = [ ],
			statusRecs = { },
			lastFirst = 0,
			lastRender = 0,
			hilites = [ 'hilite_1', 'hilite_2', 'hilite_3', 'hilite_4', 'hilite_5', 'hilite_6' ],
			elements = { debugMsg: '#debugmsg', grabLogs: '#gml_grablogs', start: '#gml-start', end: '#gml-end', sort: '#gml-header', refresh: '#gml-refresh', help: '#gml-help', helpButton: '#gml-help-button', closeHelp: '#gml-close-help' },
			templates = { summary: '#gml_summary', filter: '#gml_filter', resultContainer: '#gml_result_container' },
			handlers = {
				click: { filter: onFilterClick, grabLogs: grabLogs, start: onDateClick, end: onDateClick, sort: onSort, refresh: refresh, helpButton: onHelp, closeHelp: onCloseHelp },
				change: { filter: onFilterChange },
				scroll: { resultContainer: function() { renderResult(true); } }
			},
			openRecFilters = { ecc_queue: 'topic!=HeartbeatProbe^topicNOT LIKEqueue.^queue=output^topic!=SystemCommand^topic!=config.file' },
			emptyFilter = { action: 'hilite', type: 'regex', search: '', ecc_queueName: '', discovery_statusName: '', ecc_agentName: '', showEmpty: 0, file: 'agent0.log' },
			settings = { };

		// Helper functions for rendering
		renderTemplate.hideSearch = function(filter) { return filter.type != 'text' && filter.type != 'regex'; };
		renderTemplate.hideRecPicker = function(filter) { return filter.type != 'ecc_queue' && filter.type != 'discovery_status' && filter.type != 'ecc_agent'; };
		renderTemplate.hideFilePicker = function(filter) { return filter.type != 'file'; };

		getElements();
		addListeners();
		sdrag();

		///////////////////////////////////////////////////////////////////////////////////
		var hash = document.location.hash;// || (window.parent && window.parent.document.location.hash);

		// Re-apply settings from the URL if settings were provided
		if (hash)
			settings = JSON.parse(decodeURIComponent(hash.substr(10)));		// Remove "settings="

		// Set default values if none were provided
		settings.filters = settings.filters || [ JSON.parse(JSON.stringify(emptyFilter)) ];
		settings.filters.forEach(function(filter) {
			var name;
			for (name in emptyFilter)
				filter[name] = filter[name] || emptyFilter[name];
		});
		settings.sorts = settings.sorts || [ { name: 'date', direction: -1 } ];
		settings.start = settings.start || new Date().getTime() - 24*60*60*1000;
		settings.end = settings.end || new Date().getTime();

		// If we have any existing hilite filters we need to remove the
		// hilite colors from the list of available colors
		settings.filters.forEach(function(filter) {
			var idx;
			if (filter.action == 'hilite') {
				idx = hilites.indexOf(filter.cssClass);
				if (idx >= 0)
					hilites.splice(idx, 1);
			}
		});

		// These are going to be displayed in the browser's timezone.
		elements.start.value = dateToString(settings.start);
		elements.end.value = dateToString(settings.end);
		refresh();

		// The 'date' parameter is anything that can be passed to the Date constructor. When called with settings.start
		// or settings.end this will be a numeric value. When called from gotLog() this will be a date/time string that
		// includes timezone offset. In either case the resulting string will be in the browser's timezone. Hopefully
		// this matches the user's timezone on the instance but it's possible it won't. That's OK (if slightly confusing)
		// because times in the UI page will consistently be displayed in the browser's timezone.
		function dateToString(date) {
			var d = new Date(date);
			return d.getFullYear() + '-' + alz(d.getMonth() + 1) + '-' + alz(d.getDate()) + ' ' + alz(d.getHours()) + ':' + alz(d.getMinutes()) + ':' + alz(d.getSeconds());
			function alz(num) {		// alz -> Add leading zeros
				var s = '00' + num;
				return s.substr(s.length - 2);
			}
		}

		// Handler for "Refresh" button.
		// Also used any time we need to refresh everything
		///////////////////////////////////////////////////////////////////////////////////
		function refresh() {
			applyFilters();
			renderFilters();
			getMidLogs();
			setInterval(getMidLogs.bind(0, true), 10000);
		}

		// Handler for the "Help" button
		///////////////////////////////////////////////////////////////////////////////////
		function onHelp() {
			elements.help.removeClassName('hidden');
		}

		///////////////////////////////////////////////////////////////////////////////////
		function onCloseHelp() {
			elements.help.addClassName('hidden');
		}

		// Handler for all column headers
		///////////////////////////////////////////////////////////////////////////////////
		function onSort(evt) {
			evt.target.classList.forEach(function(name) {
				var sortColumn, idx, sort;
				if (name.startsWith('sort-')) {
					sortColumn = name.substr(5);
					idx = settings.sorts.findIndex(function(sort) { return sort.name == sortColumn; });
					if (idx == -1)
						sort = { name: sortColumn, direction: -1 };
					else {
						sort = settings.sorts[idx];
						settings.sorts.splice(idx, 1);
						if (!idx)
							sort.direction = sort.direction * -1;
					}
					settings.sorts.unshift(sort);
				}
			});
			applyFilters();
		}

		// Handler for clicking on "From" and "To" dates
		///////////////////////////////////////////////////////////////////////////////////
		function onDateClick(evt) {
			new GwtDateTimePicker(evt.target.id, 'yyyy-MM-dd HH:mm:ss', true);
		}

		// Change handler for both "From" and "To" dates
		///////////////////////////////////////////////////////////////////////////////////
		function onDateChange() {
			var time,
				match = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/.exec(this.value);

			if (match)
				time = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime();
			else
				time = Date.now();
			if (this.id == 'gml-start')
				settings.start = time;
			else
				settings.end = time;
			refresh();
		}

		// The user clicked in the Filter section
		///////////////////////////////////////////////////////////////////////////////////
		function onFilterClick(evt) {
			var el = getFilterElement(evt),
				filter = el && el.parentElement.filter;

			if (!filter)
				return;

			// Referencing "filter" from inner function onFilterRecChosen below
			// mysteriously doesn't work.  Work around this by using a global.
			g_filter = filter;

			// Was the click on an 'And' button?
			if (el.hasClassName('gml-addfilter')) {
				filter = JSON.parse(JSON.stringify(filter));
				filter.cssClass = undefined;
				settings.filters.push(filter);
				renderFilters();
			}

			// Was the click on an 'X' button?
			if (el.hasClassName('gml-removefilter')) {
				hilites.push(filter.cssClass);
				settings.filters.splice(settings.filters.indexOf(filter), 1);
				if (!settings.filters.length)
					settings.filters.push(JSON.parse(JSON.stringify(emptyFilter)));
				refresh();
			}

			// Was the click in a record picker
			if (el.hasClassName('gml-record')) {
				// Was the click on the checkbox to show matching/empty/not empty?
				if (evt.target.type == 'checkbox') {
					filter.showEmpty++;
					if (filter.showEmpty == 3)
						filter.showEmpty = 0;
					refresh();
				} else if (filter.type != 'ecc_queue' || !filter.showEmpty)
					getRecord(filter.type, openRecFilters[filter.type], onFilterRecChosen);
			}

			// Some record was chosen.  Update the filter & re-render
			function onFilterRecChosen(id, name) {
				// If I try to use 'filter' from the outer scope here it somehow gets
				// stuck on the first value it gets.  My guess is that's because this
				// is being called from a popup window.
				var filter = g_filter;

				filter[filter.type] = id;
				filter[filter.type + 'Name'] = name;
				onFilterChange();
			}

			function getFilterElement(evt) {
				var el,
					parent = evt.srcElement;

				while (parent && !parent.filter) {
					el = parent;
					parent = parent.parentElement;
				}
				return parent && el;
			}
		}

		// Handler for change events for filter UI elements
		///////////////////////////////////////////////////////////////////////////////////
		function onFilterChange() {
			var child, filter, i,
				el = elements.filter;

			for (i = 0; i < el.children.length; i++) {
				child = el.children.item(i);
				filter = child.filter;

				filter.action = child.querySelector('.gml-action').value;
				filter.type = child.querySelector('.gml-type').value;
				filter.search = child.querySelector('.gml-search').value;
				filter.file = child.querySelector('.gml-file').value;

				if (filter.type == 'discovery_status' && filter.discovery_status) {
					statusRecs[filter.discovery_status] = statusRecs[filter.discovery_status] || [ ];
					getDiscoEccRecs(filter.discovery_status);
				}
			}
			refresh();
		}

		// Render the "Filter" section
		///////////////////////////////////////////////////////////////////////////////////
		function renderFilters() {
			var actions, types, children, records, files, hash, i, empties,
				filters = settings.filters;

			// Prepare data for rendering
			filters.forEach(initializeFilter);
			filters[0].showTitle = '';
			filters[filters.length - 1].showAnd = 1;
			hilites.sort();

			// Render the templates, update the page
			elements.filter.innerHTML = renderTemplate(templates.filter, settings.filters);

			// Update the URL's hash for the current filters
			hash = 'settings=' + encodeURIComponent(JSON.stringify(settings, function(key, value) { if (value) return value; }));
			if (hash.length) {
				//			if (window.parent)
				//				window.parent.history.replaceState({}, 'discovery_grep_mid_logs', document.location.pathname + '#' + hash);
				//			else
				history.replaceState({}, 'discovery_grep_mid_logs', document.location.pathname + '#' + hash);
			}

			// Attach the JS filter object to the HTML element
			children = elements.filter.children;
			for (i = 0; i < children.length; i++)
				children.item(i).filter = settings.filters[i];

			// Chrome doesn't show the value for option controls when you
			// render & insert w/ innerHTML.  Setting the value fixes this.
			actions = elements.filter.querySelectorAll('.gml-action');
			types = elements.filter.querySelectorAll('.gml-type');
			records = elements.filter.querySelectorAll('.gml-record > input');
			files = elements.filter.querySelectorAll('.gml-file');
			empties = elements.filter.querySelectorAll('.gml-record label input');

			settings.filters.forEach(function(filter, idx) {
				actions[idx].value = filter.action;
				types[idx].value = filter.type;
				if (filter.type != 'ecc_queue' || !filter.showEmpty)
					records[idx].value = filter[filter.type + 'Name'];
				files[idx].value = filter.file;
				records[idx].disabled = true;
				if (filter.showEmpty == 1)
					empties[idx].indeterminate = true;
				else if (filter.showEmpty == 2)
					empties[idx].checked = true;
				else
					records[idx].disabled = false;
			});

			function initializeFilter(filter) {
				filter.showAnd = 0;
				filter.showTitle = 'visibility:hidden';
				if (filter.action == 'hilite')
					filter.cssClass = filter.cssClass || hilites.shift() || 'hilite_7';
			}
		}

		// Apply the filters, re-render the data
		///////////////////////////////////////////////////////////////////////////////////
		function applyFilters() {
			var hasInclude, totalLines, hilite, which,
				counts = { };

			forAllLogLines(function(line) { line.include = line.exclude = line.hilite = undefined; line.allFilters = [ ]; });

			// Any include filters -> unmatched filtered out
			// else unmatched are included
			// Make a pass over include/exclude filters first so we can get
			// an accurate count for hilite
			hilite = false;
			settings.filters.forEach(applyFilter);
			hilite = true;
			settings.filters.forEach(applyFilter);
			renderLines = [ ];

			forAllLogLines(function(line) {
				if (line.date && (elements.start.value > line.date || elements.end.value < line.date)) {
					line.exclude = true;
					return;
				}
				if (line.exclude)
					line.include = false;
				else
					line.include = true;
				if (line.include)
					renderLines.push(line);
			});

			renderLines.sort(function(a, b) {
				var idx, sort, compare;

				for (idx = 0; idx < settings.sorts.length; idx++) {
					sort = settings.sorts[idx];
					compare = a[sort.name] && a[sort.name].localeCompare(b[sort.name]);
					if (compare)
						return sort.direction * compare;
					if (a[sort.name] > b[sort.name])
						return sort.direction;
					if (a[sort.name] < b[sort.name])
						return -1 * sort.direction;
					if (sort.name == 'date') {
						if (a.order > b.order)
							return sort.direction;
						if (a.order < b.order)
							return -1 * sort.direction;
					}
				}
				return 0;
			});

			elements.summary.innerHTML = renderTemplate(templates.summary, { shown: renderLines.length, total: totalLines, newContent: newContent });

			if (!renderLines.length && !autoGrabbed) {
				which = getWhich();
				if (which.include.ecc_agent.length || which.include.discovery_status.length) {
					autoGrabbed = true;
					grabLogs();
				}
			}

			renderResult();

			function applyFilter(filter) {
				var regex, search, action;

				if ((filter.action == 'hilite') != hilite)
					return;

				hasInclude = hasInclude || filter.action == 'include';
				filter.matches = 0;

				// See if the filter is valid
				if (filter.type == 'regex') {
					if (!filter.search)
						return;
					regex = new RegExp(filter.search, 'i');
				} else if (filter.type == 'text') {
					if (!filter.search)
						return;
					search = filter.search.toLowerCase();
				} else if (filter.type == 'ecc_queue') {
					if (!filter.showEmpty && !filter.ecc_queue)
						return;
				} else if (filter.type == 'discovery_status') {
					if (!filter.discovery_status)
						return;
				} else if (filter.type == 'ecc_agent') {
					if (!filter.ecc_agentName)
						return;
				}

				action = filter.action;
				counts[action] = (counts[action] || 0) + 1;

				// Walk over every line, see if the current filter matches each
				forAllLogLines(function(line) {
					var match;

					if (regex)
						match = regex.test(line.msg);
					else if (filter.type == 'text')
						match = line.msg.toLowerCase().includes(search);
					else if (filter.type == 'ecc_queue') {
						if (filter.showEmpty == 1)
							match = !!line.queueId;
						else if (filter.showEmpty == 2)
							match = !line.queueId;
						else
							match = (line.queueId == filter.ecc_queue);
					} else if (filter.type == 'discovery_status')
						match = statusRecs[filter.discovery_status].includes(line.queueId);
					else if (filter.type == 'ecc_agent')
						match = (line.mid == filter.ecc_agentName);
					else if (filter.type == 'file')
						match = (line.file == filter.file);

					// If the filter matches, decide what to do with the line based on
					// the filter's action.
					if (match) {
						if (action != 'hilite')
							filter.matches++;

						if (action == 'hilite' && !line.exclude) {
							filter.matches++;
							line.hilite = 1;
							line.allFilters.push(filter.cssClass || 'hilite_7');
						}

						if (action == 'exclude')
							line.exclude = true;
					} else if (action == 'include')
						line.exclude = true;
				});
			}

			function forAllLogLines(cb) {
				var name, logLines;
				totalLines = 0;
				for (name in logs) {
					logLines = logs[name];
					if (logLines) {
						totalLines += logLines.length;
						logLines.forEach(cb);
					}
				}
			}
		}

		// Rendering the list is complicated...  There may be hundreds of thousands of lines of data and it's very slow to render all
		// of it, so we'll render a small section around the visible section.  When the user scrolls we'll re-render.  A single (empty)
		// element above and an element below the visible area causes the scroll bar to be shown.
		// A couple of factors complicate this:
		// 1) Not all lines are the same height.  We don't know a line's height until we render it, so we don't know the correct
		//    overall height of the element.
		// 2) We have to stick with our original guess for total height (so the scroll bar doesn't change size or position).
		// 3) There's no connection between HTML elements and the data that created them
		// 4) We have to pick a line to start rendering, but we don't know which elements are visible until after we've rendered.
		//    Ideally we'll have the same number of elements rendered above as below the viewport.
		function renderResult(scrolling) {
			var testEl, desiredOffset, actualOffset, aboveEl, found, extra, resultEl, belowEl, lastEl, i,
				rowHeight = 18.18182,
				renderHeight = rowHeight * renderLines.length,
				el = elements.resultContainer,
				children = el.children[0].children,
				proportion = el.scrollTop / el.children[0].offsetHeight,
				shown = Math.ceil(el.getHeight() / rowHeight),
				extraRows = Math.floor((100 - shown)/2),
				first = firstRender ? 0 : Math.max(Math.floor(el.scrollTop / renderHeight * renderLines.length - extraRows), 0) || 0,
				above = first * rowHeight,
				below = (renderLines.length - (first + 100)) * rowHeight,
				top = firstRender ? 0 : el.scrollTop,
				obj = { above: above, below: below, result: renderLines, hiddenAbove: first, hiddenBelow: logLines.length - (first + 100) };

			// The list has scrolled and we want to re-render with the rendering centered around the visible area
			// We have to figure out the first element to render.
			// First possibility: A previously rendered element is visible at the top of the area.  We know we have to render
			// this item, and we need it to be displayed at the same offset
			found = findLogLineAt(0, el.offsetTop + 2);

			if (found !== undefined)
				first = found - extraRows;
			else {
				// 2nd possibility: A previously rendered element is visible at the bottom of the area
				found = findLogLineAt(0, el.offsetTop + el.offsetHeight - 5);
				if (found !== undefined)
					first = found - shown - extraRows;
			}

			if (found === undefined) {
				testEl = document.elementFromPoint(0, el.offsetTop + 2);

				// 3rd possibility: All rendered elements are below the visible area
				if (testEl == children[0]) {
					first = el.scrollTop / rowHeight - extraRows;
					if (lastFirst - first < 100) {
						testEl = children[1];
						found = lastFirst;
					} else {
						// The rendered elements have scroll so far that we're not going
						// to re-render any of them.  Make some guess for how much room
						// we need above & below the rendered area
						obj.above = el.scrollTop - rowHeight * extraRows;
						obj.below = renderHeight - obj.above - 100 * rowHeight;
					}
				}

				// 4th possibility: All rendered elements above visible area
				if (testEl == children[101]) {
					extra = (el.scrollTop + el.offsetTop - testEl.offsetTop) / rowHeight;
					first = lastFirst + 100 + extra - extraRows;
					if (first - lastFirst < 100) {
						testEl = children[100];
						found = lastFirst + 99;
					} else
						obj.above = el.scrollTop - extraRows * rowHeight;
				}
			}

			// We've decided which line is the first one we're going to render.  Make sure
			// it's in the required range
			first = Math.min(first, renderLines.length - 100);
			first = Math.floor(Math.max(first, 0));

			// If the user is scrolling we don't need to render every movement.  We'll only
			// re-render when they've scroll at least 4 lines.
			if (scrolling && !firstRender && Math.abs(first - lastFirst) < 4)
				return;

			/*
			// An alternate approach to minimize rendering during scrolling.  Rather than
			// rendering after scrolling a fixed number of lines, render after some amount of
			// time.  Decrease the allowed time depending on how far the user has scrolled.
			timeSinceRender = new Date().getTime() - lastRender;
			waitTime = (250 - Math.abs(first - lastFirst) * 10);
			timeTilNext = waitTime - timeSinceRender;
			if (timeTilNext > 0) {
				if (killIt) {
					clearTimeout(renderTimer);
					killIt = false;
				}
				renderTimer = setTimeout(renderResult, timeTilNext);
				killIt = true;
				return;
			}
			if (killIt) {
				clearTimeout(renderTimer);
				killIt = false;
			}
			*/

			firstRender = false;

			// If our new rendering is going to include a line that is currently rendered, we need
			// to make sure it remains at the same offset.
			if (found !== undefined)
				desiredOffset = testEl.getClientRects()[0].top;

			// Render the data
			el.innerHTML = renderTemplate(templates.resultContainer, obj, first, first + 100);
			lastFirst = first;
			lastRender = new Date().getTime();

			if (!found)
				return;

			// Now fix things up so the re-rendered element is at the same position.
			resultEl = el.children[0];
			children = el.children[0].children;
			testEl = children[found - first + 1];
			actualOffset = testEl.getClientRects()[0].top;
			aboveEl = children[0];
			belowEl = children[children.length - 1];
			lastEl = children[children.length - 2];
			aboveEl.style.height = (above - (actualOffset - desiredOffset)) + 'px';
			belowEl.style.height = (renderLines.length - (first + 100)) * rowHeight + 'px';
			found = findLogLineAt(0, el.offsetTop + 2);

			// The browser may scroll the viewport, but we don't want it to (because we made sure
			// any visible element is at the same position.)  Put it back where it started.
			el.scrollTop = top;

			function findLogLineAt(x, y) {
				var found = lastFirst,
					children = el.children[0].children;
				testEl = document.elementFromPoint(x, y).parentElement;
				for (i = 1; i < children.length - 1; i++) {
					if (children[i] == testEl)
						return found;
					found++;
				}
			}
		}

		// An attempted simpler implementation of the above code.  The code above works well enough but (a) not
		// perfectly, and (b) better than this code.  If I ever have time to perfect the code I'd like to start
		// from this simpler base, so I'm keeping it here.
		/*	function renderResult() {
			var referenceEl, referenceIdx,			// element to position, idx of element being positioned
				desiredTop, actualTop, above, aboveEl, belowEl,
				rowHeight = 18.18182,
				el = elements.resultContainer,
				children = el.children[0].children,
				top = el.scrollTop,
				shown = Math.ceil(el.getHeight() / rowHeight),
				rowsToRender = 100,
				extraRows = Math.floor((100 - shown)/2),
				rect = el.getBoundingClientRect(),
				first = 0,
				lastRow = logLines.length - rowsToRender,
				obj = { result: renderLines, above: 0, below: lastRow * rowHeight, hiddenAbove: 0, hiddenBelow: lastRow };

			if (!firstRender) {
				if (findLogLineAt(rect.left + 1, rect.top + 1)) {
					// There's an element at the top left of the client area.  We want to keep it in the same place
					desiredTop = referenceEl.offsetTop - el.offsetTop;
					first = referenceIdx - extraRows;
					first = Math.max(Math.min(first, renderLines.length - rowsToRender), 0);
					above = obj.above = first * rowHeight;
					var existingHeight = referenceEl.parentElement.offsetHeight;
				} else if (referenceEl == children[children.length - 1]) {
					// The top left of the list is showing the below element - all rendered elements are above us
					referenceEl = children[children.length - 2];
					referenceIdx = lastFirst + children.length - 3;
				} else if (referenceEl == children[0]) {
					referenceEl = children[1];
					referenceIdx = lastFirst;
				} else
					referenceEl = 0;
			}

		//	if (referenceEl) {
		//		desiredTop = referenceEl.offsetTop - el.offsetTop;
		//		var missingSpace = (desiredTop- el.scrollTop);
		//		var missingRows = Math.ceil(missingSpace / rowHeight);
		//
		//		first = referenceIdx - extraRows - missingRows;
		//		first = Math.max(Math.min(first, renderLines.length - rowsToRender), 0);
		//			referenceIdx += first - lastFirst;
		//		above = obj.above = first * rowHeight;
		//	}

			el.innerHTML = renderTemplate(templates.resultContainer, obj, first, first + rowsToRender);
			lastFirst = first;
			firstRender = false;
			elements.summary.innerHTML = renderTemplate(templates.summary, { shown: renderLines.length, total: logLines.length, first: firstRender });

			if (referenceEl) {
				children = el.children[0].children;
				aboveEl = children[0];
				belowEl = children[children.length - 1];
				actualTop = children[referenceIdx + 1].offsetTop - el.offsetTop;
				aboveEl.style.height = (above - (actualTop - desiredTop)) + 'px';
				belowTop = belowEl.offsetTop - el.offsetTop;
				below.style.height = (existingHeight - belowTop) + 'px';
				el.scrollTop = top;
			}

			function findLogLineAt(x, y) {
				referenceIdx = lastFirst;
				referenceEl = document.elementFromPoint(x, y);
				while (referenceEl && (referenceEl.parentElement != el.children[0]))
					referenceEl = referenceEl.parentElement;
				for (i = 1; i < children.length - 1; i++) {
					if (children[i] == referenceEl)
						return true;
					referenceIdx++;
				}
			}
		}
		*/

		// Find which ecc_queue records are part of a given discovery status.
		///////////////////////////////////////////////////////////////////////////////////
		function getDiscoEccRecs(discoStatus) {
			dqd.getDiscoEccRecs(discoStatus).then(gotRecs);

			function gotRecs(answer) {
				var recs = statusRecs[discoStatus] || [ ];
				answer.sort();
				if (answer.length == recs.length && answer.every(function(val, idx) { return val == recs[idx]; }))
					return;
				statusRecs[discoStatus] = answer;
				refresh();
			}
		}

		// Fetch the agent_files.  I try to minimize the amount of data that I'm fetching based on
		// the current filters. Each agent_file is fetched in its entirety or not at all, but only
		// files for included MIDs and time ranges will be fetched.
		///////////////////////////////////////////////////////////////////////////////////
		function getMidLogs(active) {
			var name,

				// regexes below match log lines for the wrapper and agent agent_file records
				// after processing by the "Get All MID logs" BR.

				// matches wrapper and agent logs (for agent logs using com.service_now.mid.logging.MidLogFormatter)
				lineStart = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:[-+]\d{4})?)(?:(?:\s+\S+\s+\(([^)]+?)\))|(?:\s+\|))\s+(.*)/,

				// matches wrapper and agent logs (for agent logs using com.glide.util.DefaultLogFormatter)
				lineStartLegacy = /^(\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d)(?:(?:\s+\(\d\d\d\))|(?:\s*\.\d\d\d))?\s+(\S+)\s+(.*)/,

				idRegex = /^(.*)-([0-9a-f]{32})$/;
			// Active logs are the agent0.log.0 files - they're still changing.  We need to re-fetch these if they've
			// changed.
			if (active)
				getActiveLogs();
			else
				dqd.getMidLog(getWhich()).then(gotLog);

				function getActiveLogs() {
				for (name in logs) {
					if (logs[name].active)
						dqd.getMidLog({sys_id: name, modified: logs[name].modified}).then(gotSpecificLog);
				}
			}

			function gotSpecificLog(answer) { gotLog(answer, true); }

			// We may have gotten a file
			function gotLog(answer, skipQuery) {
				var content, line, match, match2, logLine, logLines, date,
					order = 0,
					i = 0;

				// If we don't get a sys_id it means we've gotten every file we want.
				if (!answer.sys_id) {
					if (!skipQuery)
						setTimeout(getMidLogs, 5000);
					return;
				}

				// We got a log file.  Process it.
				content = answer.content.split('\n');
				logLines = [ ];
				logLines.active = answer.active;
				logLines.modified = answer.modified;
				logs[answer.sys_id] = logLines;

				while (i < content.length) {
					line = content[i++];
					// Try to get timestamp, thread ID & ECC queue ID
					match = lineStart.exec(line);
					match = match ? match : lineStartLegacy.exec(line);
					if (!match) {
						if (logLine)
							logLine.msg += '\n' + line;
					} else {
						logLine = {
							mid: answer.mid,
							file: answer.file,
							order: order++
						};
						logLines.push(logLine);
						logLine.date = dateToString(match[1]);
						logLine.msg = match[3];
						match2 = idRegex.exec(match[2]);
						if (match2) {
							logLine.thread = match2[1];
							logLine.queueId = match2[2];
						} else
							logLine.thread = match[2];
					}
				}

				if (!skipQuery)
					getMidLogs();

				// Go ahead & re-filter & re-render.
				firstRender = true;
				applyFilters();
				renderFilters();
			}
		}

		// Get an object describing which files to get based on the current filters
		function getWhich() {
			var which = {
				excludeRecs: Object.keys(logs),
				start: settings.start,
				end: settings.end,
				include: { ecc_queue: [ ], ecc_agent: [ ], discovery_status: [ ], file: [ ] },
				exclude: { ecc_queue: [ ], ecc_agent: [ ], discovery_status: [ ], file: [ ] }
			};

			settings.filters.forEach(
				function(filter) {
					var type = filter.type;
					if (filter.action == 'hilite' || filter.type == 'regex' || filter.type == 'text')
						return;
					which[filter.action][type].push(filter[type]);
				});
			return which;
		}

		// Grab MID logs (to get the latest log messages.)
		///////////////////////////////////////////////////////////////////////////////////
		function grabLogs() {
			var which = {
				include: { ecc_queue: [ ], ecc_agentName: [ ], discovery_status: [ ] },
				exclude: { ecc_queue: [ ], ecc_agentName: [ ], discovery_status: [ ] }
			};

			// We're only going to grab logs from MIDs that are included in the current filter
			settings.filters.forEach(function(filter) {
				var type = filter.type,
					w = which[filter.action];
				if (!w)
					return;
				if (type == 'ecc_agent')
					type += 'Name';
				if (w[type])
					w[type].push(filter[type]);
			});

			var possibleAlert = dqd.grabLogs(which);
			if (possibleAlert.alert)
				alert(possibleAlert.alert);
		}

		// Add all our event listeners
		///////////////////////////////////////////////////////////////////////////////////
		function addListeners() {
			var type, handlersForType, elName;

			elements.start.onchange = onDateChange;
			elements.end.onchange = onDateChange;

			for (type in handlers) {
				handlersForType = handlers[type];
				for (elName in handlersForType) {
					elements[elName].addEventListener(type, handlersForType[elName], true);
				}
			}
		}

		// Get the HTML elements that we need
		///////////////////////////////////////////////////////////////////////////////////
		function getElements() {
			var name, el;

			for (name in elements)
				elements[name] = document.querySelector(elements[name]);

			for (name in templates) {
				el = document.querySelector(templates[name]);
				elements[name] = el;
				templates[name] = el && el.innerHTML;
			}
		}

		// Render 'obj' into 'template'.
		// This is a quick implementation of a simple templating system.  Anything not currently being used
		// may not work as intended.
		// Template elements:
		//   {name}                            Replace with obj[name]
		//   {#name}partial{/name}             A section of the template.  Render "partial" with obj[name]
		//   {?name}conditional{/name}         Include "conditional" if obj[name] is truthy
		//   {?name==value}conditional{/name}  Include "conditional" if obj[name] == value
		//   {?name!=value}conditional{/name}  Include "conditional" if obj[name] != value
		//   {:else}                           Inside a conditional section provides alternate when condition is false
		//   {@helper}content{/helper}         Call renderTemplate[helper](content)
		//   {$idx}                            The index of the current array element
		///////////////////////////////////////////////////////////////////////////////////
		function renderTemplate(template, obj, from, to) {
			from = from || 0;
			template = renderPartial(template, obj, from, to);
			return template.replace(/{.*?}/g, '');
		}

		///////////////////////////////////////////////////////////////////////////////////
		function renderPartial(template, obj, from, to, parent, key) {
			var name,
				idxRegex = /{\$idx}/g,
				section = new RegExp(/(.*?)({#([^/}]*)(?:\/}|}))(.*?)({\/\3})(.*)/, 's'),
				conditional = new RegExp(/(.*?){\?([^!=\}]*)(?:(==|!=)([^}]+?))?}(.*?){\/\2}(.*)/, 's'),
				elseRegex = new RegExp('(.*?){:else}(.*)', 's'),
				//			helperArg = new RegExp(/([^(]*)\(([^)]*)\)/, 's'),
				helper = /(.*?)({@(.*?)(?:\(([^)]*?)\))?(?:\/}|(?:}(.*?){\/\3})))(.*)/;

			if (obj instanceof Array) {
				var html = obj.map(function(item, idx) { return (to && idx >= to) || idx < from ? '' : renderPartial(template, item, 0, 0, obj, idx, parent, name); });
				return html.join('');
			}

			conditionalSections();
			sections();
			helpers();
			replaceIdx();

			if (typeof obj == 'object') {
				for (name in obj) {
					if (isNaN(parseInt(name)))
						template = replaceRegex(name, obj);
				}
			} else
				template = replaceRegex('value', { value: obj });
			return template;

			function replaceIdx() {
				template = template.replace(idxRegex, key);
			}

			function helpers() {
				var match, helperFn, elseMatch, arg, helped,
					remainder = template,
					result = [ ];

				while (match = helper.exec(remainder)) {
					result.push(match[1]);
					helperFn = renderTemplate[match[3]];
					elseMatch = elseRegex.exec(match[5]);
					arg = /{(.*?)}/.exec(match[4]);

					if (arg)
						arg = obj[arg[1]]
					else
						arg = match[4];
					if (elseMatch) {
						helped = helperFn(obj, elseMatch[1], elseMatch[2], match[4]);
					} else
						helped = helperFn(obj, match[5], undefined, match[4]);
					if (helped === true) {
						if (elseMatch)
							result.push(elseMatch[1]);  // Has {:else} -> save first part
						else
							result.push(match[5]);      // No {:else} -> save entire content
					} else if (helped === false) {
						if (elseMatch)
							result.push(elseMatch[2]);  // Has {:else} -> save 2nd part
					} else if (helped === undefined) {
						result.push(match[2]);          // helperFn returned undefined -> put the original content back
					} else
						result.push(helped);

					remainder = match[6];
				}

				result.push(remainder);
				template = result.join('');
			}

			function sections() {
				var match,
					remainder = template,
					result = [ ];

				while (match = section.exec(remainder)) {
					result.push(match[1]);  // match[1] -> stuff before tag

					if (obj[match[3]])      // match[3] -> name of tag
						result.push(renderPartial(match[4], obj[match[3]], from, to, obj, match[3]));   // match[4] -> contents
					else {
						result.push(match[2]);  // match[2] -> Complete open tag
						result.push(renderPartial(match[4], obj, 0, 0, parent, key));
						result.push(match[5]);
					}
					remainder = match[6];
				}

				result.push(remainder);
				template = result.join('');
			}

			function conditionalSections() {
				var match, elseMatch, satisfied,
					remainder = template,
					result = [ ];

				while (match = conditional.exec(remainder)) {
					remainder = match[6];
					result.push(match[1]);
					elseMatch = elseRegex.exec(match[5]);

					if (!obj.hasOwnProperty(match[2]))
						return;
					if (match[3] == '==')
						satisfied = obj[match[2]] == match[4];
					else if (match[3] == '!=')
						satisfied = obj[match[2]] != match[4];
					else
						satisfied = obj[match[2]];
					if (satisfied) {
						if (elseMatch)
							result.push(elseMatch[1]);
						else
							result.push(match[5]);
					} else if (elseMatch)
						result.push(elseMatch[2]);

					remainder = result.join('') + remainder;
					result = [];
				}

				result.push(remainder);
				template = result.join('');
			}

			function replaceRegex(name, obj) {
				var re = regexes[name] = regexes[name] || new RegExp('{' + name + '}', 'g'),
					val = obj[name];
				if (val === undefined)
					val = '';
				return template.replace(re, val);
			}
		}

		///////////////////////////////////////////////////////////////////////////////////
		/*function onMove(leftEl, rightEl) {
			if (rightEl.hasClassName('empty'))
				createNewPane(rightEl);
		}*/
		// Not used yet.  Allows easy resizing of screen elements.  I'm going to use this to
		// allow resizing columns.

		///////////////////////////////////////////////////////////////////////////////////
		function sdrag(onMove) {
			var isTall, start, el, pointerId,
				cover = document.querySelector('#cover');
			//	window.addEventListener('pointerdown', startDragging);

			window.addEventListener('mousedown', startDragging);
			function move(e) {
				e.stopPropagation();
				e.preventDefault();
				var size, next,
					page = isTall ? e.pageX : e.pageY,
					fn = isTall ? 'getWidth' : 'getHeight';

				if (page - start) {
					size = el[fn]() + page - start;
					next = el.nextSibling.nextSibling[fn]() - page + start;
					el.style.flexBasis = size + 'px';

					// Do this here in case onMove changes nextSibling
					onMove && onMove(el, el.nextSibling.nextSibling);
					el.nextSibling.nextSibling.style.flexBasis = next + 'px';
					start = page;
				}
			}

			function mouseup(e) {
				//		target.releasePointerCapture(e.pointerId);
				//		window.removeEventListener('poinermove', move);
				//		window.removeEventListener('pointerup', mouseup);
				window.removeEventListener('mousemove', move);
				window.removeEventListener('mouseup', mouseup);
				cover.addClassName('hide');
			}

			function startDragging(e) {
				var target = e.target,
					sizes = [ ];

				if (target.hasClassName('dragger')) {
					e.stopPropagation();
					e.preventDefault();
					isTall = e.target.parentNode.hasClassName('tall-container');

					cover.removeClassName('hide');
					cover.removeClassName('colResizeCursor');
					cover.removeClassName('rowResizeCursor');
					cover.addClassName(isTall ? 'colResizeCursor' : 'rowResizeCursor');

					start = isTall ? e.pageX : e.pageY;
					el = e.target.previousSibling;
					//			target.setPointerCapture(e.pointerId);
					//			window.addEventListener('pointermove', move);
					//			window.addEventListener('pointerup', mouseup);

					window.addEventListener('mousemove', move);
					window.addEventListener('mouseup', mouseup);
					sizes = target.parentNode.childElements().map(function(el) {return (isTall ? el.getWidth() : el.getHeight()) + 'px'; });

					target.parentNode.childElements().forEach(
						function(el, idx) {
							if (!el.hasClassName('dragger'))
								el.style.flexBasis = sizes[idx];
						});
				}
			}
		}

		// Helper function to use system UI to choose a record.  There doesn't seem to be such a function.
		// The code I found expects to update the page's HTML, so I'm creating some invisible elements
		// for it to work use.
		///////////////////////////////////////////////////////////////////////////////////
		function getRecord(table, filter, cb) {
			var el = document.createElement('input'),
				el2 = document.createElement('input');

			el.id = 'gml-dummy-for-popup';
			el2.id = 'sys_display.gml-dummy-for-popup';
			el.style.display = el2.style.display = 'none';
			document.body.appendChild(el);
			document.body.appendChild(el2);
			el.onchange = onchange;
			getRecord = getRec;
			getRec(table, filter, cb);

			function getRec(table, filter, icb) {
				cb = icb;
				filter = filter || '';
				myReflistOpen('gml-dummy-for-popup', '', table, '', 'false', '', filter);
			}

			function onchange() {
				cb(el.value, el2.value);
			}
		}

		function myReflistOpen(target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID, forceReference, ignoreTargetValue) {
			var url = reflistOpenUrl(target, target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID, forceReference, !!ignoreTargetValue);
			myPopupOpenStandard(url, "lookup");
		}

		function myPopupOpenStandard(url, name) {
			var width = 1500;
			var height = 800;
			var features = "width="+ width +",height="+ height +",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1";
			popupOpen(url, name, width, height, features, true );
		}
	});
};

window.onbeforeunload = function() {
	if (window.parent)
		window.parent.history.replaceState('', document.title, window.location.pathname);
	else
		history.replaceState('', document.title, window.location.pathname);
};
