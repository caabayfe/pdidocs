answer = false;
if (gs.getUserID() == current.user) {
  answer = true;
} else if (gs.hasRole("maint")) {
  answer = true;
} else if (current.roles) {
  answer = gs.hasRole(current.roles);
}
