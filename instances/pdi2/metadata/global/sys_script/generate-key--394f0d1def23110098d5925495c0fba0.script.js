/**
 Service-now.com
 
 Description: Generate a key for the cmdb_tcp_connection
**/
var ci = current.computer || current.cmdb_ci || '';
current.key = TCPKeyGenerator.getKey(current.type, current.ip, ci, current.port);
