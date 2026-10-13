/**
 * This script parses server_name, node_name, cell_name, config_path from a WebSphere process command line string.
 * 
 * The 'parameters' input variable can have following sample values
 *  
 *    On Unix: 
 *       ...com.ibm.ws.bootstrap.WSLauncher com.ibm.ws.runtime.WsServer /opt/IBM/WPS/profiles/ccmdb/config localhostNode01Cell ccmdb01 server1
 *    
 *    On Windows (with double quotes): 
 *        ...com.ibm.ws.bootstrap.WSLauncher com.ibm.ws.runtime.WsServer "C:\Program Files (x86)\IBMWebSphere\AppServer\profiles\AppSrv02\config" localhostNode01Cell ccmdb01 server1
 *    
 *    On Windows (without quotes - PRB1074370)
 *        ...com.ibm.ws.bootstrap.WSLauncher com.ibm.ws.runtime.WsServer C:\was85\WebSphere\AppServer\profiles\AppSrv02\config ******Node02Cell ******Node02 server1
 *
 * From the command line parameters
 *    last == server name
 *    last - 1 == node name
 *    last - 2 == cell name
 *    last - 3 == config path
 *    last - 4 == launched program
 *    last - 5 == launcher (always predictable)
 */

var websphereParamsPortion = parameters.trim().split("com.ibm.ws.runtime.WsServer")[1].trim();

// first split the input string by the double quote
// the substrings inside two sequential double quotes are always located at the odd indices
var result = [];
var arr1 = websphereParamsPortion.split('"');
for (var idx1 = 0; idx1 < arr1.length; idx1++) {
    if (idx1 % 2) {
        // PRB1340548: do not include quotes here for Windows so that the Websphere probes do not have to deal
        // with the possibility of the parameter containing quotes or not
        result.push(arr1[idx1]);
    } else {
        // substrings that are not inside double quotes are split by space
        // and the resulted array is merged to the result while discarding the empty elements
        var arr2 = arr1[idx1].trim().split(" ");
        for (var idx2 = 0; idx2 < arr2.length; idx2++) {
            if (arr2[idx2])
                result.push(arr2[idx2]);
       }
    }
}    

current.name = result[3];
g_probe_parameters.configPath = result[0];
g_probe_parameters.cellName = result[1];
g_probe_parameters.nodeName = result[2];
g_probe_parameters.serverName = result[3];
