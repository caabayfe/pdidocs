var ruleUtils = new PlatformDocRuleUtils(current.sys_id);
ruleUtils.refreshApproversAndReviewers();

gs.addInfoMessage(gs.getMessage("Approver and reviewer lists have been refreshed."));
gs.setRedirect(current.getLink(true));
