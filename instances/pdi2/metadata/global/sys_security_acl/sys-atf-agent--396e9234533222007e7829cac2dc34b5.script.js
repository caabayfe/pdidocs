var isTestAdmin = gs.hasRole("atf_test_admin");
answer = isTestAdmin || (current.user == gs.getUserID());
