function transform(input) {
    var output = [];
	var service = input.service;
    var inspector = new sn_hermes.HermesTopicInspector();
    var topics = inspector.getAllTopicsForService(service, 'sni');

    if (topics.length > 0) {
        for (i = 0; i < topics.length; i++) {
            var topic = topics[i];
			var name = topic.getName().toString();
			output.push({"topic":name});
        }
    }
    return output;
}
