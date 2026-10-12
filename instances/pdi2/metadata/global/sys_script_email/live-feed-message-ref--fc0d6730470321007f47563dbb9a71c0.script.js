var liveFeedApi = new SNC.LiveFeedApi();

 var message = liveFeedApi.formatMessage(current.message.message, 'TEXT');

 template.print(message);
