/**
 * This is the default escalation handler for on-call rotation escalations
 *
 * When it is called, the following variables are available:
 *
 *    current - the document that is associated with the escalation (such as an incident)
 *    escalation - the escalation record
 */

gs.include("OnCallRotation");

var eventName = escalation.event_name;
var rota = new OnCallRotation();

rota.whoIsNext(escalation);
while (rota.next()) {
   // Generate an event for each pending escalation
   if (rota.getType() == "device") {
      // Device notification
      gs.eventQueue(eventName + ".device", current, rota.getDevice(), rota.getPrimaryUser());
      gs.print("Generated Group Device Event for: " + rota.getDevice());
   } else {
      // User notification
      gs.eventQueue(eventName + ".user", current, rota.getUser(), rota.getUserName());
      gs.print("Generated User Event for: " + rota.getUserName());
   }
   rota.addCurrentToNotified();
}
rota.continueEscalations(escalation);
