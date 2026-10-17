var DiscoveryMigrateToPatterns = Class.create();
DiscoveryMigrateToPatterns.prototype = Object.extendsObject(ProbeToPatternPrerequisiteScript, {
	MIGRATE_SOURCE : "DiscoveryMigrateToPatterns",

	enablePattern: function(classy, classifierName, patternName, defaultSysId) {
		var classifierObj = this.classifierProbeCheck(classifierName, defaultSysId, "discovery_classy_" + classy, patternName);
		this.enablePatternObj(classifierObj);
		return classifierObj;
	},

	enablePatternObj: function(classyObj) {
		var classifierId = classyObj.sys_id;
		var classifierName = classyObj.classifierName;
		if (!classyObj.status.equals(this.checkResult.FAIL)) {
			var dcp = new GlideRecord('discovery_classifier_probe');
			if (classyObj.classifierProbeSysId) {
				//Found matching Classifier Probe record
				this.deactivateProbes(classifierId, classifierName);
				dcp.get(classyObj.classifierProbeSysId);
				if (classyObj.classyTable.equals(this.DISCOVERY_CLASSY_PROC))
					dcp.setValue('phase', 'exploration');
				else
					dcp.setValue('phase', 'identification');
				dcp.setValue('active', true);
				dcp.update();
			} else if (classyObj.patternSysId) {
				// Need to create new record
				this.deactivateProbes(classifierId, classifierName);
				dcp.initialize();
				dcp.setValue('child', this.HORIZONTAL_PROBE_SYSID);
				dcp.setValue('classy', classifierId);
				dcp.setValue('pattern', classyObj.patternSysId);
				dcp.setValue('active', true);
				if (classyObj.classyTable.equals(this.DISCOVERY_CLASSY_PROC))
					dcp.setValue('phase', 'exploration');
				else
					dcp.setValue('phase', 'identification');
				if (classyObj.conditionScript)
					dcp.setValue('condition_script', classyObj.conditionScript);
				dcp.insert();
				this.infoMsg("Pattern Probe for Classifier '" + classifierName + "' has been created.");
			} else {
				// Should not reach here, but putting error message just in case
				this.infoMsg("Cannot find Classifier Probe or Pattern for Classifier '" + classifierName + "'. Check logs to see why this failed.");
				return;
			}
			this.infoMsg("Classifier '" + classifierName + "' has been converted to Patterns.");
		} else
			this.infoMsg("Cannot convert Classifier '" + classifierName + "' to Patterns. Check logs to see why this failed.");
	},

	deactivateProbes: function (classy, classifier) {
		var probes = new GlideRecord('discovery_classifier_probe');
		probes.addQuery('classy', classy);
		if (classifier != 'Solaris')
			probes.addQuery('name', 'DOES NOT CONTAIN', 'ADM');
		probes.addQuery('name', 'DOES NOT CONTAIN', 'TrafficBasedDataCollection');
		probes.addQuery('name', 'DOES NOT CONTAIN', 'Installed Software');
		probes.addQuery('name', 'DOES NOT CONTAIN', 'HorizontalDiscoveryProbe');
		probes.addQuery('name', 'DOES NOT CONTAIN', 'File Discovery');
		probes.query();		
		while (probes.next()) {
			probes.setWorkflow(false);
			probes.setValue('active', false);
			probes.update();
		}
	},

	setPropertyForOSProbes: function (propertyName, state) {
		var sp = new GlideRecord('sys_properties');
		sp.addQuery('name', propertyName);
		sp.query();
		if (sp.next()) {
			sp.setValue('value', state);
			sp.update();
		}
	},

	infoMsg : function(infoMsg) {
		this.logMsg(infoMsg, this.MIGRATE_SOURCE);
	},

    type: 'DiscoveryMigrateToPatterns'
});
