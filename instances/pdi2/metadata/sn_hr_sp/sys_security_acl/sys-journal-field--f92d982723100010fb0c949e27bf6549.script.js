answer = getJournalReadAnswer();

function getJournalReadAnswer() {
    return gs.hasRole('sn_hr_sp.esc_admin');
}
