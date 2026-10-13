var NfdumpParser = Packages.com.snc.sw.netflow.nfdump.NfdumpParser;
var Paths = Packages.java.nio.file.Paths;
var Runner = Packages.com.glide.util.ProcessRunner;

var LocalNfdumpInstall = Class.create();
LocalNfdumpInstall.prototype = {
    initialize: function() {
        this.setparam('dump_file_path', '/tmp/nfdump.output');
        this.setparam('exe_path', '');
        if (this.exe_path.lastIndexOf('/') != this.exe_path.length - 1)
            this.exe_path = this.exe_path + '/';
        this.setparam('data_path', '/var/flows/data');
        this.setparam('filter', '');
		this.time_filter = '';
		this.setparam('ignore_time', 'false');
		if (this.ignore_time != 'true') {
			this.setparam('schedule', '3600');
			var dd = new Date();
			// Substract the schedule period from the current date to create start time for the time window parameter
			var newTime = dd.getTime() - (this.schedule * 1000);
			dd.setTime(newTime);
			// Format the date to be nfdump format of: YYYY/MM/dd.00:00:00
			this.time_filter = ' -t ' + dd.getFullYear() + '/' +
				("00" + (dd.getMonth() + 1)).slice(-2) + '/' +
				("00" + dd.getDate()).slice(-2) + '.' +
				("00" + dd.getHours()).slice(-2) + ':' +
				("00" + dd.getMinutes()).slice(-2) + ':00';
		}
    },

    setparam: function(name, defaultValue) {
        var value = probe.getParameter(name);
        value = value ? value : defaultValue;
        this[name] = value;
    },

    execute: function() {
        var command = this.exe_path + "nfdump -q -o extended -R " + this.data_path + this.time_filter + " " + this.filter + " > " + this.dump_file_path;
        ms.log('Executing command: ' + command);
        var shellRunner = new Runner();
        shellRunner.runCommand(command);
        if (shellRunner.getError()) {
            this.error('ERROR running nfdump: ' + shellRunner.getError());
        }
        var nfdumpParser = new NfdumpParser();
        ms.log('parsing nfdump file: ' + this.dump_file_path);
		nfdumpParser.setParameters(probe.getParameters());
        nfdumpParser.parseFile(Paths.get(this.dump_file_path));
        ms.log('nfdump parsing success');
		var json = nfdumpParser.toJson();
		var chunkifator = new NetflowChunkifator();
		var lastChunk = chunkifator.chunkify(json);
        ms.log("after chunkifator.chunkify().");
        return lastChunk;
    },

    error: function(msg) {
        ms.log(msg);
        throw msg;
    },

    type: 'LocalNfdumpInstall'
};
