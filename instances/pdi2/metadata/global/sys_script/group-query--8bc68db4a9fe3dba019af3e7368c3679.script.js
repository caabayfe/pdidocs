if (!(gs.hasRole("admin") || gs.hasRole("user_admin")) && gs.getSession().isInteractive()) {
  current.addQuery("active", "true");
}
