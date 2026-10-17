// Discovery
/* Generates the key for querying TCP connections
*  Aleck.Lin@service-now.com
*/

var TCPKeyGenerator = Class.create();

TCPKeyGenerator.getKey = function(type, ip, ci, port) {
    var key = type + '_' + ip + '_' + port;
    if (ip.startsWith('127.') || ip == '::1')
        key += '_' + ci;
	
    return key;
};

TCPKeyGenerator.prototype = {
    initialize: function() {
    },

    type: 'TCPKeyGenerator'
}
