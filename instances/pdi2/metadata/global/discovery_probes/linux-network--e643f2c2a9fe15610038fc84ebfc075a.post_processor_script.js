new ProbePostProcessor({

    /**
     * Runs the probe instance
     */
    process: function() {
        if (JSUtil.nil(output))
            return;

        var sliceIndex = output.indexOf('\n');
        if (sliceIndex === -1) {
            g_probe.setError('Unexpected output: ' + output);
            return;
        }
        var partsRegex;
        var ipv4Regex;
        var ipv6Regex;
        var defaultGatewayRegex;
        var getMacAddressFunction;
        var isIprouteOutput;
		
        if (output.startsWith('iproute output')) {
            isIprouteOutput = true;
            partsRegex = new RegExp("^\\d+:\\s+(\\S+)((?:.*\\n\\s+.*)+)", "gm");
            ipv4Regex = new RegExp("inet\\s+(\\S+)\\/(\\d+)", "ig");
            ipv6Regex = new RegExp("inet6\\s+(\\S+)\\/(\\d+)", "ig");
            defaultGatewayRegex = new RegExp("^default\\s+via\\s+(\\S+).*dev\\s+(\\S+)", "gm");
            getMacAddressFunction = this.getIprouteMacAddress;
        } else if (output.startsWith('net-tools output')) {
            isIprouteOutput = false;
            partsRegex = new RegExp("^(\\S+)\\s+((.*\\n\\B){0,})", "gm");
            ipv4Regex = new RegExp("inet (?:addr:)?(\\S+).*?(?:(?:mask:)|(?:netmask ))(\\S+)", "ig");
            ipv6Regex = new RegExp("inet6 (?:addr: )?(\\S+)(?:\\/|(?:\\s+prefixlen ))(\\d*)", "ig");
            defaultGatewayRegex = new RegExp("^0.0.0.0\\s+(\\S+)\\s+(?:\\S+\\s+){5}(\\S+)$", "gm");
            getMacAddressFunction = this.getNetToolsMacAddress;
        } else {
            g_probe.setError('Both net-tools and iproute commands failed to get network information');
            return;
        }

		// separate out the actual output
		output = output.substring(sliceIndex + 1);

        var idutil = new IDSensorUtil();
		var adapterInfo = output.substring(0, output.indexOf('SNC_ROUTING_TABLE_SNC'));
		var replaceAdapterInfo = adapterInfo + 'SNC_ROUTING_TABLE_SNC';
		output.replace(replaceAdapterInfo, '');
        related_data.adapters = idutil.getAdapters(adapterInfo, null,
            partsRegex,
            ipv4Regex,
            ipv6Regex,
            getMacAddressFunction);

        related_data.default_gateway = idutil.getAdapterGateways(output, related_data.adapters,
            defaultGatewayRegex);

        if (isIprouteOutput)
            idutil.getAdapterRoutesIproute(output, related_data.adapters);
        else
            idutil.getAdapterRoutes(output, related_data.adapters);
    },

    getIprouteMacAddress: function(output, adapterName, ipAddress) {
        var macRegex = new RegExp("^\\d+:\\s+" + adapterName + ".*link\\/\\S+\\s(\\S+)", "mg");
        var macMatch = macRegex.exec(output);
        if (macMatch !== null && macMatch[1])
            return macMatch[1];
        return "";
    },

    // Take the IP address even though we don't use it because other sensors do use it
    // and this is to keep the signature in sync to be called from a common function
    // in the script include DiscoveryIDSensor
    getNetToolsMacAddress: function(output, adapterName, ipAddress) {
        // Centos  10 and RHEL 10 use a very different output format from older versions:
        // - interface name has ':' after it
        // - 'ether ' precedes the MAC address (instead of 'HWaddr'), and it's not on the first line.
        var macRegex = new RegExp("^" + adapterName + "(?::?[\\S\\s]*(?:ether|HWaddr)\\s+(\\S+))", "mg");
        var macMatch = macRegex.exec(output);

        if (macMatch !== null && macMatch[1])
            return macMatch[1];
        return "";
    }
});
