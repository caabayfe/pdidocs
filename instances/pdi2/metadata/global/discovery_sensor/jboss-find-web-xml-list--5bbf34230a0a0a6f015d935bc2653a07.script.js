new DiscoverySensor({
    process: function(result) {
        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split("\n");

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line)
                this.triggerProbe(line);
        }

    },

    triggerProbe: function(fileName) {
        var probe = new Probe.get("JBoss - Get web.xml");
        if (probe) {
            probe.setSource(this.getSource());
            probe.addParameter("cmdb_ci", this.getCmdbCi());
            probe.addParameter("filename", fileName);
            probe.addParameter("port", this.getParameter("port"));
			probe.setEccPriority(this.getParameter("priority"));
			probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
			var ssmObject = this.getParameter("ssm_object");
			if (ssmObject)
				probe.addParameter("ssm_object", ssmObject);
            probe.create(this.getAgent(), this.getEccQueueRecord().sys_id);
        }
    },

    type: "DiscoverySensor"
});
