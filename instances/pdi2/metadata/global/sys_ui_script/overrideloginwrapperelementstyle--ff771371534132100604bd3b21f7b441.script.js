function overridePageResposneButtonStyleForTimingDiv(timingDivSelector) {

    if (timingDivSelector) {
        var timingButton = timingDivSelector.querySelector('button.btn-response-time');

        if (timingButton) {
            timingButton.style.setProperty('color', 'rgb(var(--now-color--neutral-0)', 'important');
        }
    }
}

function matchesExpectedPrimaryColors(element) {
    // '0,128,163' -> Coral
    // '79,82,189' -> Polaris
    var expectedColors = ['0,128,163', '79,82,189'];
    if (!element) return false;

    var computedStyle = window.getComputedStyle(element);
    var primaryColor = computedStyle.getPropertyValue('--now-color--primary-1').trim();

    return expectedColors.includes(primaryColor);
}

function waitForElement(selector, callback, timeout) {
    timeout = timeout || 10000;
    var timeoutId;
    
    var observer = new MutationObserver(function(mutationList, obs) {
        var element = document.querySelector(selector);

        if (element) {
            clearTimeout(timeoutId);
            obs.disconnect();
            callback(element);
        }
    });

    // Check if element already exists
    var existing = document.querySelector(selector);
    if (existing) {
        callback(existing);
        return;
    }

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Set timeout
    timeoutId = setTimeout(function() {
        var elapsed = new Date().getTime() - startTime;
        observer.disconnect();
    }, timeout);
}

if (matchesExpectedPrimaryColors(document.body)) {
    // callback overridePageResposneButtonStyleForTimingDiv if timing div found
    waitForElement('#page_timing_div', function(element) {
        overridePageResposneButtonStyleForTimingDiv(element);
    });
}
