/*********************************************************************************************
Use this method to fix a discovery error by replacing an error on the map with a CI. You can also add an end point for the discovery process to continue after the added CI.

The input format is json and it contains the following parameters:
•	targetid – The sys id of the CI needed to be added
•	bsid – The sys id of the business service the CI need to be added to 
•	errorid – The sys id of the error end point to be replaced by the target CI
•	manualEP- An optional Json containing parameters for the added endpoint 
	o	epClassName- the type (class) of the end point that should be created
	o	epAttributes- A Json representing the attributes for the end point, to help the discovery process. 

The input must have the following syntax:

{
	SKIP_N_RESUME: {
		bsid : "BS_SYS_ID",
		errorid: "SOURCE_ERROR_EP_SYS_ID",
		targetid: "TARGET_CI_SYS_ID"
	}, 
	manualEP : {
		epClassName: "END_POINT_CLASS_NAME",
		epAttributes: {
			epAttribute1 : "epAttributeValue1",
			epAttribute2 : "epAttributeValue2"
			}
		}
	}
}
 
Make sure the input CIs respect these restrictions:
•	Use this function only for a source endpoint that reflects as an error on the map.
•	You cannot use this function to fix errors inside an inclusion
•	The CI type of the target CI must be allowed by the "getCiTypes" API. By default, the "getCiTypes" API allows all CI types that extend the cmdb_ci table, except:
	o	Endpoint (cmdb_ci_endpoint)
	o	NAT (cmdb_ci_translation_rule)
	o	NAT Gateway (cmdb_ci_nat_gateway)
	o	Configuration file (cmdb_ci_config_file)
	o	Qualifier (cmdb_ci_qualifier)
	o	Application Cluster (cmdb_ci_application_cluster)
•	Verify that the target CI follows these guidelines:
	o	It is not the CI that leads to the error
	o	On clusters and inclusions, make sure this CI cannot create a connection within a group
		♣	Adding a CI to its peers in the cluster.
		♣	Adding an included CI immediately after the inclusion
		♣	Adding an inclusion CI immediately after the inclusion CI
		♣	Adding a CI between all levels within clusters or inclusions, for example, a cluster within a cluster, inclusion within a cluster and so on.
*********************************************************************************************/

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var body = "";
	var msg = "";
	var json = "";
		
	var bsid = "";
	var errorId = "";
	var targetid = "";

	var bsManager = new SNC.BusinessServiceManager();

	try {
		body = GlideStringUtil.getStringFromStream(request.body.dataStream);
		
		if (GlideStringUtil.nil(body)) {
			msg = gs.getMessage("Wrong input for Skip and Resume, input must not be empty");
		} else {
			try {
				json = JSON.parse(body);
			}
			catch (eJson) {
				msg = gs.getMessage("Wrong input for Skip and Resume, input must be JSON. {0}", [eJson]);				
			}
						
			if (msg === "") {
				bsid = json.SKIP_N_RESUME.bsid;
				errorId = json.SKIP_N_RESUME.errorId;
				targetid = json.SKIP_N_RESUME.targetId;

				bsManager = new SNC.BusinessServiceManager();
				msg = bsManager.skipAndResume(bsid,errorId,targetid);
				if (msg !== "") {
					msg = gs.getMessage("Add CI Manualy failed: {0}", [msg]);
				}
			}
		}
	}catch (e){
		msg = gs.getMessage("Add CI Manualy failed: {0}", [msg]);
	}
	
	if ((msg === "") && (json.manualEP)){
		
		try {
			var epClassName=json.manualEP.epClassName;
			var epAttributes=json.manualEP.epAttributes;
			var ep = new GlideRecord(epClassName);
			
			if (ep.isValid()) {

				ep.initialize();
				for (var attribName in epAttributes)
					ep.setValue(attribName, epAttributes[attribName]);

				ep.setWorkflow(true);


				try{
					bsManager.addManualConnection(targetid,ep,bsid);
				}
				catch(e){
					//converting the error to string.
					// extracting the message. the format of stringified exception is --> exceptionClass: message.
					//if the exception is not in that format, we will show unformatted exeption.
					var ex=e + "";
					var msgs=ex.split(":");
					var msg=ex;

					if(msgs[1]){
						msg=msgs[1];
					}


					msg = gs.getMessage("Add CI succeded, add connection failed. {0}", [msg]);
				}
			}
			else {
					msg = gs.getMessage("Add CI succeded, add connection failed. Table '{0}' must be an endpoint.", [epClassName]);				
			}
			
		}catch (e){
			msg = gs.getMessage("Add CI succeded, add connection failed due to the following error: {0}", [e]);
		}
	}
	
	if (msg !== "") {
		response.setStatus(400);
		throw new sn_ws_err.BadRequestError(msg);
	}
	
})(request, response);
