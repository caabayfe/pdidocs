var profileUserID = current.getValue("user");
answer = profileUserID == gs.getUserID() || new sn_employee.ep_portalUtil(profileUserID).isFieldPublic('preferred_pronoun');
