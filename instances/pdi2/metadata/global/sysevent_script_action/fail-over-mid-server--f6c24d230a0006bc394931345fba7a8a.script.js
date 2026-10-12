/* Do the following if the MID server just went down */

ArrayPolyfill;
var NO_MID_FOUND_EXCEPTION = 'NoSuitableMidServerFoundException';
var LOG_SOURCE = 'MID fail over';

failOver();
	
function failOver() {
	var DEFAULT_MAX_COUNT = 25000;
	var DEFAULT_TOTAL_MAX_COUNT = 1000000;
	var DEFAULT_QUERY_WINDOW = 1; // days

	var max_count = parseInt(gs.getProperty('mid_server.failover.max_count', DEFAULT_MAX_COUNT)) || DEFAULT_MAX_COUNT;
	var total_max_count = parseInt(gs.getProperty('mid_server.failover.total_max_count', DEFAULT_TOTAL_MAX_COUNT)) || DEFAULT_TOTAL_MAX_COUNT;
	var total_processed = parseInt(event.parm2) || 0;
	var query_window = parseInt(gs.getProperty('mid_server.failover.query_window', DEFAULT_QUERY_WINDOW)) || DEFAULT_QUERY_WINDOW;

	var currMidName = current.name+'';
	if ('' + event.parm2 === '_duplicate_') {
		gs.log('Skip duplicate mid_server.down event from MID server ' + currMidName, LOG_SOURCE);
		return;
	}

	var currMidId = current.sys_id+'';
	var gr = new GlideRecord("ecc_agent");
	if (gr.get(currMidId) && 'UP' == gr.status.toUpperCase()) {
		gs.log("Skip failover because MID server " + currMidName + " is Up again", LOG_SOURCE);
		return;
	}

	_debug("BEGIN -- MID Server " + currMidName);
	var newMidName;
	var newMidNames = [];
	var recCount = 0;
	var agentClusterCache = new SNC.ECCAgentClusterCache();
	var eccgr = queryEccQueue(currMidName, max_count, query_window);
	
	try {
		// for each record for this mid server
		var count = 0; 
		while (eccgr.next()) {
			count += 1;
			if (count > max_count) {
				total_processed += max_count;
				if (recCount == 0) {
					gs.logWarning("Stop failover because none in the current batch of " + max_count + " ECC records for down MID Server " + currMidName + " could be reassigned", LOG_SOURCE);
					break;
				}

				if (total_processed < total_max_count) {
					gs.eventQueue(event.name, current, currMidName, '' + total_processed);
					gs.log("Processed total " + total_processed + " records from MID server " + currMidName + " and issued a new event for the next batch", LOG_SOURCE);
				} else {
					gs.logWarning("Processed total " + total_processed + " records from MID server " + currMidName + ". Stop failover because the max limit has been exceeded", LOG_SOURCE);
				}
				break;
			}
			// If probe param ECC_AGENT_SELECTOR_DETAILS param line exists in payload, extract the
			// JSON string param value and failover this record, else use legacy record failover.
			// For performance, uses a cached regex instead of a real XML parser.
			var midSelectorRegex = new SNC.Regex(GlideappIECC.ECC_AGENT_SELECTOR_DETAILS_REGEX+'');
			var match = midSelectorRegex.match(eccgr.payload);
			if (match) {
				var json = '{' + unescapeXmlChars(match[1]) + '}';  // get json from first regex match group
				var parser = new global.JSON();
				_debug("ECC queue record sys_id=" + eccgr.sys_id + ": MID selector details =" + json);
				var midSelDetails = parser.decode(json);
				if (!midSelDetails) {
					gs.logWarning("ECC queue record sys_id=" + eccgr.sys_id
							   + ": corrupt mid selector details in record payload.", LOG_SOURCE);
					continue;
				}
				var midSelMode = midSelDetails[GlideappIECC.ECC_AGENT_SELECTOR_MODE+''];
				var midSelAppName = midSelDetails[GlideappIECC.ECC_AGENT_SELECTOR_APP+''];
				var midSelClusterId = midSelDetails[GlideappIECC.ECC_AGENT_SELECTOR_CLUSTER+''];
				var midSelCapabilities = midSelDetails[GlideappIECC.ECC_AGENT_SELECTOR_CAPABILITIES+''];
				var midSel = new SNC.MidSelector(); 
				var newMidId;
				newMidName = null;
				if (_debugEnabled) {
					var caps = !!midSelCapabilities ? JSUtil.describeObject(midSelCapabilities) : "null";
					_debug("ECC queue record sys_id=" + eccgr.sys_id + ": midSelMode="
							+ midSelMode + ", currMidName=" + currMidName + ", midSelAppName="
							+ midSelAppName + ", midSelClusterId=" + midSelClusterId + ", midSelCapabilities="
							+ caps);
				}
				switch (midSelMode+'') {
					case GlideappIECC.ECC_AGENT_SELECTOR_MODE_SPECIFIC_MID+'':
						_debug("ECC queue record sys_id=" + eccgr.sys_id + ": select specific MID Server");
						break; // no Mid reassign
					case GlideappIECC.ECC_AGENT_SELECTOR_MODE_AUTO_SELECT_MID+'':
						try {
							_debug("ECC queue record sys_id=" + eccgr.sys_id + ": auto select mid server");
							if (eccgr.topic == 'Shazzam') {
								eccgr.state = 'error';
								eccgr.error_string = 'Shazzam fail over for MID Server Selection Method Auto Select is currently not supported.  Abandoning this Shazzam and continuing the rest of discovery.';
								eccgr.update();
								logError(eccgr.agent_correlator+'', 'Shazzam fail over for MID Server Selection Method Auto Select is currently not supported.  Abandoning this Shazzam and continuing the rest of discovery.');

								DiscoveryStatus.updateStatusCompletedCount(eccgr.agent_correlator);
								continue;
							}
							// Filter mids by application, source (IP), capabilities, and status.
							// For source, treat null or whitespace same.  If not an IP address or a hostname,
							// don't use any filter for target.
							var targets = null;
							var source = (!!eccgr.source) ? (eccgr.source+'').trim() : "";
							source = source.length > 0 ? source : null;
							if (source != null) {
								var ipAddress = SncIPAddressV4.getIPAddressV4Instance(source);
								if (ipAddress == null) {
									var ipAddresses = SNC.MidSelector.getHostIPAddresses(source);
									if (ipAddresses != null)
										ipAddress = ipAddresses[0];
								}
								targets = ipAddress != null ? [ipAddress] : null;
							}
							_debug("ECC queue record sys_id=" + eccgr.sys_id + ": targets="+ targets);
							newMidId = midSel.selectAnyDegradedOrBetterMidServer(midSelAppName, targets, midSelCapabilities)+'';
							newMidName = getMidNameFromSysId(newMidId);
						} catch (e) {
							// Cannot do "if (e instanceof of Package.com..." here, because gets security exception.
							if (String(e).indexOf(NO_MID_FOUND_EXCEPTION) != -1)
								gs.logWarning("ECC queue record sys_id=" + eccgr.sys_id 
										+ ": cannot find alternate to down MID Server " + currMidName
										+ " because: " + e.getMessage(), LOG_SOURCE);
							else throw e;
						}
						break;
					case GlideappIECC.ECC_AGENT_SELECTOR_MODE_SPECIFIC_CLUSTER+'':
						// Assume cluster is homogeneous; so only filter mids by application and status
						try {
							_debug("ECC queue record sys_id=" + eccgr.sys_id + ": select specific cluster");
							newMidId = midSel.selectAnyDegradedOrBetterMidServerFromClusterEx(midSelAppName, midSelClusterId)+'';
							newMidName = getMidNameFromSysId(newMidId);
							if (eccgr.topic == 'Shazzam')
								logInfo(eccgr.agent_correlator+'', 'Shazzam probe for ' + eccgr.agent + ' is being reassigned to MID ' + newMidName);
						} catch (e) {
							// Cannot do "if (e instanceof of Package.com..." here, because gets security exception.
							if (String(e).indexOf(NO_MID_FOUND_EXCEPTION) != -1) {
								var clusterGr = agentClusterCache.getBySysId(midSelClusterId);
								gs.logWarning("ECC queue record sys_id=" + eccgr.sys_id
										+ ": MID Server cluster down. Cannot find alternate to down MID Server " + currMidName
										+ " in cluster " + clusterGr.name+''
										+ " (sys_id " + midSelClusterId+ ") because: " + e.getMessage(), LOG_SOURCE);
							} else throw e;
						}
						break;
					default:
						gs.logWarning("ECC queue record sys_id=" + eccgr.sys_id 
								   + ": unknown MID selector mode value in record", LOG_SOURCE);
				}
			} else {  // non-mid selector type legacy record
				_debug("ECC queue record sys_id=" + eccgr.sys_id + ": legacy, currMidName=" + currMidName);
				var msc = new MIDServerCluster(current, "Failover");
				if (!msc.clusterExists())
					continue;

				newMidName = msc.getClusterAgent();
			}	
			if (JSUtil.nil(newMidName))
				continue;
			
			eccgr.agent = GlideappIECC.AGENT_NAME_PREFIX + newMidName;
			eccgr.state = "ready";
			eccgr.update();
			_debug("ECC queue record sys_id=" + eccgr.sys_id + ": newMidName=" + newMidName + ", currMidName=" + currMidName);
			if (newMidName && newMidName != currMidName) {
				recCount++;
				if (newMidNames.indexOf(newMidName) == -1 )
					newMidNames.push(newMidName);
			}
		}
		if (newMidNames.length > 0)
			gs.log(recCount + " ECC queue records for down MID Server "
				   + currMidName + " reassigned to " + newMidNames.join(', '), LOG_SOURCE);
	} finally {
		for (var idx = 0; idx < newMidNames.length; idx++)
			new MIDServerManage().resetQueryWindow(newMidNames[idx]);
		_debug("END -- MID Server " + currMidName);
	}
}

function getMidNameFromSysId(midId) {
	if (JSUtil.nil(midId))
		return null;
	
	var agentCache = new SNC.ECCAgentCache();
	var midgr = agentCache.getBySysId(midId);
	return midgr.name + '';
}

// Return glide records query result.
function queryEccQueue(downMidName, max_count, query_window) {
	var eccgr = new GlideRecord("ecc_queue");	
	eccgr.addQuery("agent", GlideappIECC.AGENT_NAME_PREFIX + downMidName);
	_debug("query ECC QUEUE records for agent=" + GlideappIECC.AGENT_NAME_PREFIX + downMidName);
	// Exclude it for certain types of probes... 
	eccgr.addQuery("topic", "NOT IN", ["systemCommand", "HeartbeatProbe", "config.file", "Command"]);
	eccgr.addQuery("queue","output");
	
	// Pick up ready or processing
	var qc = eccgr.addQuery("state", "ready");
	qc.addOrCondition("state", "processing");

	// Bound the ECC queue query by picking up only the entries between the last <query_window> days and now.
	var s = new GlideDateTime();
	s.subtract(3600 * 1000 * 24 * query_window); // query from last <query_window> days
	eccgr.addQuery("sys_created_on", '>=', s);
	eccgr.addQuery("sys_created_on", '<=', new GlideDateTime());
	eccgr.setLimit(max_count + 1);
	eccgr.orderBy("sys_created_on");
	eccgr.query();
	return eccgr;
}

function unescapeXmlChars(str) {
	return str.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
}

function logWarning(statusSysId, msg) {
	var logger = new DiscoveryLogger(statusSysId, null);
	logger.warn(msg, LOG_SOURCE, null, null, null);
	_debug(msg);
}

function logError(statusSysId, msg) {
	var logger = new DiscoveryLogger(statusSysId, null);
	logger.error(msg, LOG_SOURCE, null, null, null);
	_debug(msg);
}

function logInfo(statusSysId, msg) {
	var logger = new DiscoveryLogger(statusSysId, null);
	logger.info(msg, LOG_SOURCE, null, null, null);
	_debug(msg);
}

function _debugEnabled() {
	return JSUtil.toBoolean(gs.getProperty("mid_server.failover.debug", "false"));
}

function _debug(msg) {
	if (_debugEnabled())
		gs.log("(debug) " + msg, LOG_SOURCE);
}
