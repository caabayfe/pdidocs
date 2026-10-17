var RequestAuthSampleMidCustomSigner = Class.create();
RequestAuthSampleMidCustomSigner.prototype = Object.extend(new RequestAuthInternal(), {
     
    initialize:function() {
		RequestAuthInternal.prototype.initialize.call(this);
    },
    
	/*Override generateAuth if you are writing your own custom signer.
	* It is a sample method to understand how to sign using custom authenticator.
	*/
	generateAuth: function(requestAuthenticator) {
		
		//read the request data into instance variables
		this.enableDebug(true);
		this.readRequestData(requestAuthenticator);
		
		//sign the data
		var signature = this.generateSignature();
        var authorizationValue = this.KEY_TYPE + " " + this.accountName + ":" + signature;
		
		var httpRequestSignedData = new Packages.com.snc.core_automation_common.auth.HttpRequestAuthedData();
        httpRequestSignedData.addHeader( "Authorization", authorizationValue);
        httpRequestSignedData.setStatus("SUCCESS"); //available status values :SUCCESS, FAIL, SKIPPED;
        httpRequestSignedData.setDirective("HEADER"); //use "QUERY" if signed data needs to be sent in query parameters
        return httpRequestSignedData;
	},
	
	getStringToSign: function() {
        var stringToSign = "";
		
		var headers = this.getObjectFromMap(this.headerMap);
		var headerKeys =  Object.keys(headers);
		var headerValue;
		
		headerKeys.forEach(function(key) {
            headerValue = headers[key];
			if(headerValue){
				stringToSign += key+":"+headerValue+ "\n"; //"\n" is random terminal
				if(this.debugMode)
					ms.log("Header Key:"+key+" Value:"+headerValue);
			}
        }.bind(this));
		
		var queryParams = this.getObjectFromMap(this.queryParamMap);
		var qpKeys = Object.keys(queryParams);
		var qpValue;
		
		qpKeys.forEach(function(key) {
            qpValue = queryParams[key];
			if(qpValue){
				stringToSign += key+":"+qpValue+ "\n"; //"\n" is random terminal
		
				if(this.debugMode)	
					ms.log("Request Param Key:"+key+" Value:"+qpValue);
			}
        }.bind(this));
		
		if(this.debugMode)
			ms.log("String to Sign:"+stringToSign);
			
        return stringToSign;
    },
	
	generateSignature: function() {
        var Mac = Packages.javax.crypto.Mac;
        var SecretKeySpec = Packages.javax.crypto.spec.SecretKeySpec;
        var StringUtil = Packages.com.glide.util.StringUtil;
        var JavaString = Packages.java.lang.String;
        
        var algorithm = "HmacSHA256";
        var dataToSign = new JavaString(this.getStringToSign());
        
        var mac = Mac.getInstance("HmacSHA256");
        var secretKey = new SecretKeySpec(StringUtil.base64DecodeAsBytes(this.secretKey), "HmacSHA256");
        mac.init(secretKey);
        return StringUtil.base64Encode(mac.doFinal(dataToSign.getBytes("UTF-8")));
    },
    
	/*read request data into instance variables.
	* It is a sample method to understand how to read request data
	*/
	readRequestData: function(requestAuthenticator){
		var requestData = requestAuthenticator.getHttpRequestData();
        this.endpoint = requestData.getEndpoint();
        this.method = requestData.getHttpMethod().toUpperCase();
        this.path = this.getPathFromEndpointURL();
		
		if(this.debugMode){
			ms.log("Method:"+this.method+" Endpoint:"+this.endpoint);
		}
	
        this.queryParamMap = requestData.getQueryParamMap();
		
		this.headerMap = requestData.getHeaderMap();
		
        this.payload = requestData.getContent();
		
		this.reqData = requestAuthenticator.getHttpRequestData();
        // get credential fields if needed, these attributes are different based on credential type
        var credential = requestAuthenticator.getRequestAuthCredential();
		//this.accountName = credential.getAttribute("access_key");
        //this.consumer_key = credential.getAttribute("consumer_key");
       // this.access_token = credential.getAttribute("access_token");
       // this.access_token_secret = credential.getAttribute("access_token_secret");
	},
    
    getObjectFromMap: function(map) {
        var myObj = {};
        var iterator = map.keySet().iterator();
        while (iterator.hasNext()){
            var key = iterator.next();
            myObj[key.toLowerCase()] = map.get(key);
        }
        return myObj;
    },
	
	debugMode : false,
	
	enableDebug: function(flag) {
		this.debugMode = flag;
	},
	
	type: 'RequestAuthSampleMidCustomSigner'
    
    
});
