/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const words = ["The sky", "above", "the port","was", "the color of television", "tuned", "to", "a dead channel", ".", "All", "this happened", "more or less","." ,"I", "had", "the story", "bit by bit", "from various people", "and", "as generally", "happens", "in such cases", "each time", "it", "was", "a different story","." ,"It", "was", "a pleasure", "to", "burn", "Lorem","Ipsum","is","simply","dummy","text","of","the","printing","and","typesetting","industry.","Lorem","Ipsum","has","been","the","industry's","standard","dummy","text","ever","since","the","1500s,","when","an","unknown","printer","took","a","galley","of","type","and","scrambled","it","to","make","a","type","specimen","book.","It","has","survived","not","only","five","centuries,","but","also","the","leap","into","electronic","typesetting,","remaining","essentially","unchanged.","It","was","popularised","in","the","1960s","with","the","release","of","Letraset","sheets","containing","Lorem","Ipsum","passages,","and","more","recently","with","desktop","publishing","software","like","Aldus","PageMaker","including","versions","of","Lorem","Ipsum"];
    const text = [];
    let x = 1000;
    while(--x) text.push(words[Math.floor(Math.random() * words.length)]);

    const description = text.join(" ");
    const newEvent = {
        id: `event-${Object.values(api.state.timelineEvents).length}`,
        bgColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        group: event.payload.group,
        start: event.payload.newStartMoment.format(api.state.dateTimeFormat),
        end: event.payload.newEndMoment.format(api.state.dateTimeFormat),
        startMS: event.payload.newStartMS,
        endMS: event.payload.newEndMS,
        description,
        title: description.substring(0, 100),
        childEvents: [],
        textColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
		borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
		endUTCOffsetMS: 0,
		startUTCOffsetMS: 0,
		ariaLabel: "This is Custom Aria - Label"
    };

    const newEvents = {...api.state.timelineEvents};
    newEvents[newEvent.id] = newEvent;

    api.setState("timelineEvents", newEvents);
}
