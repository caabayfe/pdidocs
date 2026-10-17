var UCSRestXmlApiClient = Class.create();

/*
 This is the implementation of Cisco UCS XML/API by using GlideHTTPClient as part
 of solution for horizontal discovery that will perfromed by horizontal discovery pattern.
 GlideHTTPClient using Appache Http Clinet as core element for http conversations
 */
UCSRestXmlApiClient.prototype = {

    initialize: function(ucsHost) {
        ms.log("UCSRestXmlApiClient: Starting initialize");
        this.host = ucsHost;
        this.Document = Packages.org.w3c.dom.Document;
        this.PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        this.RequestEntity = Packages.org.apache.commons.httpclient.methods.RequestEntity;
        this.StringRequestEntity = Packages.org.apache.commons.httpclient.methods.StringRequestEntity;
        this.GlideHTTPCient = Packages.com.glide.communications.HTTPClient;
        this.httpClient = new this.GlideHTTPCient();
        this.sessionCookie = null;
        this.userName = "";
        this.password = "";
        var ciType = "cmdb_ci_ucs_equipment";
        this.ucsCredentials = this.getApplicativeCredentialsByCiType(ciType);

    },

    /*
     This function performing login to UCS
     and saving the cookie as local member in order to use it for the next commands
     */

    login: function () {

        for (var i=0 ; i < this.ucsCredentials.length; i++) {
            this.userName = this.ucsCredentials[i].userName;
            this.password = this.ucsCredentials[i].password;
            ms.log("UCSRestXmlApiClient: Using credentials, userName: " + this.userName + " password: ********");
            var xmlCommand = "<aaaLogin inName=\"" + this.userName + "\" inPassword=\"" + this.password + "\" />";
            var ucsResponse = this.__sendUcsRequest(xmlCommand);
            if ( ucsResponse.isSuccess ) {
                var GlideXmlUtil = Packages.com.glide.util.XMLUtil;
                var xmlDoc = GlideXmlUtil.parse(ucsResponse.xmlResponse);
                var outCookie = xmlDoc.getDocumentElement().getAttribute("outCookie");
                this.sessionCookie = outCookie;
                return this.sessionCookie;
            }
        }
        ms.log("UCSRestXmlApiClient: Credentials for CI " + ciType + " not found, check the credentials definition ");
        return "CREDENTIALS_NOT_FOUND";
    },

    /**
     This function performing logout from UCS in order to inform that current cookie is expired.
     */

    logout: function () {
        var xmlCommand = "<aaaLogout inCookie=\"<real_cookie>\" />";
        var ucsResponse = this.__sendUcsRequest(xmlCommand);
        if (ucsResponse.isSuccess) {
            return ucsResponse.xmlResponse;
        } else {
            ms.log(ucsResponse.xmlResponse);
            return "COMMAND_FAILED";
        }
    },

    /**
     This function performing any UCS commands in valid XML format.
     each command should arrive with place holder <real_cookie> in order to change it to the current cookie
     */
    sendCommand: function(xmlCommand) {
        var ucsResponse  = this.__sendUcsRequest(xmlCommand);
        if (ucsResponse.isSuccess) {
            return ucsResponse.xmlResponse;
        } else {
            ms.log(ucsResponse.xmlResponse);
            return "COMMAND_FAILED";
        }
    },

    /*
     This is the private and core fucntion that called by other functions in order to perform
     UCS commands.

     Example of input command:
     <configResolveClass cookie="<real_cookie>" inHierarchical="false" classId="equipmentChassis"/>

     input: xmlCommand

     Json object that represent the status of the performed command.
     In case of success the isSuccess is true and xmlResponse contains the xml response
     In case od fail the isSuccess is false and xmlResponse contains the xml error response
     output: result: { isSuccess , xmlResponse }

     */
    __sendUcsRequest: function (xmlCommand) {
        var COOKIE_PLACE_HOLDER = "<real_cookie>";

        if ((xmlCommand.indexOf(COOKIE_PLACE_HOLDER) > -1) && !JSUtil.nil(this.sessionCookie)) {
            xmlCommand = xmlCommand.replace(COOKIE_PLACE_HOLDER,this.sessionCookie);
        }

        var xmlEntity = new this.StringRequestEntity(xmlCommand, "application/xml", "UTF-8");
        var postMethod = new this.PostMethod("https://" + this.host + "/nuova");
        postMethod.setRequestEntity(xmlEntity);

        var logMessage = "UCSRestXmlApiClient: Sending command to UCS: " + xmlCommand;
        if (logMessage.indexOf('aaaLogin') !== -1)
            logMessage = logMessage.replace(this.password, '********');

        ms.log(logMessage);

        var status = this.httpClient.executeMethod(postMethod);
        var body = postMethod.getResponseBodyAsString();
        postMethod.releaseConnection();
        ms.log("UCSRestXmlApiClient: The UCS response is: " + body);
		
		var hasError = this.__checkForError(body);
		
        var result = {};

        var isSuccess = true;
        if (200 <= status && status <= 202 && !hasError) {

            ms.log("Request successful, status is: " + status);
            if(body.indexOf("<error") >= 0)
                isSuccess = false;
            result = {
                isSuccess: isSuccess,
                xmlResponse: body
            };

        } else {
            isSuccess = false;
            ms.log("Request failed, status is: " + status);
            result = {
                isSuccess: isSuccess,
                xmlResponse: body
            };
        }
        return result;
    },

	__checkForError: function(body) {
		var hasError = body.indexOf('errorCode=') != -1;
		
		if (hasError) {
			if(body.indexOf('errorDescr=') != -1) {
				var patt = new RegExp("errorDescr=\".*?\"");
				var match = patt.exec(body);
				var errorDescription = match[0];
				
				ms.log("Request failed, " + errorDescription);
			}
			else {
				var patt1 = new RegExp("errorCode=\"([0-9]*)\"");
				var match1 = patt1.exec(body);
				var errorCode = match1[1];
				
				ms.log("Request failed, Error Code: " + errorCode);
			}
		}
		return hasError;
	},
	
	/*
     This fucntion providing Applicative credentials by ciType
     input ciType
     output list of credentials
     */
    getApplicativeCredentialsByCiType: function(ciType) {
        var credList = [];
        var CredentialsProviderFactory = Packages.com.snc.commons.credentials.CredentialsProviderFactory;
        var credProvider = CredentialsProviderFactory.getCredentialsProvider();
        var iterator = credProvider.iterator(null, null, null, null);
        while (iterator.hasNext()) {
            var midCred = iterator.next();
            var currentCiType = midCred.getType().getDbString();
            if (JSUtil.nil(currentCiType) || !ciType.equals(currentCiType))
                continue;
            var currentUser = midCred.getUsername();
            var currentPassword = midCred.getPassword();
            credList.push({
                userName : currentUser,
                password : currentPassword
            });
        }

        return credList;
    },

    type: "UCSRestXmlApiClient"
};
