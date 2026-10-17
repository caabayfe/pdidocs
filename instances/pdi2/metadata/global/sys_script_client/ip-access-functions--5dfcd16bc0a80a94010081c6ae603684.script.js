// contains functions that are called by other client scripts on the ip_access table

function onLoad() {}

function isIPV4Format(str) {
    var ip_arr = str.split('.');
    if (ip_arr.length != 4) {
        return false;
    }
    for (var i = 0; i < ip_arr.length; i++) {
        var n = ip_arr[i];
        if (!isNumeric(ip_arr[i])) {
            return false;
        } else {
            var m = parseFloat(n);
            if (m < 0 || m > 255) {
                return false;
            }
        }
    }
    return true;
}

function isNumeric(val) {
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
}

function isIPV6Type(str) {
    var index = str.indexOf(":");
    if (index === -1)
        return false;
    return true;
}

/*
Method to validate input as for IPV6 rules
case that rejetcs :1::12ab, abcd:, abcd:::, abc::2:, nonhex
*/
function isIPV6Format(str) {
    var ip_arr = str.split(':');
    var l = ip_arr.length;
    if (l > 8 || ip_arr[0] == '' && ip_arr[1] != '' || ip_arr[l - 2] != '' && ip_arr[l - 1] == '')
        return false;
    if (l < 8 && str.indexOf('::') == -1)
        return false;
    if (str.indexOf(':::') != -1 || !multipleMatches(str))
        return false;
    for (var i = 0; i < ip_arr.length; i++) {
        var n = ip_arr[i];
        if (!isHex(n) || n.length > 4)
            return false;
    }
    return true;
}

/*
method check for input containing multiple  groups of ::
*/
function multipleMatches(str) {
    var first = str.indexOf('::');
    var last = str.lastIndexOf('::');
    return first === last;
}

/*
method check if string is hexadeciamal
*/
function isHex(str) {
    for (var i = 0; i < str.length; i++) {
        if ("01234567789ABCDEFabcdef".indexOf(str[i]) === -1)
            return false;
    }
    return true;
}

/*
Method to validate the range based on the start and end IPV4.
return false when start > end 
*/
function checkV4Range(start, end) {
    var arr1 = start.split('.');
    var arr2 = end.split('.');
    var isSafe = false;
    for (var i = 0; i < 4 && isSafe == false; i++) {
        if (parseFloat(arr1[i]) > parseFloat(arr2[i])) {
            alert(getMessage('IP range end must be greater than IP range start'));
            return false;
        } else if (parseFloat(arr1[i]) < parseFloat(arr2[i])) {
            isSafe = true;
        }
    }
}

/*
Method to validate the range based on the start and end IPV6.
It uses long format of IPV6
return false when start > end 
*/
function checkV6Range(start, end) {
    var arr1 = checkShort(start).split(':');
    var arr2 = checkShort(end).split(':');
    var isSafe = false;
    var l1 = arr1.length;
    var l2 = arr2.length;
    var index = (l1 >= l2) ? l1 : l2;
    for (var i = 0; i < index && isSafe == false; i++) {
        var startElement = parseInt(arr1[i], 16);
        var endElement = parseInt(arr2[i], 16);
        isSafe = isNotSafe(startElement, endElement);
    }
    if (isSafe) {
        alert(getMessage('IP range end must be greater than IP range start'));
        return false;
    }
    return true;
}

function isNotSafe(val1, val2) {
    if (val1 > val2)
        return true;
    else if (val1 <= val2) {
        return false;
    }
}

/*
method pads with 0 at the beginning, end or middle when IPV6 is short format
cases like ::12ab, ab12::, ab12:1:2, 1:2:abcd, ::, ::0, ::1 abcd::f123
*/
function addZeros(str1, str2, isStart) {
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
}

/*
Method to check the short format of IPV6 
*/
function checkShort(str) {
    var arr = str.split('::');
    var l = arr.length;
    var start = "0:";
    var end = ":0";
    if (l == 2 && arr[0] === '' && arr[1] === '') {
        return "0:0:0:0:0:0:0:0";
    }
    if (l == 2) {
        if (arr[0] !== '' && arr[1] !== '')
            return arr[0] + ":" + addZeros(arr[0], arr[1], true) + arr[1];
        else if (arr[0] === '')
            return start + addZeros(arr[0], arr[1], true) + arr[1];
        else if (arr[1] === '')
            return arr[0] + end + addZeros(arr[0], arr[1], false);
    } else
        return str;
}
