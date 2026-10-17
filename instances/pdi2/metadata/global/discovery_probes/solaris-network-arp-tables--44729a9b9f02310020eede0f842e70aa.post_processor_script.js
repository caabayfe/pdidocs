new ProbePostProcessor({
    process : function() {
        var lines = output.split(/\n/);
        // no results
        if (lines.length == 0)
            return;
        related_data.arpTable = {};
        for (var i=0; i<lines.length; i++) {
            var line = lines[i].trim();
            // ignore header fields
            if ((!line.startsWith('Net')) && (!line.startsWith('Device')) && (!line.startsWith('-'))) {
                var parts    = line.split(/\s+/);
                var partsLen = parts.length;
                if (partsLen > 3) {
                    related_data.arpTable[i]     = {};
                    related_data.arpTable[i].mac = parts[partsLen - 1];
                    related_data.arpTable[i].ip  = parts[1];
                }
            }
        }
    },
    
    type: "ProbePostProcessor"
});
