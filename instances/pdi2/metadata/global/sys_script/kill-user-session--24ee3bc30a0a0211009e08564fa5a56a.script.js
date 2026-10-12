// kill specific user session
var session = GlideSessions.get().getSession(current.session_id).getHS();
session.setAttribute('locked_out', 'true');
