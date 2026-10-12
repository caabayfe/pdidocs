function scriptedPolicy(args) {	
    var trigger = args.trigger;
    var properties = args.properties;
    var api = args.api;

    //initial state should be readonly for blocksInformation as showBlocksInformation value is false by default.
    api.updateEnabled('blocksInformation', properties.showBlocksInformation);

    if (trigger === 'showBlocksInformation') {
		api.updateEnabled('blocksInformation', properties.showBlocksInformation);
    }
}
