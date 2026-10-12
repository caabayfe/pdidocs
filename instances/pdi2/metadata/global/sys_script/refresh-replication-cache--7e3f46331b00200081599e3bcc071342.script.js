var refresh = false;
var currentState = current.state;
var previousState = previous ? previous.state : "";
var stateActiveChanged = currentState == "Active" || previousState == "Active";

if ("update" != current.operation()) {
  if (stateActiveChanged)
    refresh = true;
}
else if (currentState != previousState && stateActiveChanged)
  refresh = true;

if (refresh)
  SncReplicationAdvisor.get().refresh();
