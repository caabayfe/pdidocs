function link() {
      var geckoRegex = /Gecko\/\d+/; // Remove forced-colors css for Gecko engine (Firefox) as they already handle it
      if (geckoRegex.test(navigator.userAgent)) {
        $('.sp-search-heading').removeClass('sp-search-heading');
      }
}
