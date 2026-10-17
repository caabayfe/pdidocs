var ScopedIPRange = Class.create();
ScopedIPRange.prototype = {
    initialize: function() {},

    parse: function(ip_range) {
        var nRanges = [];
        if (JSUtil.nil(ip_range))
            return nRanges;
        gs.debug('ScopedIPRange: iprange' + ip_range);
        var ranges = ip_range;

        var ipAddress;
        var ipNetwork;
        var ipRange;
        var useLegacyParsing = false;

        try {
            ipAddress = SncIPAddress;
            ipNetwork = SncIPNetwork;
            ipRange = SncIPRange;
        } catch (e) {
            ipAddress = SncIPAddressV4;
            ipNetwork = SncIPNetworkV4;
            ipRange = SncIPRangeV4;
            useLegacyParsing = true;
        }

        if (!useLegacyParsing) {
            var elements = ranges.split(',');
            gs.debug('ScopedIPRange: elements :' + elements);

            for (var i = 0; i < elements.length; i++) {
                var elem = elements[i];
                if (elem.includes(':')) {
                    nRanges.push(elem);
                    gs.debug('ScopedIPRange:' + nRanges + ' ' + elem);
                    continue;
                }
                var coll = ipNetwork.getIPNetworkInstance(elem);
                if (coll) {
                    var itr = coll.iterator();
                    while (itr.hasNext()) {

                        nRanges.push(itr.next());
                    }
                    continue;
                }
                coll = ipRange.getIPRangeV4Instance(elem);
                if (coll) {
                    var itr = coll.iterator();
                    while (itr.hasNext()) {

                        nRanges.push(itr.next());
                    }
                    continue;
                }
                coll = ipAddress.getIPAddressV4Instance(elem);
                if (coll) {
                    nRanges.push(coll);
                    continue;
                }
            }

        } else {
            var elements = ranges.split(',');
            gs.debug('ScopedIPRange: elements :' + elements);

            for (var i = 0; i < elements.length; i++) {
                var elem = elements[i];
                if (elem.includes(':')) {
                    nRanges.push(elem);
                    gs.debug('ScopedIPRange:' + nRanges + ' ' + elem);
                    continue;
                }
                if (elem.includes('/')) {
                    var coll = new ipNetwork(elem);
                    if (coll) {
                        var itr = coll.iterator();
                        while (itr.hasNext()) {

                            nRanges.push(itr.next());
                        }
                        continue;
                    }
                }

                if (elem.includes('-')) {
                    coll = ipRange.getIPRangeV4Instance(elem);
                    if (coll) {
                        var itr = coll.iterator();
                        while (itr.hasNext()) {

                            nRanges.push(itr.next());
                        }
                        continue;
                    }
                }

                coll = ipAddress.getIPAddressV4Instance(elem);
                if (coll) {
                    nRanges.push(coll);
                    continue;
                }

            }

        }
        return nRanges;
    },

     type: 'ScopedIPRange'
};
