var Statistics = Packages.com.snc.sw.netflow.Statistics;

var AwsFlowLogsConnector = Class.create();
AwsFlowLogsConnector.prototype = {
    initialize: function() {
		this.setparam('group_name', '');
		this.setparam('schedule', '3600');
    },
	
	execute: function() {
		var awsVpclogs = new AwsVpcLogsSdkWrapper();
		
		var stats = new Statistics();
		stats.setParameters(probe.getParameters());
		var i, name, evtMap;
		var startTime = Date.now() - this.schedule * 1000;
		
		// get all regions
		var regions=Packages.com.amazonaws.regions.RegionUtils.getRegions();
		
		//iterate over each region
		for(var j=0;j<regions.size();j++){
			awsVpclogs.setRegion(regions.get(j));
			var logStreams ;
			try{
				// get streams
				 logStreams = awsVpclogs.getStreams(this.group_name);
				if (!logStreams){
					ms.log("no log treams for this region " + regions.get(j));
					continue;
				}
				
			} catch(e){
				
				ms.log ("Error occured when called AWS getStreams: "+e +" for region "+regions.get(j));
				continue;
			}
			
			ms.log("Number of VPC log streams: " + logStreams.size());
			
			// get events for every stream
			for (i=0; i<logStreams.size(); i++) {
				streamName = logStreams.get(i).logStreamName;
				evtMap = awsVpclogs.getEvents(this.group_name, streamName, startTime);
				ms.log("Stream: " + streamName + ". Number of events in the stream: " + evtMap.size()+" for region "+regions.get(j));
				this.addFlows(stats, evtMap);
			}
		}
		
		
		stats.emptyWindow();
		var json = stats.toJson();
		var chunkifator = new NetflowChunkifator();
		var lastChunk = chunkifator.chunkify(json);
		ms.log("after chunkifator.chunkify().");
		return lastChunk;
	},
	
	addFlows: function(stats, evtMap) {
		var NetFlow = Packages.com.snc.sw.netflow.NetFlow;
		var HostPort = Packages.com.snc.sw.dto.HostPort;
		var events = evtMap;
		var j, event, flow, sm;
		for (j=0; j<events.size(); j++) {
			event = events.get(j);
			flow = new NetFlow();
			flow.setTime(event.timestamp);
			if (event.message) {
				sm = event.message.split(" ");
				// Check that flow is tcp and is not rejected. 
				// See protocol numbers here: http://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml				
				// ms.log('sm[3] == '+sm[3]+' && sm[7] == '+sm[7]+' && sm[12] == '+ sm[12]);				
				if (sm && sm[7] == "6" && sm[12] == "ACCEPT") {
					flow.setSrc(new HostPort(sm[3], sm[5]));
					flow.setDst(new HostPort(sm[4], sm[6]));
					flow.setPackets(sm[8]);
					flow.setBytes(sm[9]);
					stats.add(flow);
				}
			}
		}
	},	
	
	setparam: function(name, defaultValue) {
        var value = probe.getParameter(name);
        value = value ? value : defaultValue;
        this[name] = value;
    },

    type: 'AwsFlowLogsConnector'
};
