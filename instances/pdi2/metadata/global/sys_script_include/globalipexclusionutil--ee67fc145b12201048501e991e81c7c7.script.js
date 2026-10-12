/**
 * Utility class for Global IP Exclusion
 * This class provides useful utility functions that can be used to query and
 * manipulate records in ip_exclusion table.
 */
var GlobalIPExclusionUtil = Class.create();

(function() {
    GlobalIPExclusionUtil.prototype = {
        contains: contains,
        addToIPExclusionList: addToIPExclusionList,
        getDiscoverableIPs: getDiscoverableIPs,
        getExcludedIPList: getExcludedIPList,
        isIPExcluded: isIPExcluded,
        flushCache: flushCache,

        type: 'GlobalIPExclusionUtil'
    };

    var IP_EXCLUSION_TABLE = 'ip_exclusion';
    var IP_EXCLUDED_COLUMN = 'ip_excluded';
    var IP_EXCLUSION_CACHE = 'global_ip_exclusion_cache';
    var DESCRIPTION_COLUMN = 'description';
    var LOG_SOURCE = 'GlobalIPExclusionUtil';
    var nodeLogger = new sn_automation.AutomationAPI().getNodeLogger();
    var INVALID_INPUT_MSG = 'Invalid Input! Input must be a non-empty string representing an IPv4 Address list/Range/Subnet. Global IP Exclusion of IPv6 addresses is not supported';

    /**
     * Determine if IP Exclusion list contains all the specified
     *  IP Address list/Range/Subnet
     *
     * @param  {string}   Dotted-decimal notation of IP Address or IP Range or subnet
     *                      Example: 1.1.1.1 or 1.1.1.0-1.1.1.100 or 1.1.1.0/16
     * @return {boolean}  true/false
     *                      true if ip_exclusion list contains the specified IP entirely
     *                      false if atleast one of the items in specified IP is not in
     *                           ip_exclusion list
     */
    function contains(ip) {
        debugMsg('Invoking contains for IP = ' + ip);

        if (!_isValidIP(ip)) {
            errorMsg('Error in contains(' + ip + ') : ' + INVALID_INPUT_MSG);
            return false;
        }

        // to handle calls from workflow
        if (typeof ip == 'object')
            ip = ip.toString();

        var discoverbleIPs = getDiscoverableIPs(ip);

        if (!discoverbleIPs || discoverbleIPs.length == 0) {
            infoMsg('Global IP Exclusion List contains [' + ip + ']');
            return true;
        } else {
            infoMsg('Global IP Exclusion List does not contain ' + discoverbleIPs);
            return false;
        }
    }

    function _isValidIP(input) {
        // to handle calls from workflow
        input = input + '';

        //IPv6 addresses are not supported
        return (!_isEmpty(input) && _convertToPrimitiveType(input) && (input.indexOf(':') == -1));
    }

    function _isEmpty(inputString) {
        return (!inputString || inputString.trim().length == 0);
    }

    /**
     * Add IP Collection item(s) to Global IP Exclusion list
     *
     * @param  {string}  Dotted-decimal notation of an IP Address List/IP Range or subnet
     *    Example: 1.1.1.1 or 1.1.1.1, 2.2.2.2, 3.3.3.0 or 1.1.1.0-1.1.1.100 or 1.1.1.0/16
     * @return {boolean}
     *    true  - if atleast one new record was successfully added to ip_exclusion table
     *    false - if specified item already exists in ip exclusion list
     *            or insertion failed due to other reasons
     */
    function addToIPExclusionList(ip) {
        debugMsg('Invoking addToIPExclusionList, input = ' + ip);

        var ipCollectionSysId;
        var ipCollectionSysIdList;
        var ipExclusionSysId;

        if (!_isValidIP(ip)) {
            errorMsg('Error in addToIPExclusionList(' + ip + ') : ' + INVALID_INPUT_MSG);
            return false;
        }

        var ipNotInExclusionList = getDiscoverableIPs(ip);
        debugMsg('ipNotInExclusionList = ' + ipNotInExclusionList);

        //skip insertion if ip or ip List is already part of ip_exclusion
        if (!ipNotInExclusionList || ipNotInExclusionList.length == 0) {
            debugMsg('IP Exclusion List already contains ' + ip);
            return true;
        }

        ipCollectionSysIdList = SNC.IPCollectionUtil.findOrCreateCollection(ipNotInExclusionList.toString());

        if (!ipCollectionSysIdList || ipCollectionSysIdList.length == 0) {
            warnMsg('Insertion Failed! Unable to find or insert a record in IP Collection');
            return false;
        }

        var count = ipCollectionSysIdList.size();
        var status = false;
        for (var index = 0; index < count; index++) {
            if (_insert(ipCollectionSysIdList.get(index)))
                status = true;
        }

        if (status)
            infoMsg('Insertion successful! Added ' + ipNotInExclusionList + ' to IP Exclusion List');
        else
            warnMsg('Insertion failed! Unable to add ' + ip + ' to IP Exclusion List');

        return status;
    }

    /**
     * Determine if Global IP Exclusion list contains the given IP address string
     *
     * @param  {string}   A single IP address
     *                      Example: 1.1.1.1, ::1 , 2600:1f1c:99d::7c00
     * @return {boolean}  true/false
     *                      true if ip_exclusion list contains the given IP Address
     *                      false if ip_exclusion list does not contain the given IP Address
     */
    function isIPExcluded(ip) {
        debugMsg('Invoking isIPExcluded for IP = ' + ip);

        if (!_isValidIP(ip)) {
            errorMsg('Error in isIPExcluded(' + ip + ') : ' + INVALID_INPUT_MSG);
            return false;
        }

        var exclusionLists = _getSysIdForAllExcludedIPs();
        if (!exclusionLists || exclusionLists.length == 0) {
            infoMsg('IP Exclusion list is empty!');
            return false;
        }

        if (_inIPAddressRanges(exclusionLists, ip) || _inIPAddressSubnets(exclusionLists, ip) || _inIPAddressList(exclusionLists, ip)) {
            infoMsg('Global IP Exclusion List contains [' + ip + ']');
            return true;
        }

        debugMsg('Global IP Exclusion List does not contain ' + ip);

        return false;
    }

    function initCache(name) {
        if (!name)
            return;

        if (GlideCacheManager.get(name, "_created_") == null) {
            GlideCacheManager.addPrivateCacheable(name);
            GlideCacheManager.put(name, "_created_", new GlideDateTime().getNumericValue());
        }
    }

    function flushCache() {
        GlideCacheManager.flush(IP_EXCLUSION_CACHE);
    }

    function _inIPAddressList(exclusionLists, ip) {
        var gr = new GlideRecord('ip_address_list_item_m2m');
        gr.addQuery('ip_address_list', 'IN', exclusionLists);
        gr.addQuery('ip_address_item.ip_address', ip);
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    }

    function _inIPAddressRanges(excludedSysIds, ip) {
        var ipExpandedAddress = SncIPAddress.getExpanded(ip);

        var gr = new GlideRecord('ip_address_range');
        gr.addQuery('sys_id', 'IN', excludedSysIds);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var startIp = SncIPAddress.getExpanded(gr.getValue('start_ip'));
            var endIp = SncIPAddress.getExpanded(gr.getValue('end_ip'));

            if (!startIp || !endIp) // Need this check as ip_addr validation is not enforced in ip_address_range table
                continue;
            if (startIp <= ipExpandedAddress && ipExpandedAddress <= endIp)
                return true;
        }

        return false;
    }

    function _inIPAddressSubnets(excludedSysIds, ip) {
        var gr = new GlideRecord('ip_address_subnet');
        gr.addQuery('sys_id', 'IN', excludedSysIds);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var networkIp = gr.getValue('network_ip');
            var netmask = gr.getValue('netmask');
            var subnet = SncIPNetwork.fromStringAndPrefix(networkIp, netmask);
            if (subnet.contains(SncIPAddress.fromString(ip)))
                return true;
        }

        return false;
    }

    /**
     * Insert a record in ip_exclusion for the given IPCollection reference
     *
     * @param  {string} ip_address_collection.sysId
     * @return {string} ip_exclusion.sysId of newly inserted record
     */
    function _insert(ipCollectionSysId) {
        var gr = new GlideRecord(IP_EXCLUSION_TABLE);
        gr.setValue(IP_EXCLUDED_COLUMN, ipCollectionSysId);
        gr.setValue(DESCRIPTION_COLUMN, 'Source = GlobalIPExclusionUtil API');

        return gr.insert();
    }

    /**
     * Get an IP Range for a given IP excluding all IP in Global IP Exclusion List
     *
     * @param  {string}  Dotted-decimal notation of IP Address list/IP Range/Subnet
     *         Example: 1.1.1.1 or 1.1.1.1, 3.2.1.2 or 1.1.1.0-1.1.1.100 or 1.1.1.0/16
     * @return {string}  List of IPRange , example: [1.1.1.0-1.1.1.100]
     *                   An array of distinct input IPs if ip_exclusion is empty
     *                   or null in case of invalid input
     *
     * Usage example: getDiscoverableIPs('1.1.1.1,3.2.1.2')
     *   1. if ip_exclusion is empty, returns '1.1.1.1-1.1.1.1,3.2.1.2-3.2.1.2'
     *   2. if ip_exclusion contains input, returns null
     *   3. if ip_exclusion includes 1.1.1.1 & not 3.2.1.2, returns '3.2.1.2-3.2.1.2'
     */
    function getDiscoverableIPs(ips) {
        debugMsg('Invoking getDiscoverableIPs for IP = ' + ips);

        var discoverableIPRange = [];
        var excludedIPList;
        var inputIPCollection;
        var inputIPList = [];

        if (!_isValidIP(ips)) {
            debugMsg(INVALID_INPUT_MSG);
            return null;
        }

        var uniqueInputIPs = removeDuplicates(ips);

        excludedIPList = getExcludedIPList();
        if (!excludedIPList || excludedIPList.length == 0)
            return uniqueInputIPs;

        //2. Convert input IP into an IPCollection list
        inputIPList = _convertToPrimitiveTypeList(uniqueInputIPs);

        //3.Get optimal list of IP by removing excluded IPs from the input list
        var optimalList = SncIPMetaCollection.getOptimalCollection(inputIPList, excludedIPList, true);

        if (optimalList) {
            var ipCollections = optimalList.getIPCollections();
            if (ipCollections != null && ipCollections.size() > 0)
                discoverableIPRange.push(ipCollections);
            debugMsg('Discoverable IP = ' + discoverableIPRange);
        }

        return discoverableIPRange;
    }


    /**
     * Get a list of all the IP Collection items in Global IP Exclusion list
     *
     * @return {Array<IPCollection>}
     */
    function getExcludedIPList() {
        debugMsg('Invoking getExcludedIPList');

        var excludedIPList = [];
        var excludedIPSysIdList = _getSysIdForAllExcludedIPs();

        if (!excludedIPSysIdList || excludedIPSysIdList.length == 0) {
            infoMsg('IP Exclusion list is empty!');
            return excludedIPList;
        }

        var listSize = excludedIPSysIdList.length;
        for (var index = 0; index < listSize; index++) {
            var excludedIPs = SNC.IPCollectionUtil.getPrimitiveIPCollection(excludedIPSysIdList[index]);
            if (excludedIPs != null)
                excludedIPList.push(excludedIPs);
        }

        if (excludedIPList && excludedIPList.length > 0)
            debugMsg('excludedIPList size = ' + excludedIPList.length);

        return excludedIPList;
    }

    /**
     * Get a list of sysIds for all active IP Collection references
     * in Global IP Exclusion List
     *
     * @return {Array<String>} An array of IP Collection sysIds to be excluded
     */
    function _getSysIdForAllExcludedIPs() {
        debugMsg('Invoking _getSysIdForAllExcludedIPs');

        initCache(IP_EXCLUSION_CACHE);
        var cacheKey = 'all_global_ip_exclusions';
        var excludedIPCollectionSysIdsList = GlideCacheManager.get(IP_EXCLUSION_CACHE, cacheKey);

        if (!excludedIPCollectionSysIdsList) {
            excludedIPCollectionSysIdsList = [];
            var gr = new GlideRecord(IP_EXCLUSION_TABLE);
            gr.addActiveQuery();
            gr.query();
            while (gr.next())
                excludedIPCollectionSysIdsList.push(gr.getValue(IP_EXCLUDED_COLUMN) + '');

            GlideCacheManager.put(IP_EXCLUSION_CACHE, cacheKey, excludedIPCollectionSysIdsList);
        }

        debugMsg('excludedIPCollectionSysIdsList.size = ' + excludedIPCollectionSysIdsList.length);

        return excludedIPCollectionSysIdsList;
    }

    /**
     * Convert given ip into its Primitive IPCollection type object
     *
     * @param {string}    Dotted-decimal notation of IP Address list/IP Range/Subnet
     *       Example: 1.1.1.1 or 1.1.1.1, 3.2.1.2 or 1.1.1.0-1.1.1.100 or 1.1.1.0/16
     * @return {<TYPE>}   valid types: IPList/IPRangeV4/IPNetworkV4
     */
    function _convertToPrimitiveType(ip) {
        debugMsg('Invoking _convertToPrimitiveType for ip = ' + ip);

        if (gs.nil(ip))
            return null;

        var subnet = SncIPNetworkV4.getIPNetworkInstance(ip);
        if (subnet && subnet.size() > 0)
            return subnet;

        var ipRange = SncIPRangeV4.getIPRangeV4Instance(ip);
        if (ipRange && ipRange.size() > 0)
            return ipRange;

        var ipAddressList = SncIPList.getIPListInstance(ip);
        if (ipAddressList && ipAddressList.size() > 0)
            return ipAddressList;

        return null;
    }

    /**
     * Convert given ips into a list of distinct Primitive IPCollection type objects
     *
     * @param {string}     Dotted-decimal notation of IP Address list/IP Range/Subnet
     *       Example: 1.1.1.1 or 1.1.1.1,1.1.1.0-1.1.1.100 or 1.1.1.0/16,3.2.1.0
     * @return {List<TYPE>}  List<IPCollection>
     */
    function _convertToPrimitiveTypeList(ips) {
        debugMsg('Invoking _convertToPrimitiveTypeList for ips = ' + ips);

        var totalNumberOfUniqueIPs = (ips == null) ? 0 : ips.length;
        var ipList = [];

        for (var index = 0; index < totalNumberOfUniqueIPs; index++) {
            var ipItem = _convertToPrimitiveType(ips[index]);
            if (ipItem)
                ipList.push(ipItem);
        }

        debugMsg('ipList size = ' + ipList.length);

        return ipList;
    }

    /**
     * Convert given ips into a distinct string array
     *
     * @param {string}     Dotted-decimal notation of IP Address list/IP Range/Subnet
     *                     Example: 1.1.1.1,1.1.1.1,3.2.1.0 or 10.0.0.0/23 or ['1.1.1.1', '10.11.1.10']
     * @return {Array<string>}
     */
    function removeDuplicates(ips) {
        debugMsg('Invoking removeDuplicates for ips = ' + ips);

        if (!ips)
            return []; // Handles null, undefined or 0.

        // to handle calls from workflow
        if (!(ips instanceof Array))
            ips = (ips + '').split(',');

        if (ips.length == 1)
            return ips;

        return new global.DiscoArrayUtil().unique(ips);
    }

    function debugMsg(msg) {
        nodeLogger.debug('[' + LOG_SOURCE + '] ' + msg);
    }

    function infoMsg(msg) {
        nodeLogger.info('[' + LOG_SOURCE + '] ' + msg);
        gs.log(msg, LOG_SOURCE);
    }

    function warnMsg(msg) {
        nodeLogger.warn('[' + LOG_SOURCE + '] ' + msg);
        gs.logWarning(msg, LOG_SOURCE);
    }

    function errorMsg(msg) {
        nodeLogger.error('[' + LOG_SOURCE + '] ' + msg);
        gs.logError(msg, LOG_SOURCE);
    }

})();
