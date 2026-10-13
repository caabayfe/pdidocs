function onChange(control, oldValue, newValue, isLoading) {
    updateEscalationType(newValue);
}

function updateEscalationType(dutyRotations) {
    var escaltionTypeEl = gel("escalation-type");
    if (dutyRotations == 1)
        getMessage("Rotate by members", function(msg) {
            escaltionTypeEl.innerText = msg;
        });
    else
        getMessage("Rotate by rosters", function(msg) {
            escaltionTypeEl.innerText = msg;
        });
}
