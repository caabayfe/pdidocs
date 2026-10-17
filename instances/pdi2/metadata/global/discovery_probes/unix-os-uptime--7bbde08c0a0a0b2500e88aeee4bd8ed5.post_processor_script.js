new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {

        // Imports from Java Standard Libraries that we will use later
        var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
        var Locale = Packages.java.util.Locale;

		// Parse the input
        var uptime = 0;
        var lines = output.split('\n');

        var m = lines[0].match(/up (.*?),\s*(.*?),/);
        if (m) {
            uptime += parseInt(this.getSecondsFromStr(m[1]));
            uptime += parseInt(this.getSecondsFromStr(m[2]));
        }

        if (uptime > 0) {
            var nowDate = 0;

            // We need to explicitly request the "root" Locale by specifying the Locale.ROOT enum value
            // This corresponds to the UNIX LC_ALL=C "C" Locale which is country/language/variant independent.
            // LC_ALL=C is what we are requesting in this Probe's SSHCommand:
            //         uptime;env LC_ALL=C date '+%a %b %e %H:%M %Z %Y'
            // "C" is the POSIX locale as defined by The Single UNIX Specification.
            //  We want the way we parse the date to match the way we ask for it.
            // If we don't specify this, then the MID Server's JVM Locale, either explicitly specified by
            // Java System Properties (user.country, user.language, user.variant) or implicitly specified by
            // the host machine's settings will be used, potentially re-interpreting the format string
            // incorrectly, as seen in PRB1265978.
            var df = new SimpleDateFormat("EEE MMM d HH:mm z yyyy", Locale.ROOT);
            var d = df.parse(lines[1]);
            nowDate = d.getTime();

            uptime = nowDate - (uptime*1000); // in ms
        }
		
		// round up to the next minute to increase the chance of cache hit
		var roundToNearest = 60000;
		current.start_date = Math.ceil(uptime/roundToNearest)*roundToNearest;
    },
  
    getSecondsFromStr: function(str) {
        var m = 0;
		var secs = 0;
		
        if ((m = str.match(/(\d+) day/))) {
            var days = m[1];
            secs += days*86400;
        } 
		
		if ((m = str.match(/(\d+) min/))) {
            var mins = m[1];
            secs += mins*60;
        } 
		
		if ((m = str.match(/(\d+):(\d+)/))) {
            var hours = m[1];
            var mins = m[2];
            secs += 3600*hours;
            secs += mins*60;
        }

        return secs;
    },
   
    type: "ProbePostProcessor"
});
