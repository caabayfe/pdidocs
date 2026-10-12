/**
 Service-now.com
 
 Description: Calculate the decimal and expanded value of the IP address field
**/
var ipAddress = SncIPAddress.fromString(current.ip_address + '');
if (ipAddress){
	current.ip_address_expanded = ipAddress.toExpanded(); 
	if (ipAddress.isV4())
		current.ip_address_decimal =  new SncAddress32Bit(current.ip_address + '').getAddressAsLong();
}
