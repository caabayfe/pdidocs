(function executeRule(current, previous /*null when async*/ ) {
    var className = current.getRecordClassName();
    switch (className) {
        case "sys_sg_item_section":
            verifyItemSectionCard(current);
            break;
        case "sys_sg_chart_section":
            verifyChartSectionCard(current);
            break;
    }
})(current, previous);

function verifyItemSectionCard(current) {
    if (current.is_custom_size)
        verifyCustomCardSize(current);
    else
        verifyStandardCardSize(current);
}

function verifyChartSectionCard(current) {
    if (current.is_custom_size)
        verifyCustomCardSizeLimits(current);
}

function verifyStandardCardSize(current) {
    if (current.custom_width != 0 || current.custom_height != 0) {
        gs.addErrorMessage(gs.getMessage('Custom size cannot be defined when not in custom mode.'));
        current.setAbortAction(true);
    }
}


function verifyCustomCardSize(current) {
    if (current.card_size) {
        gs.addErrorMessage(gs.getMessage('Card size must not be set when in custom mode.'));
        current.setAbortAction(true);
    }
    if (current.orientation == "vertical" && current.custom_width != 0) {
        gs.addErrorMessage(gs.getMessage('Vertical section must not contain custom width.'));
        current.setAbortAction(true);
    }
    verifyCustomCardSizeLimits(current);
}

function verifyCustomCardSizeLimits(current) {
    var CARD_SIZE_MIN_HEIGHT = 42;
    var CARD_SIZE_MAX_HEIGHT = 296;
    var CARD_SIZE_MIN_WIDTH = 64;
    var CARD_SIZE_MAX_WIDTH = 304;

    verifyHeightLimits(current, CARD_SIZE_MIN_HEIGHT, CARD_SIZE_MAX_HEIGHT);
    if (current.orientation == "vertical")
        return;

    vereifyWidthLimits(current, CARD_SIZE_MIN_WIDTH, CARD_SIZE_MAX_WIDTH);
}

function verifyHeightLimits(current, min, max) {
    if (current.custom_height == 0) {
        gs.addErrorMessage(gs.getMessage('Custom height value was not set.'));
        current.setAbortAction(true);
    } else if (current.custom_height < min) {
        gs.addErrorMessage(gs.getMessage('Custom height value smaller than min value ({0}).', min));
        current.setAbortAction(true);
    } else if (current.custom_height > max) {
        gs.addErrorMessage(gs.getMessage('Custom height value greater than max value ({0}).', max));
        current.setAbortAction(true);
    }
}

function vereifyWidthLimits(current, min, max) {
    if (current.custom_width == 0) {
        gs.addErrorMessage(gs.getMessage('Custom width value was not set.'));
        current.setAbortAction(true);
    } else if (current.custom_width < min) {
        gs.addErrorMessage(gs.getMessage('Custom width value smaller than min value ({0}).', min));
        current.setAbortAction(true);
    } else if (current.custom_width > max) {
        gs.addErrorMessage(gs.getMessage('Custom width value greater than max value ({0}).', max));
        current.setAbortAction(true);
    }
}
