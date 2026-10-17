function onBefore(current, previous) {
    if (!current.breakdown || current.breakdown == '') {
        current.breakdown = '';
        current.element = '';
        current.breakdown_level2 = '';
        current.element_level2 = '';
        current.any_element = false;
        return;
    }

    var anyElementB2 = (current.breakdown_level2 != '' && current.any_element);
    var anyElementB1 = (!anyElementB2 && current.breakdown != '' && current.any_element);

    if (current.element == '' && anyElementB1)
        current.element = '';
    if (current.element == '' && !anyElementB1) {
        current.element = 'unmatched';
        if (!anyElementB2)
            current.any_element = false;
    }

    if (current.element_level2 == '' && !anyElementB2 && current.breakdown_level2 != '') {
        current.element_level2 = 'unmatched';
        current.any_element = false;
    }
    if (current.element_level2 == '' && anyElementB2)
        current.element_level2 = '';
}
