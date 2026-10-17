/**
 Service-now.com
 
 Description: Update the value of the key field if it's empty.
**/

var ver = current.getValue('version');
var nam = current.getValue('name');
if (ver == null)
    ver = 'NULL';
if (nam == null)
    nam = 'NULL';

current.key = '' + nam + '_:::_' + ver;
