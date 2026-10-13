getNeighborsForNetworkDevice();

function getNeighborsForNetworkDevice(){

var result =[ ];
var npm = new SNC.NetworkPathManager();
	
var ciIdToRelProperties = npm.getNetworkNeighbors(dv_ci_id);
for(var ciId in ciIdToRelProperties){
	var propertiesMap = ciIdToRelProperties[ciId];
	result.push({
            "dv_ci_id": ciId,
            "dv_downstream": propertiesMap["relation_direction"],
			"dv_rel_type": propertiesMap["relation_type"]
        });
}
	
return result;
	
}
