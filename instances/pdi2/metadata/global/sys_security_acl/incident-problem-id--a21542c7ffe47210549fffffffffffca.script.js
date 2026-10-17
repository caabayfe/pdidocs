// If incident is closed, allow write access to problem_coordinator role only when property problem.role.relate_closed_incidents value is set to problem_coordinator
if (current.state == "7") {
    answer = (gs.getProperty("problem.role.relate_closed_incidents") === "problem_coordinator");
} else {
    answer = true;
}
