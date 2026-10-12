// insert is handled by async business rule; yes this sucks, but there's a race condition otherwise...

var refresh = false;
var currentState = current.state;
var previousState = previous ? previous.state : "";

if ("update" != current.operation() || currentState != previousState)
  refresh = true;

if (refresh) 
  new InstanceCloneScheduler().scheduleNotifyServer(current);
