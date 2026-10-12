var answer;
//Do not omit the New button if the user has portfolio_editor role.
if(gs.getUser().hasRole("portfolio_editor")) {
        answer = false;
}
else {
    answer = true;
}
