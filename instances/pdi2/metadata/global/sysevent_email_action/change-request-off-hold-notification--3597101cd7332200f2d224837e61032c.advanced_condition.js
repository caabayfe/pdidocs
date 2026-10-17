var cr = new ChangeRequest(current);
answer = previous.on_hold != current.on_hold && (cr.isAssess() || cr.isAuthorize() || cr.isScheduled() || cr.isImplement());
