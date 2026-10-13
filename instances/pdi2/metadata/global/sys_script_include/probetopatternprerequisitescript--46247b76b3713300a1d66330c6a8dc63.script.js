var ProbeToPatternPrerequisiteScript = Class.create();
ProbeToPatternPrerequisiteScript.prototype = {
	initialize : function() {
		this.recordArray = [];
		this.convertObj = {};
		this.convertArray = [];
		this.REL_TYPE = 'cmdb_rel_type';
		this.DISCOVERY_CLASSY_WINDOWS = 'discovery_classy_windows';
		this.DISCOVERY_CLASSY_UNIX = 'discovery_classy_unix';
		this.DISCOVERY_CLASSY_SNMP = 'discovery_classy_snmp';
		this.DISCOVERY_CLASSY_PROC = 'discovery_classy_proc';
		this.DISCOVERY_CLASSIFIER_PROBE = 'discovery_classifier_probe';
		this.SOURCE = "ProbeToPatternPrerequisiteCheck";
		this.HORIZONTAL_PROBE_SYSID = "4f64c6389f230200fe2ab0aec32e7068";
		this.RUNS_ON = "60bc4e22c0a8010e01f074cbe6bd73c3";
		this.OWNS = "25242fb2377a9200738d021a54990e88";
		this.CONTAINS = "55c95bf6c0a8010e0118ec7056ebc54d";
		this.USES = "cb5592603751200032ff8c00dfbe5d17";
		this.DEFINE_RESOURCE_FOR = "de5aeb6a0ab3015854626f204fb7b1c0";
		this.VIRTUALIZED = "d93304fb0a0a0b78006081a72ef08444";
		this.PROVIDES = "f67e9ecdff602000dada361332f49d35";
		this.PROVIDED_BY = "4afd799338a02000c18673032c71b817";
		this.MEMBERS = "55c913d3c0a8010e012d1563182d6050";
		this.REGISTERED = "aa9434870ab301544ce2943bf03fd7a8";
		this.RUN_ALL = false;
		this.PASS_ALL = true;
		this.MIGRATE = false;
		this.checkResult = {
			SUCCESS: 'success',
			UPDATE: 'update',
			FAIL: 'fail',
		};
		this.scriptIncludeArray =
			[{name: 'FixPatternsModelBasic', sysId: 'a1794bd09f2313004deb91aec32e7085'},
			{name: 'DiscoveryMigrateToPatterns', sysId: 'fe29037159076300964fd0aa17cfbcf1'},
			{name: 'FixHyperVModelForPatterns', sysId: 'c3a65f5a9f1123004deb91aec32e7043'},
			{name: 'FixWindowsModelForPatterns', sysId: 'd22423149f6313004deb91aec32e7081'},
			{name: 'FixUnixFamilyModelForPatterns', sysId: 'f034f5929fc31300ed6191aec32e70e9'},
			{name: 'FixSwitchAndRouterModelForPatterns', sysId: '5e18d8a49fa313004deb91aec32e7031'},
			{name: 'FixPatternLoadBalancersModel', sysId: 'd4e3db1f9f321300ed6191aec32e7026'},
			{name: 'FixApplicationModelForPatterns', sysId: '3ddcde87b3823300a1d66330c6a8dccd'},
			{name: 'FixMissingRelationsFromProbesToPatterns', sysId: 'd46684329fa313004deb91aec32e7040'}];
	},

	runAllPrerequisitesCheck : function(inputSource) {
		var source = inputSource ? inputSource : this.SOURCE;
		this.startLogRecord("Prerequisite Check");
		this.RUN_ALL = true;
		this.overallResultLog = "\n--------------------------------------------------------\nOverall Results\n--------------------------------------------------------";
		this.classifierCheck();
		this.relationshipTypeCheck();
		this.scriptIncludeCheck();
		this.fixScriptCheck();
		this.logMsg(this.overallResultLog, source);
		this.logMsg(this.horizontalProbeLog , source);
		if (this.classifierLogs)
			this.logMsg(this.classifierLogs, source);
		this.logMsg(this.relationshipLogs, source);
		this.logMsg(this.scriptIncludeLogs, source);
		this.endLogs();
	},

	horizontalProbeCheck : function(inputSource) {
		var logMessage = "\n--------------------------------------------------------\nHorizontal Probe Result\n--------------------------------------------------------\nSearching for Horizontal Pattern Probe with default sys_id (" + this.HORIZONTAL_PROBE_SYSID + ")\n";
		var passLog;
		var source = inputSource ? inputSource : this.SOURCE;
		var probe = new GlideRecord('discovery_probes');
		probe.get('sys_id', this.HORIZONTAL_PROBE_SYSID);
		if (probe.isValidRecord())
			logMessage += "Found default Horizontal Pattern Probe\n";
		else {
			logMessage += "Could not find default Horizontal Pattern Probe, querying for different sys_id\n";
			this.HORIZONTAL_PROBE_SYSID = '';
			probe.initialize();
			probe.addQuery('name', 'Horizontal Pattern');
			probe.query();
			if (probe.getRowCount() > 1)
				logMessage += "Found multiple Horizontal Pattern Probes. Please address before migration.\n";
			else if (!probe.next())
				logMessage += "Can't find Horizontal Pattern Probe. Please address before migration.\n";
			else {
				logMessage += "Found matching Horizontal Pattern Probe with sys_id (" + probe.sys_id + ")\n";
				this.HORIZONTAL_PROBE_SYSID = probe.sys_id;
			}
		}
		logMessage += "--------------------------------------------------------\n";
		if (this.HORIZONTAL_PROBE_SYSID)
			passLog = "Horizontal Pattern Probe check PASSED";
		else {
			this.PASS_ALL = false;
			passLog = "Horizontal Pattern Probe check FAILED";
			if (!this.MIGRATE)
				passLog+= " - Check logs to see why this failed";
		}

		if (this.RUN_ALL) {
			this.overallResultLog += "\n" + passLog;
			this.horizontalProbeLog = logMessage;
		} else {
			this.logMsg(passLog, source);
			if (!this.MIGRATE)
				this.logMsg(logMessage, source);
		}
	},

	relationshipTypeCheck: function(inputSource) {
		var relStatus = true;
		var passLog;
		var source = inputSource ? inputSource : this.SOURCE;
		this.recordArray = [];
		this.RUNS_ON = this.relCheck("Runs on::Runs", this.RUNS_ON, "this.RUNS_ON");
		this.OWNS = this.relCheck("Owns::Owned by", this.OWNS, "this.OWNS");
		this.CONTAINS = this.relCheck("Contains::Contained by", this.CONTAINS, "this.CONTAINS");
		this.USES = this.relCheck("Uses::Used by", this.USES, "this.USES");
		this.DEFINE_RESOURCE_FOR = this.relCheck("Defines resources for::Gets resources from", this.DEFINE_RESOURCE_FOR, "this.DEFINE_RESOURCE_FOR");
		this.VIRTUALIZED = this.relCheck("Virtualized by::Virtualizes", this.VIRTUALIZED, "this.VIRTUALIZED");
		this.PROVIDES = this.relCheck("Provides::Provided by", this.PROVIDES, "this.PROVIDES");
		this.PROVIDED_BY = this.relCheck("Provided By::Provides", this.PROVIDED_BY, "this.PROVIDED_BY");
		this.MEMBERS = this.relCheck("Members::Member of", this.MEMBERS, "this.MEMBERS");
		this.REGISTERED = this.relCheck("Registered on::Has registered", this.REGISTERED, "this.REGISTERED");

		var logMessage = "\n--------------------------------------------------------\nRelationship Results\n--------------------------------------------------------";
		for (var i = 0; i < this.recordArray.length; i++) {
			var statusValue = this.recordArray[i].status;
			switch (statusValue) {
				case this.checkResult.SUCCESS:
					logMessage += "\nRelationship: " + this.recordArray[i].message;
					break;
				case this.checkResult.UPDATE:
					logMessage += "\nRelationship: " + this.recordArray[i].message + " - Variable '" + this.recordArray[i].altName + "' will be updated to use sys_id (" + this.recordArray[i].sys_id + ") during migration.";
					break;
				case this.checkResult.FAIL:
					relStatus = false;
					logMessage += "\nRelationship: " + this.recordArray[i].message;
					break;
				default:
					relStatus = false;
					logMessage += "\nRelationship: " + this.recordArray[i].message;
					logMessage += "\nERROR: Got unexpected statusValue: " + statusValue;
			}
			logMessage += "\n";
		}
		logMessage += "--------------------------------------------------------\n";

		passLog = this.getPassLog("Relationship", relStatus);

		if (this.RUN_ALL) {
			this.overallResultLog += "\n" + passLog;
			this.relationshipLogs = logMessage;
		} else {
			this.logMsg(passLog, source);
			if (!this.MIGRATE)
				this.logMsg(logMessage, source);
		}
	},

	relCheck : function(relName, relSysId, varName) {
		var relObj = this.checkRecord(relName, relSysId, this.REL_TYPE, varName);
		this.recordArray.push(relObj);
		if (relObj.sys_id)
			return relObj.sys_id;
		else
			return relSysId;
	},

	classifierCheck : function(inputSource) {
		var source = inputSource ? inputSource : this.SOURCE;
		var passLog;
		this.horizontalProbeCheck(source);
		if (this.HORIZONTAL_PROBE_SYSID) {
			var classStatus = true;
			var logMessage;
			this.recordArray = [];
			this.addWindowsClassifiersToArray();
			this.addUnixClassifiersToArray();
			this.addNetworkClassifiersToArray();
			this.addLoadBalancerClassifiersToArray();
			this.addApplicationClassifiersToArray();
			logMessage = "\n--------------------------------------------------------\nClassifier Results\n--------------------------------------------------------";
			for (var i = 0; i < this.recordArray.length; i++) {
				var statusValue = this.recordArray[i].status;
				switch (statusValue) {
					case this.checkResult.SUCCESS:
						logMessage += "\nClassifier: " + this.recordArray[i].message;
						logMessage += "\n" + this.recordArray[i].classifierMessage;
						if (this.recordArray[i].patternMessage)
							logMessage += "\n" + this.recordArray[i].patternMessage;
						break;
					case this.checkResult.UPDATE:
						logMessage += "\nClassifier: " + this.recordArray[i].message + " - Record with sys_id (" + this.recordArray[i].sys_id + ") will be updated by the fix script.";
						logMessage += "\n" + this.recordArray[i].classifierMessage;
						if (this.recordArray[i].patternMessage)
							logMessage += "\n" + this.recordArray[i].patternMessage;
						break;
					case this.checkResult.FAIL:
						classStatus = false;
						logMessage += "\nClassifier: " + this.recordArray[i].message;
						if (this.recordArray[i].classifierMessage)
							logMessage += "\n" + this.recordArray[i].classifierMessage;
						if (this.recordArray[i].patternMessage)
							logMessage += "\n" + this.recordArray[i].patternMessage;
						break;
					default:
						classStatus = false;
						logMessage += "\nClassifier: " + this.recordArray[i].message;
						logMessage += "\nERROR: Got unexpected statusValue: " + statusValue;
				}
				logMessage += "\n";
			}
			logMessage += "--------------------------------------------------------\n";
			this.classifierLogs = logMessage;

			passLog = this.getPassLog("Classifier", classStatus);

			if (this.RUN_ALL) {
				this.overallResultLog += "\n" + passLog;
				this.classifierLogs = logMessage;
			} else {
				this.logMsg(passLog, source);
				if (!this.MIGRATE)
					this.logMsg(logMessage, source);
			}
		} else {
			this.PASS_ALL = false;
			passLog = "Classifier check FAILED - Not checking Classifications since we do not have valid Horizontal Pattern Probe record";
			if (this.RUN_ALL)
				this.overallResultLog += "\n" + passLog;
			else
				this.logMsg(passLog, source);
		}
	},

	classifierProbeCheck : function(classifierName, defaultSysId, table, patternName, conditionScript) {
		var classyobj = {};
		var convertCheckFailure;
		classyobj = this.checkRecord(classifierName, defaultSysId, table);
		classyobj.classifierName = classifierName;
		if (classyobj.sys_id) {
			var classyId = classyobj.sys_id;
			classyobj.classifierMessage = "  Checking Pattern Probe record";
			var dcp = new GlideRecord(this.DISCOVERY_CLASSIFIER_PROBE);
			if (!table.equals(this.DISCOVERY_CLASSY_PROC)) {
				dcp.addQuery('classy', classyId);
				dcp.addQuery('child', this.HORIZONTAL_PROBE_SYSID);
				dcp.addQuery('phase', 'identification');
				dcp.query();

				if (dcp.getRowCount() > 1) {
					classyobj.status = this.checkResult.FAIL;
					classyobj.classifierMessage += "\n  - Pass: FALSE\n  Reason: Multiple Identification Pattern Probes found for Classifier '" + classifierName + "'. Please fix so that only one Identification Pattern Probe exists.";
					return classyobj;
				}
				if (dcp.next()) {
					if (dcp.getValue('active') == false) {
						convertCheckFailure = this.convertCheck(classifierName, table);
						if (convertCheckFailure) {
							classyobj.status = this.checkResult.FAIL;
							classyobj.classifierMessage += convertCheckFailure;
							return classyobj;
						}
					}
					classyobj.classifierProbeSysId = dcp.getValue('sys_id');
					classyobj.classifierMessage += "\n  - Pass: TRUE (Found existing Pattern Probe record)";
					return classyobj;
				} else {
					classyobj.classifierMessage += "\n  - Did not find existing Identification Pattern Probe record - Will check to see if we can find or create a new Identification Pattern Probe record.";
				}
			}
			var patternGr = new GlideRecord('sa_pattern');
			patternGr.addQuery('name', patternName);
			patternGr.query();
			if (patternGr.getRowCount() > 1) {
				classyobj.status = this.checkResult.FAIL;
				classyobj.patternMessage = "  - Pass: FALSE\n  Reason: Multiple Patterns found for Pattern Name '" + patternName + "'. Please address before migration.";
				return classyobj;
			}
			if (patternGr.next()) {
				var patternSysId = patternGr.getValue('sys_id');
				dcp.initialize();
				dcp.addQuery('classy', classyId);
				dcp.addQuery('child', this.HORIZONTAL_PROBE_SYSID);
				if (!table.equals(this.DISCOVERY_CLASSY_PROC))
					dcp.addQuery('phase', 'exploration');
				dcp.addQuery('pattern', patternSysId);
				dcp.query();
				if (dcp.getRowCount() > 1) {
					classyobj.status = this.checkResult.FAIL;
					classyobj.patternMessage = "  - Pass: FALSE\n  Reason: Multiple Pattern Probes found for Classifier '" + classifierName + "' with same Pattern reference '" + patternName + "'. Please address before migration.";
					return classyobj;
				}
				if (dcp.next()) {
					var explorationPatternProbe = dcp.getValue('sys_id');
					classyobj.classifierProbeSysId = explorationPatternProbe;
					if (!table.equals(this.DISCOVERY_CLASSY_PROC))
						classyobj.patternMessage = "  - Pass: TRUE - Pattern Probe with sys_id (" + explorationPatternProbe + ") will be converted to Identification";
					else
						classyobj.patternMessage = "  - Pass: TRUE (Found existing Pattern Probe record)";
				} else {
					classyobj.patternMessage = "  - Pass: TRUE - Pattern is available to create new record.";
					classyobj.patternSysId = patternSysId;
					if (conditionScript)
						classyobj.condtion_script = conditionScript;
				}

				if (!table.equals(this.DISCOVERY_CLASSY_PROC))
					convertCheckFailure = this.convertCheck(classifierName, table);
				else if (dcp.getValue('active') != true)
					convertCheckFailure = this.convertCheck(classifierName + ' (' + patternName + ')', table);
				if (convertCheckFailure) {
					classyobj.status = this.checkResult.FAIL;
					classyobj.patternMessage = convertCheckFailure;
				}

				if (table.equals(this.DISCOVERY_CLASSY_PROC))
					classyobj.classyTable = this.DISCOVERY_CLASSY_PROC;
			} else {
				classyobj.status = this.checkResult.FAIL;
				classyobj.patternMessage = "  - Pass: FALSE\n  Reason: Pattern '" + patternName + "' does not exist. Please address before migration.";
			}
			return classyobj;
		} else
			return classyobj;
	},

	checkRecord : function(name, sysId, table, altName) {
		var recObj = {};
		var grName;
		var recGr = new GlideRecord(table);
		if (sysId)
			recGr.get('sys_id', sysId);
		if (recGr.isValidRecord()) {
			grName = recGr.getValue('name');
			if (grName.equals(name))
				recObj = {sys_id: sysId, status: this.checkResult.SUCCESS, message: name + " (" + sysId + ")\n- Pass: TRUE (Found default record)"};
			else
				recObj = {status: this.checkResult.FAIL, message: name + " (" + sysId + ")\n- Pass: FALSE\nReason: Name mismatch. Current name is: " + grName + ". Please address before migration."};
		} else {
			recGr.initialize();
			recGr.addQuery('name', name);
			recGr.query();
			if (recGr.next()) {
				recObj = {sys_id: recGr.getValue('sys_id'), status: this.checkResult.UPDATE, message: name + " (" + sysId + ")\n- Pass: TRUE (Found alternate record)"};
				if (altName)
					recObj.altName = altName;
			} else
				recObj = {status: this.checkResult.FAIL, message: name + " (" + sysId + ")\n- Pass: FALSE\nReason: Did not find any record with this name or sys_id. Please address before migration."};
		}
		return recObj;
	},

	convertCheck : function(name, table) {
		switch (table) {
			case this.DISCOVERY_CLASSY_WINDOWS:
				this.convertObj.FixWindowsModelForPatterns = true;
				this.convertArray.push(name);
				break;
			case this.DISCOVERY_CLASSY_UNIX:
				this.convertObj.FixUnixFamilyModelForPatterns = true;
				this.convertArray.push(name);
				break;
			case this.DISCOVERY_CLASSY_SNMP:
				if (name.equals('Standard Network Switch') || name.equals('Standard Network Router'))
					this.convertObj.FixSwitchAndRouterModelForPatterns = true;
				else
					this.convertObj.FixPatternLoadBalancersModel = true;
				this.convertArray.push(name);
				break;
			case this.DISCOVERY_CLASSY_PROC:
				this.convertObj.FixApplicationModelForPatterns = true;
				this.convertArray.push(name);
				break;
			default:
				return "  - Pass: FALSE\n  ERROR: For classifier: " + name + ", got unexpected classification table value: " + table;
		}
	},

	scriptIncludeCheck : function(inputSource) {
		var siStatus = true;
		var passLog;
		var source = inputSource ? inputSource : this.SOURCE;
		var logMessage = "\n--------------------------------------------------------\nScript Include Results\n--------------------------------------------------------";
		var scriptIncludeGr = new GlideRecord('sys_script_include');
		for (var x = 0; x < this.scriptIncludeArray.length; x++) {
			var siName = this.scriptIncludeArray[x].name;
			scriptIncludeGr.initialize();
			scriptIncludeGr.addQuery('name', siName);
			scriptIncludeGr.addActiveQuery();
			scriptIncludeGr.query();
			var count = scriptIncludeGr.getRowCount();
			if (count == 0) {
				siStatus = false;
				logMessage += "\nScript Include: " + siName + "\n- Pass: FALSE\nReason: Couldn't find active Script Include record. Please address before migration.";
			} else if (count > 1) {
				var siDefaultSysId = this.scriptIncludeArray[x].sysId;
				var siDefaultGr = new GlideRecord('sys_script_include');
				if (siDefaultGr.get('sys_id', siDefaultSysId) && siDefaultGr.getValue('active') == true) {
					logMessage += "\nScript Include: " + siName + "\n- Pass: TRUE (Found multiple active records and default record)\n  Deactivated following duplicate records:";
					while (scriptIncludeGr.next()) {
						var siGrSysId = scriptIncludeGr.getValue('sys_id');
						if (!siGrSysId.equals(siDefaultSysId)) {
							scriptIncludeGr.setValue('active', false);
							scriptIncludeGr.update();
							logMessage += "\n  - sys_id: " + siGrSysId;
						}
					}
				} else {
					siStatus = false;
					logMessage += "\nScript Include: " + siName + "\n- Pass: FALSE\nReason: Found duplicate active records, but could not find active default record. Please address before migration.";
				}
			} else
				logMessage += "\nScript Include: " + siName + "\n- Pass: TRUE (Found one active record)";
			logMessage += "\n";
		}
		logMessage += "--------------------------------------------------------\n";

		passLog = this.getPassLog("Script Include", siStatus);

		if (this.RUN_ALL) {
			this.overallResultLog += "\n" + passLog;
			this.scriptIncludeLogs = logMessage;
		} else {
			this.logMsg(passLog, source);
			if (!this.MIGRATE)
				this.logMsg(logMessage, source);
		}
	},

	fixScriptCheck : function() {
		var logMessage;
		if (this.PASS_ALL) {
			this.overallResultLog += "\nFix Script check...";
			logMessage = "\n--------------------------------------------------------\nFollowing Classifiers need to be converted\n--------------------------------------------------------";
			if (this.convertArray.length > 0) {
				for (var x = 0; x < this.convertArray.length; x++)
					logMessage += "\n- " + this.convertArray[x];
				logMessage += "\n--------------------------------------------------------\nFollowing fix scripts should be ran based on the above classifiers needing to be converted\n--------------------------------------------------------";
				for (classy in this.convertObj)
					logMessage += "\n- " + classy;		
			} else
				logMessage += "\n** All checked classifiers appear to be currently running patterns";
		} else
			logMessage = "\nFix Script check not ran since failures exist";
		logMessage += "\n--------------------------------------------------------\n";
		this.overallResultLog += logMessage;
	},

	getPassLog : function(message, status) {
		if (status)
			return message + " check PASSED";
		else {
			this.PASS_ALL = false;
			var failMessage = message + " check FAILED";
			if (!this.MIGRATE)
				failMessage += " - Check " + message + " Results to see which ones did not pass.";
			return failMessage;
		}
	},

	startLogRecord : function(source) {
		var logGr = new GlideRecord('probe_to_pattern_log');
		if (!this.logSysId || !logGr.get('sys_id', this.logSysId)) {
			logGr.initialize();
			this.logSysId = logGr.insert();
		}
		logGr.name = source;
		logGr.status = "In Progress";
		logGr.update();
	},

	setLogRecord : function(logRecord) {
		this.logSysId = logRecord;
	},

	getLogRecord : function() {
		return this.logSysId;
	},

	logMsg : function(logMsg, source) {
		gs.log(logMsg, source);
		this.saveLogs(logMsg);
	},

	saveLogs : function(message) {
		var logRecord = new GlideRecord('probe_to_pattern_log');
		if (this.logSysId && logRecord.get('sys_id', this.logSysId)) {
			logRecord.log += message.trim() + "\n";
			logRecord.update();
		}
	},

	endLogs : function() {
		var logRecord = new GlideRecord('probe_to_pattern_log');
		if (this.logSysId)
			logRecord.get('sys_id', this.logSysId);
		if (logRecord.log.contains("check FAILED"))
			logRecord.status = "Failed";
		else
			logRecord.status = "Completed";
		logRecord.update();
	},

	addWindowsClassifiersToArray : function() {
		this.recordArray.push(this.classifierProbeCheck("Windows 2000 Server", "94c2ab610a0a0b82009ed1ef45b1f48a", this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows 2003 Server", 'c277921c0a0a0b1c00719b2c948d2719', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows 2008 Server", '0e5b55adc0a80a390075725cd6b0eeb5', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows 2012 Server", '156bf4a137010100a664384c5dbe5d75', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows 2016 Server", '98d98911cb293200a03ef59ea34c9c7e', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows NT Server", '94bbe5830a0a0b82005d40873b8e0695', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Servers'));
		this.recordArray.push(this.classifierProbeCheck("Windows", 'c277e37c0a0a0b1c007b6daef23d8786', this.DISCOVERY_CLASSY_WINDOWS, 'Windows OS - Desktops'));
		this.recordArray.push(this.classifierProbeCheck("Hyper-V Server", 'c759f913c313200031e65ad8cbba8fd7', this.DISCOVERY_CLASSY_WINDOWS, 'Hyper-V Server'));
	},

	addUnixClassifiersToArray : function() {
		this.recordArray.push(this.classifierProbeCheck("Linux", 'c27c1ccf0a0a0b1c006149d6a38f3958', this.DISCOVERY_CLASSY_UNIX, 'Linux Server'));
		this.recordArray.push(this.classifierProbeCheck("Solaris", 'c27c58df0a0a0b1c00991796ad6971ee', this.DISCOVERY_CLASSY_UNIX, 'Solaris Server'));
		this.recordArray.push(this.classifierProbeCheck("AIX", 'c27bf9730a0a0b1c00427d6ef5e9c2e1', this.DISCOVERY_CLASSY_UNIX, 'AIX Server'));
		this.recordArray.push(this.classifierProbeCheck("HP-UX", 'c27bd8460a0a0b1c009b4a01dd95229e', this.DISCOVERY_CLASSY_UNIX, 'HP-UX Server'));
	},

	addNetworkClassifiersToArray : function() {
		this.recordArray.push(this.classifierProbeCheck("Standard Network Switch", "b9d852c60ab3015100c74a8e158664ca", this.DISCOVERY_CLASSY_SNMP, 'Network Switch'));
		this.recordArray.push(this.classifierProbeCheck("Standard Network Router", "b9e8a5b40ab30151007111d556cd0718", this.DISCOVERY_CLASSY_SNMP, 'Network Router'));
	},

	addLoadBalancerClassifiersToArray : function() {
		this.recordArray.push(this.classifierProbeCheck("F5 BIG-IP Load Balancer", 'b6cce1d8535202001f175f43911c08f7', this.DISCOVERY_CLASSY_SNMP, 'F5 Load Balancer'));
		this.recordArray.push(this.classifierProbeCheck("A10 Load Balancer", '8448a958535202001f175f43911c083a', this.DISCOVERY_CLASSY_SNMP, 'A10 Load Balancer'));
		this.recordArray.push(this.classifierProbeCheck("Alteon Load Balancer", '68dbed98535202001f175f43911c0861', this.DISCOVERY_CLASSY_SNMP, 'Alteon Load Balancer'));
		this.recordArray.push(this.classifierProbeCheck("Netscaler Load Balancer", 'fdab4c2bff30310000d3ffffffffff88', this.DISCOVERY_CLASSY_SNMP, 'Netscaler Load Balancer'));
		this.recordArray.push(this.classifierProbeCheck("ACE Load Balancer", 'e16c61d8535202001f175f43911c088c', this.DISCOVERY_CLASSY_SNMP, 'ACE Load Balancer by SSH'));
		this.recordArray.push(this.classifierProbeCheck("Radware - AppDirector - Load Balancer", '08b6cdb29f6202002887734ec32e70e7', this.DISCOVERY_CLASSY_SNMP, 'AppDirector Load Balancer'));
	},

	addApplicationClassifiersToArray : function() {
		this.recordArray.push(this.classifierProbeCheck("Apache Server", '7b91ce17c0a80fd000d79dadac118963', this.DISCOVERY_CLASSY_PROC, 'Apache On Windows', "type == 'windows'"));
		this.recordArray.push(this.classifierProbeCheck("Apache Server", '7b91ce17c0a80fd000d79dadac118963', this.DISCOVERY_CLASSY_PROC, 'Apache on UNIX based OS', "type == 'unix'"));
		this.recordArray.push(this.classifierProbeCheck("Tomcat", '7b91c2c3c0a80fd000d316c7a732834c', this.DISCOVERY_CLASSY_PROC, 'Tomcat'));
		this.recordArray.push(this.classifierProbeCheck("JBoss Server", '7b91ca8fc0a80fd00025134633edf527', this.DISCOVERY_CLASSY_PROC, 'Jboss'));
		this.recordArray.push(this.classifierProbeCheck("Weblogic Server", '7b91c214c0a80fd0001c22b52b96f389', this.DISCOVERY_CLASSY_PROC, 'WebLogic'));
		this.recordArray.push(this.classifierProbeCheck("Microsoft IIS Server", '7b91c0afc0a80fd00040cc655f2507d7', this.DISCOVERY_CLASSY_PROC, 'IIS'));
		this.recordArray.push(this.classifierProbeCheck("PostgreSQL Instance", '80af75bbc32221002d031f051eba8fe9', this.DISCOVERY_CLASSY_PROC, 'PostgreSQL DB'));
		this.recordArray.push(this.classifierProbeCheck("MySQL Server", '7b91c3b1c0a80fd0003403a47b4fc46b', this.DISCOVERY_CLASSY_PROC, 'My SQL server On Windows and Linux'));
		this.recordArray.push(this.classifierProbeCheck("Oracle Instance", '8c7f114d37530000dadacffbcfbe5d3a', this.DISCOVERY_CLASSY_PROC, 'Oracle DB On Windows', "type == 'windows'"));
		this.recordArray.push(this.classifierProbeCheck("Oracle Instance", '8c7f114d37530000dadacffbcfbe5d3a', this.DISCOVERY_CLASSY_PROC, 'Oracle DB On Unix', "type == 'unix'"));
		this.recordArray.push(this.classifierProbeCheck("Microsoft SQL Server", '7b91be46c0a80fd000fac9a374861146', this.DISCOVERY_CLASSY_PROC, 'MSSql DB On Windows'));
	},

    type: 'ProbeToPatternPrerequisiteScript'
};
