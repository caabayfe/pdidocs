if (current.read_roles.nil()) {
  answer = true;
} else if (gs.hasRole("maint")) {
  answer = true;
} else {
  answer = gs.hasRole(current.read_roles);
}
