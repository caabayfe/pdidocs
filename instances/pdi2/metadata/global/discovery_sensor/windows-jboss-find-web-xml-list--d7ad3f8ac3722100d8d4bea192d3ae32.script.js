new DiscoveryJSONSensor({

    processJSON: function() {

        if (JSUtil.nil(related_data) || JSUtil.nil(related_data.filepaths)) {
			DiscoveryLogger.info("Could not find any web.xml files within server/default/deploy target directory.", "Discovery", this.getEccQueueId());
			return;
		}

		var filepaths = related_data.filepaths;

        for (var i = 0; i < filepaths.length; i++) {
            var path = filepaths[i];
            this.triggerProbe(path);
        }
    },

    triggerProbe: function(path) {
        var probe = new Probe.get("Windows - JBoss Get web.xml");
        if (probe) {
            probe.setSource(this.getSource());
            probe.addParameter("cmdb_ci", this.getCmdbCi());
            probe.addParameter("filename", path);
            probe.addParameter("port", this.getParameter("port"));
			probe.setEccPriority(this.getParameter("priority"));
			probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
			var ssmObject = this.getParameter("ssm_object");
			if (ssmObject)
				probe.addParameter("ssm_object", ssmObject);
            probe.create(this.getAgent(), this.getEccQueueRecord().sys_id);
        }
    },

    type: "DiscoveryJSONSensor"
});
