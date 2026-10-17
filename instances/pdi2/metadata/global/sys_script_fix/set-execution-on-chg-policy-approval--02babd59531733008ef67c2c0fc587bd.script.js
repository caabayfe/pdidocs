var chgPolApprGR = new GlideRecord("chg_policy");
chgPolApprGR.addNullQuery("execution");
chgPolApprGR.setValue("execution", "all");
chgPolApprGR.updateMultiple();
