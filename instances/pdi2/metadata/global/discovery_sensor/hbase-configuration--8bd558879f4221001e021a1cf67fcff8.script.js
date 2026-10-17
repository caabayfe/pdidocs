new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
		current.site_xml = output;
		
		var filename = g_probe.getParameter("filename") + '';
		if (filename.indexOf("/") > -1) {
			current.config_file = filename;
			current.config_directory = filename.substring(0, filename.lastIndexOf("/"));
		}

        var xmldoc = new XMLDocument(output);

        // HBase Root Directory
        var rootdir = xmldoc.getNodeText("//value[../name/text() = 'hbase.rootdir']");
        current.root_dir = rootdir;
        
        // zookeeper quorum
        var zookeeper = xmldoc.getNodeText("//value[../name/text() = 'hbase.zookeeper.quorum']");
        current.zookeeper = !gs.nil(zookeeper)? zookeeper : 'localhost';
    },
	
    type: "DiscoverySensor"
});
