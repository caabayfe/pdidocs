var participantGR = new GlideRecord("notify_participant");
participantGR.addQuery("notify_conference_call", current.notify_conference_call);
participantGR.addQuery("user", gs.getUserID());
participantGR.query();
answer = participantGR.next();
