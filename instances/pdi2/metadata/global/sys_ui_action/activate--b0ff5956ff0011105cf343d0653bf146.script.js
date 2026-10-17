current.update();
var subscription = new sn_ih_kafka.ETLConsumerSubscription();
subscription.activate(current);
gs.setRedirect("sys_kafka_stream.do?sys_id=" + current.sys_id);
