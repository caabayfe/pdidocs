var s =  new GlideappECCQueueProcessor(current);
s.process();

current.state = "processed";
current.processed = gs.nowDateTime();
