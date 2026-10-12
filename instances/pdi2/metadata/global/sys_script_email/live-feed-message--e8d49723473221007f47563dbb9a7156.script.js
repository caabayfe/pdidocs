var liveFeedApi = new SNC.LiveFeedApi();

var message = liveFeedApi.formatMessage(current.message, 'TEXT');
template.print(message);
