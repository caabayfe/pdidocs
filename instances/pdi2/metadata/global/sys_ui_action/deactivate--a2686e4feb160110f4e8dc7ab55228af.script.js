action.setRedirectURL(current);
gs.info("Deactivating NLU solution: "+current.solution_name+" version: "+current.version);
current.setValue('active', false);
current.update();
