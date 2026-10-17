var ResolveHostNameProbe = Class.create();
var DNSUtils = Packages.com.snc.sw.util.DNSUtils;
ResolveHostNameProbe.prototype = Object.extendsObject(AProbe, {
    run: function() {
		var hostname = this.probe.getParameter('source');
		var ipList = DNSUtils.resolveHostName(hostname); //List<String>
		this.probe.createCDATAElement('result', this.ipListToJson(ipList));
		this.probe.setHaveResult(true);
	},
	
	ipListToJson: function(ipList) {
		var ipArr = [ ];
		if (!ipList)
			return JSON.stringify(ipArr);
		
		for (var i = 0; i < ipList.size(); i++)
			ipArr.push(''+ipList.get(i));
		
		return JSON.stringify(ipArr);
	},

	type : 'ResolveHostNameProbe'
});
