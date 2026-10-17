/*********************************************************************************************
Use this method to add a CI to the map.
The input format is json and it contains the following parameters:
•	targetid – The sys id of the CI needed to be added
•	bsid – The sys id of the business service the CI need to be added to 
•	sourceid – The sys id of the CI to connect the added CI to
The input must have the following format:

{ 
	ADD_MANUAL_CI : {
		bsid : "BS_SYS_ID", 
		sourceid: "SOURCE_CI_SYS_ID", 
		targetid: "TARGET_CI_SYS_ID"
	}
}
 
Make sure the input CIs fallows the following restrictions:
	•	Source CI must by a real CI. Do not use a cluster, an endpoint or a NAT as the source CI.
	•	 The CI type of the target CI must be allowed by the "getCiTypes" API. By default, the "getCiTypes" API allows all CI types that extend the cmdb_ci table, except:
		o	Endpoint (cmdb_ci_endpoint)
		o	NAT (cmdb_ci_translation_rule)
		o	NAT Gateway (cmdb_ci_nat_gateway)
		o	Configuration file (cmdb_ci_config_file)
		o	Qualifier (cmdb_ci_qualifier)
		o	Application Cluster (cmdb_ci_application_cluster)
	•	Verify that the target CI follows these guidelines:
		o	It is not the source CI.
		o	 It is not already connected to the source CI.
		o	On clusters and inclusions, make sure this CI cannot create a connection within a group.
			♣	Adding a CI to its peers in the cluster.
			♣	Adding an included CI after the inclusion
			♣	Adding an inclusion CI after the included CI
			♣	Adding a CI between all levels within clusters or inclusions, for example, a cluster within a cluster, inclusion within a cluster and so on.
 
*********************************************************************************************/


(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var msg ="";
	var json = {};
	
	try{
		
		var body = GlideStringUtil.getStringFromStream(request.body.dataStream);
		
		if (GlideStringUtil.nil(body)) {
			msg = gs.getMessage("Wrong input for add manual CI, input must not be empty");
		} else {
			try {
				json = JSON.parse(body);
			}
			catch (eJson) {
				msg = gs.getMessage("Wrong input for add manual CI, input must be JSON. {0}", [eJson]);				
			}
			
			if (msg === "") {
				var bsid = json.ADD_MANUAL_CI.bsid;
				var sourceid = json.ADD_MANUAL_CI.sourceId;
				var targetid = json.ADD_MANUAL_CI.targetId;

				var bsManager = new SNC.BusinessServiceManager();
				msg = bsManager.addCISync(bsid,sourceid,targetid);
			}
		}
	}
	catch(e){
		msg = gs.getMessage("Add CI Manualy failed: {0}", [e]);
	}
	
	if (msg !== "") {
		response.setStatus(400);
		throw new sn_ws_err.BadRequestError(msg);
	}
	
})(request, response);
