function jslog(message, src, dateTime) {
    _notifications_.push({
        type: "jslog",
        message: message,
        src: src,
        dateTime: dateTime
    });
}

csGlobals['jslog'] = jslog;
