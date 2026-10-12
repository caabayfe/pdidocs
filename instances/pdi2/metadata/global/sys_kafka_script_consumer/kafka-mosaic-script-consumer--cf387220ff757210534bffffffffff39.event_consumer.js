 (function process(messages) {
     var PREFIX = "Kafka messages received: ";

    if (messages && messages.length > 0) {
		gs.debug(PREFIX + "total count=" + messages.length);
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            gs.debug(PREFIX + "message: " + (i+1) + ", msgLength=" + (msg.message ? msg.message.length : 0) + ", key=" + msg.key);
        }
    } else {
        gs.debug(PREFIX + "No messages");
    }
     new MosaicKafkaLogProcessor().process(messages);
 })(messages);
