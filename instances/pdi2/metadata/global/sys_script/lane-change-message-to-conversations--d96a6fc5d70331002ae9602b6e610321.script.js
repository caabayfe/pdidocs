(function onAfter(current, previous) {
    var additionalInfo = {
        userId: gs.getUserID()
    };

    if (current.getValue("lane") != previous.getValue("lane")) {
        additionalInfo.previousLaneName = previous.getDisplayValue('lane');
        additionalInfo.laneType = 'lane';
        gs.eventQueue('vtb_card.send.laneupdate', current, JSON.stringify(additionalInfo));
    }


    if (current.getValue("swim_lane") != previous.getValue("swim_lane")) {
		additionalInfo.previousLaneName = previous.getDisplayValue('swim_lane');
        additionalInfo.laneType = 'swim_lane';
        gs.eventQueue('vtb_card.send.laneupdate', current, JSON.stringify(additionalInfo));
    }

})(current, previous);
