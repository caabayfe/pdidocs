function(result, ciData, debug, sensor) {
    if ((result == null) || JSUtil.nil(result.output))
        return;
        
    var output = result.output;
	
    // split output into system_profiler output and ifconfig output
    var lines = output.split('\n');
    var spOutput = [];
    var ifOutput = [];
    var ifTime = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!ifTime) {
            spOutput.push(line);
            ifTime = ('</plist>' == line)
        } else {
            ifOutput.push(line);
        }
    }
    spOutput = spOutput.join('\n');
        
    var DMPU = new DiscoveryMacProfileUtils();
    var baseElements = DMPU.getBaseElement(spOutput);
	if (JSUtil.nil(baseElements)) {
		var msg = "Unable to parse input payload for Mac OS X - Network";
		sensor.getLogger().warn(msg);					
		return;
	}		
    var section = baseElements[0];
    var nics = processNetwork(section['_items']);       
    var adapterList = processIPv6(nics, ifOutput);
    var nicsRL = new CIRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
    ciData.addRelatedList(nicsRL);
    nicsRL.addRecs(adapterList);
    

    function processIPv6(nics, ifOutput) {
        for (var i = 0; i < ifOutput.length; i++) {
            var line = ifOutput[i];
            var parsedLine = /^\W*inet6\W+(.*)%(\w+).*prefixlen\s*(\d*).*$/.exec(line);
            if (!parsedLine)
                continue;
                
            var ipv6_addr = parsedLine[1];
            var nicName = parsedLine[2];
            var netmask = parsedLine[3];
            var nic = nics[nicName];
            if (!nic)
                continue;
                
            var ipv6 = SncIPAddressV6.get(ipv6_addr);
            if (!ipv6)
                continue;
            
            var ip = {};
            ip.ip_address = ipv6_addr;
            ip.ip_version = '6';
            ip.netmask = gs.nil(netmask) ? null : netmask;
            nic.ip_addresses.push(ip); 
        }
        
        var adapterList = [];
        for (var nicName in nics)
            adapterList.push(nics[nicName]);
        return adapterList;
    }
    
    function processNetwork(items) {
        var nics = {};

        for(var i = 0; i < items.length; i++) {
            var dev = items[i];

            if ((dev['hardware'] != 'Ethernet') && (dev['hardware'] != 'AirPort'))          	
                continue;    

            if (dev['ip_assigned'] && dev['ip_assigned'] != 'yes')
                continue;

            if (dev['Ethernet'] == null)
                continue;

            var ipSec = dev['IPv4'];
            if (ipSec == null)
                continue;

            var ips = [];
            for (var j = 0; j < ipSec.Addresses.length; j++) {
                var ip = {};
                ip.ip_address = ipSec.Addresses[j];
                ip.netmask = (j < ipSec.SubnetMasks.length) ? ipSec.SubnetMasks[j] : null;
                ip.ip_version = '4';
                ips.push(ip);
            }

            var adapter = {};
            adapter.name = dev['interface'];
            adapter.ip_address = (ips.length > 0) ? ips[0].ip_address : null;
            adapter.netmask = (ips.length > 0) ? ips[0].netmask : null;
            adapter.ip_addresses = ips;
            adapter.mac_address = dev['Ethernet']['MAC Address'];
            adapter.dhcp_enabled = (ipSec['ConfigMethod'] == "DHCP");

            nics[adapter.name] = adapter;
        }
        return nics;
    }
}
