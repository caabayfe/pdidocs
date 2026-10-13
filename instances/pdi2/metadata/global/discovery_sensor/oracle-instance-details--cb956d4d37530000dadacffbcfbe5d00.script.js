new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var homeMatch = line.match(/^snc_ora_home=(.+)$/);
            if (homeMatch) {
                current.oracle_home = homeMatch[1];
                continue;
            }
            var versionMatch = line.match(/^snc_ora_version=(\d+(?:\.\d+)+)$/);
            if (versionMatch) {
                current.version = versionMatch[1];
                continue;
            }
            var pFileMatch = line.match(/^snc_pfile_contents=$/);
            if (pFileMatch) {
                current.pfile = this.readPFile(lines, i + 1);
                break;
            }
            var errorMatch = line.match(/^snc_error=(.+)$/);
            if (errorMatch)
                this.processError(errorMatch[1]);
        }
    },

    readPFile: function(lines, start) {
        var pfile="";
        for (var i = start; i < lines.length; i++)
            pfile += lines[i] + "\n";
        return pfile;
    },

    type: "DiscoverySensor"
});
