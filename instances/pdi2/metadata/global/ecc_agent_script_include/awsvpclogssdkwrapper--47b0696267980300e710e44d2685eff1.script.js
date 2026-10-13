var Config = Packages.com.service_now.mid.services.Config;
var MIDConfigParameter = Packages.com.snc.commons.MIDConfigParameter;

var AwsVpcLogsSdkWrapper = Class.create();
var logsClient;

AwsVpcLogsSdkWrapper.prototype = {
	initialize: function() {
		var aws_credentials = probe.getParameter("aws_credentials");
		if (aws_credentials) {
			var credProvider = Packages.com.snc.commons.credentials.CredentialsProviderFactory.getCredentialsProvider();
			var standardCred = credProvider.getCredentialByID(aws_credentials);
			var accessKey = standardCred.getAttribute("access_key");
			var secretKey =  standardCred.getAttribute("secret_key");		
			var basicAwsCred = new Packages.com.amazonaws.auth.BasicAWSCredentials(accessKey, secretKey);
			logsClient = new Packages.com.amazonaws.services.logs.AWSLogsClient(basicAwsCred);
		} else { // fallback to preconfigured AWS credentials for AWS CLI
			logsClient = new Packages.com.amazonaws.services.logs.AWSLogsClient();
		}
	},
	setRegion:function(region){
		logsClient.setRegion(region);
	},
	
	getStreams: function(logGroupName) {
		//ms.log("Inside getStreams(). logGroupName=" + logGroupName);
     
		var request = new Packages.com.amazonaws.services.logs.model.DescribeLogStreamsRequest(logGroupName);
		var describeLogStreamsResult = logsClient.describeLogStreams(request);
		//ms.log("describeLogStreamsResult=" + describeLogStreamsResult);
		return describeLogStreamsResult.getLogStreams();
	},	
	
	getEvents: function(logGroupName, logStreamName, startTime) {
		//ms.log("Inside getEvents(). logGroupName=" + logGroupName  + ", logStreamName: " + logStreamName);
		
		var request = new Packages.com.amazonaws.services.logs.model.GetLogEventsRequest(logGroupName, logStreamName);
		request.setStartTime(startTime);
		var getLogEventsResult = logsClient.getLogEvents(request);
		//ms.log("getLogEventsResult=" + getLogEventsResult);
		return getLogEventsResult.getEvents();
	},	
		
		type: 'AwsVpcLogsSdkWrapper'
	};
	
