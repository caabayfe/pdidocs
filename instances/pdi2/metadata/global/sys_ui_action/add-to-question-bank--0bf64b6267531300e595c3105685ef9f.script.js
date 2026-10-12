var result = new AssessmentUtils().processBankAction("add_category_to_bank", [current.getUniqueValue()]);
if (result)
    gs.addInfoMessage(result.msg);
action.setRedirectURL(current);
