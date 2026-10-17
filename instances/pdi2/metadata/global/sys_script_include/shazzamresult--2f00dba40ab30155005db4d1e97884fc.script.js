// Discovery class

/**
 * Encapsulates the notion of a Shazzam result.  Instances have the following properties initialized:
 * 
 * ip:         the IP address of the results
 * active:     true if this IP address is active (at least one port open)
 * alive:      true if this IP address is alive (no ports open, but at least one responded)
 * scanners:   a JavaScript array of ShazzamScanner instances
 * hostName:   the hostname for the IP, if one was resolved by this scanner
 * domainName: the Windows domain name for the IP, if one was resolved by this scanner
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var ShazzamResult = Class.create();

ShazzamResult.prototype = {
    initialize: function(result) {
        this.ip     = result['@ip_address'];
        this.active = ('true' == result['@active']);
        this.alive  = ('true' == result['@alive']);
        result.scanner = g_array_util.ensureArray(result.scanner);
        this.hostName = null;
        this.domainName = null;
		this.scanners = new Array();
        
		// convert scanners to ShazzamScanner instances, in-place...
        for (var i = 0; i < result.scanner.length; i++)
            this.scanners.push(new ShazzamScanner(result.scanner[i]));

        this.resolveNames();
    },
    
    /*
     * Scan the result looking for resolved names; if they exist.  Any names found are attached to the result.
     */
    resolveNames: function() {
        for (var i = 0; i < this.scanners.length; i++) {
            var scanner = this.scanners[i];
            if (scanner.hostName) {
                if (!this.hostName)
                    this.hostName = scanner.hostName;
                else {
                    if (scanner.service == 'dns')
                        this.hostName = scanner.hostName;
                }
            }
            if (scanner.domainName)
                this.domainName = scanner.domainName;
        }
    },
    
    type: "ShazzamResult"
}
