var IPAccessHandler = Class.create();
IPAccessHandler.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    validateRangeEndIP: function() {
        obj = {};
        obj.message = '';
        var newValue = this.getParameter('sysparm_newValue');
        var table = this.getParameter('sysparm_table');
        var sysId = this.getParameter('sysparm_sysId');
        var isV6Type = this._isIPV6Type(newValue);
        var isV6Format = this._isIPV6Format(newValue);
        var isV4Format = this._isIPV4Format(newValue);

        var gr = new GlideRecordSecure(table);
        if (!gr.get(sysId))
            return JSON.stringify(obj.status = 'false');
		
        var rangeStart = gr.range_start;
        var isRSV6Type = this._isIPV6Type(rangeStart);

        if (isRSV6Type && !isV6Type) {
            obj.message = gs.getMessage('IP address must be in IPV6 numerical format with no spaces, e.g. fd07:a47c:3742:823e:3b02:76:982b:463');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (!isRSV6Type && isV6Type) {
            obj.message = gs.getMessage('IP address must be in IPv4 numerical format with no spaces, e.g. 132.76.234.112');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (isV6Type && !isV6Format || !isV6Type && !isV4Format) {
            obj.message = gs.getMessage('IP address is unknown format');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (isRSV6Type && isV6Format && !this._checkV6Range(rangeStart, newValue)) {
            obj.status = 'false';
            obj.message = gs.getMessage('IP range end must be greater than IP range start');
            return JSON.stringify(obj);
        } else if (!isRSV6Type && isV4Format && !this._checkV4Range(rangeStart, newValue)) {
            obj.status = 'false';
            obj.message = gs.getMessage('IP range end must be greater than IP range start');
            return JSON.stringify(obj);
        }

        obj.status = 'true';
        return JSON.stringify(obj);

    },

    validateRangeStartIP: function() {
        obj = {};
        obj.message = '';
        var newValue = this.getParameter('sysparm_newValue');
        var table = this.getParameter('sysparm_table');
        var sysId = this.getParameter('sysparm_sysId');
        var isV6Type = this._isIPV6Type(newValue);
        var isV6Format = this._isIPV6Format(newValue);
        var isV4Format = this._isIPV4Format(newValue);

        var gr = new GlideRecordSecure(table);
        if (!gr.get(sysId))
            return JSON.stringify(obj.status = 'false');
		
        var rangeEnd = gr.range_end;
        var isREV6Type = this._isIPV6Type(rangeEnd);

        if (isREV6Type && !isV6Type) {
            obj.message = gs.getMessage('IP address must be in IPV6 numerical format with no spaces, e.g. fd07:a47c:3742:823e:3b02:76:982b:463');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (!isREV6Type && isV6Type) {
            obj.message = gs.getMessage('IP address must be in IPv4 numerical format with no spaces, e.g. 132.76.234.112');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (isV6Type && !isV6Format || !isV6Type && !isV4Format) {
            obj.message = gs.getMessage('IP address is unknown format');
            obj.status = 'false';
            return JSON.stringify(obj);
        } else if (isREV6Type && isV6Format && !this._checkV6Range(newValue, rangeEnd)) {
            obj.status = 'false';
            obj.message = gs.getMessage('IP range end must be greater than IP range start');
            return JSON.stringify(obj);
        } else if (!isREV6Type && isV4Format && !this._checkV4Range(newValue, rangeEnd)) {
            obj.status = 'false';
            obj.message = gs.getMessage('IP range end must be greater than IP range start');
            return JSON.stringify(obj);
        }

        obj.status = 'true';
        return JSON.stringify(obj);

    },

    _isIPV4Format: function(str) {
        var val = new String(str);
        var ip_arr = val.split('.');
        var l = ip_arr.length;
        if (l != 4) {
            return false;
        }

        for (var i = 0; i < ip_arr.length; i++) {
            var n = ip_arr[i];
            if (!this._isNumeric(ip_arr[i]))
                return false;
            else {
                var m = parseFloat(n);
                if (m < 0 || m > 255) {
                    return false;
                }
            }
        }
        return true;
    },

    _isNumeric: function(val) {
        var num = new String(val);
        if (num.length == 0) {
            return false;
        } else if (num.length == 1 && (num.charAt(0) == '.' || num.charAt(0) == ',' || (num.charAt(0) == '-'))) {
            return false;
        }
        for (var x = 0; x < num.length; x++) {
            if ((num.charAt(x) >= '0' && num.charAt(x) <= '9') || num.charAt(x) == '.' || num.charAt(x) == ',' || (num.charAt(x) == '-' && x == 0)) {} else {
                return false;
            }
        }
        return true;
    },

    _isIPV6Type: function(str) {
        var index = str.indexOf(":");
        if (index === -1)
            return false;
        return true;
    },

    /*
	Method to validate input as for IPV6 rules
    case that rejetcs :1::12ab, abcd:, abcd:::, abc::2:, nonhex
    */
    _isIPV6Format: function(str) {
        var ip_arr = str.split(':');
        var l = ip_arr.length;
        if (l > 8 || ip_arr[0] == '' && ip_arr[1] != '' || ip_arr[l - 2] != '' && ip_arr[l - 1] == '')
            return false;
        if (l < 8 && str.indexOf('::') == -1)
            return false;
        if (str.indexOf(':::') != -1 || !this._multipleMatches(str))
            return false;
        for (var i = 0; i < ip_arr.length; i++) {
            var n = new String(ip_arr[i]);
            if (!this._isHex(n) || n.length > 4)
                return false;
        }
        return true;
    },

    /*
    method check for input containing multiple  groups of ::
    */
    _multipleMatches: function(str) {
        var first = str.indexOf('::');
        var last = str.lastIndexOf('::');
        return first === last;
    },

    /*
    method check if string is hexadeciamal
    */
    _isHex: function(str) {
        var val = new String(str);
        for (var i = 0; i < val.length; i++) {
            if ("01234567789ABCDEFabcdef".indexOf(val[i]) === -1)
                return false;
        }
        return true;
    },

    /*
    Method to validate the range based on the start and end IPV4.
    return false when start > end 
    */
    _checkV4Range: function(start, end) {
        var val1 = new String(start);
        var val2 = new String(end);
        var arr1 = val1.split('.');
        var arr2 = val2.split('.');
        var isSafe = false;
        for (var i = 0; i < 4 && isSafe == false; i++) {
            var sNumber = parseFloat(arr1[i]);
            var eNumber = parseFloat(arr2[i]);
            if (sNumber > eNumber)
                return false;
            else if (sNumber < eNumber)
                isSafe = true;

        }
        return true;
    },

    /*
    Method to validate the range based on the start and end IPV6.
    It uses long format of IPV6
    return false when start > end 
    */
    _checkV6Range: function(start, end) {
        var val1 = new String(start);
        var val2 = new String(end);
        var arr1 = this._checkShort(val1).split(':');
        var arr2 = this._checkShort(val2).split(':');
        var isSafe = false;
        var l1 = arr1.length;
        var l2 = arr2.length;
        var index = (l1 >= l2) ? l1 : l2;
        for (var i = 0; i < index && isSafe == false; i++) {
            var startElement = parseInt(arr1[i], 16);
            var endElement = parseInt(arr2[i], 16);
            isSafe = this._isNotSafe(startElement, endElement);
        }
        if (isSafe)
            return false;
        return true;
    },

    _isNotSafe: function(val1, val2) {
        if (val1 > val2)
            return true;
        else if (val1 <= val2) {
            return false;
        }
    },

    /*
    method pads with 0 at the beginning, end or middle when IPV6 is short format
    cases like ::12ab, ab12::, ab12:1:2, 1:2:abcd, ::, ::0, ::1 abcd::f123
    */
    _addZeros: function(str1, str2, isStart) {
        var arr1 = str1.split(':');
        var arr2 = str2.split(':');
        var ret = "";
        var start = "0:";
        var end = ":0";
        var l1 = arr1.length;
        var l2 = arr2.length;
        for (var i = 0; i < 8 - l1 - l2; i++) {
            if (l1 == 1 && l2 > 1)
                ret = ret + start;
            else if (l1 > 1 && l2 == 1)
                ret = ret + start;
            else if (l1 > 1 && l2 > 1)
                ret = ret + start;
            else if (l1 == 1 && l1 == 1 && isStart)
                ret = ret + start;
            else if (l1 == 1 && l2 == 1 && !isStart)
                ret = ret + end;
        }
        return ret;
    },

    /*
    Method to check the short format of IPV6 
    */
    _checkShort: function(str) {
        var arr = str.split('::');
        var l = arr.length;
        var start = "0:";
        var end = ":0";
        if (l == 2 && arr[0] === '' && arr[1] === '') {
            return "0:0:0:0:0:0:0:0";
        }
        if (l == 2) {
            if (arr[0] !== '' && arr[1] !== '')
                return arr[0] + ":" + this._addZeros(arr[0], arr[1], true) + arr[1];
            else if (arr[0] === '')
                return start + this._addZeros(arr[0], arr[1], true) + arr[1];
            else if (arr[1] === '')
                return arr[0] + end + this._addZeros(arr[0], arr[1], false);
        } else
            return str;
    },

    type: "IPAccessHandler"
});
