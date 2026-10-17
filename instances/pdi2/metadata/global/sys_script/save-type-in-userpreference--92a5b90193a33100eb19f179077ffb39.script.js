function onAfter(current, previous) {
   gs.getSession().getUser().setPreference('alert_rule.type', current.type); 
}
