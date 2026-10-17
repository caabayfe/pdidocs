function link(scope, element, attrs, controller) {

    var currentLI = 0;
    $(document).ready(function() {
        $(element).on("keypress", "div#uploadBanner", function(e) {
            e.preventDefault();
            $("#uploadBanner").blur();
            resetLiIndex();
            var listItems = document.querySelectorAll("li.li-upload");
            if (listItems.length > 0) {
                setLiElementOnFocus(listItems, currentLI);
            }
        });
        $(document).bind('click', function(event) {
            var listItems = document.querySelectorAll("li.li-upload");
            var uploadBanner = document.getElementById('uploadBanner');
            if (uploadBanner && !uploadBanner.contains(event.target) && listItems.length > 0) {
                resetLiIndex();
                controller.closePopUp();
            } else if (uploadBanner && uploadBanner.contains(event.target)) {
                resetLiIndex();
            }
        });
        document.addEventListener("keydown", function(event) {
            var listItems = document.querySelectorAll("li.li-upload");
            if (listItems.length > 0) {

                switch (event.keyCode) {
                    case 38: //up arrow key
                        event.preventDefault();
                        blurLiElement(listItems, currentLI);
                        currentLI = currentLI > 0 ? --currentLI : 0;
                        setLiElementOnFocus(listItems, currentLI);
                        break;
                    case 40: //down arrow key
                        event.preventDefault();
                        blurLiElement(listItems, currentLI);
                        currentLI = currentLI < listItems.length - 1 ? ++currentLI : listItems.length - 1;
                        setLiElementOnFocus(listItems, currentLI);
                        break;
                    case 13: //enter key
                        break;
                    case 32: //space key
                        event.preventDefault();
                        break;
                    case 27: //esc key, for the upload banner pop up to close
                        setBannerFocus(listItems, currentLI);
                        break;
                    default:
                        blurLiElement(listItems, currentLI);
                        resetLiIndex();
                }
            }
        });
    });

    function resetLiIndex() {
        currentLI = 0;
    }

    function blurLiElement(liItems, index) {
        liItems[index].classList.remove("highlight");
        liItems[index].blur();
    }

    function setLiElementOnFocus(liItems, index) {
        liItems[index].classList.add("highlight");
        var liItem = $('#upload-remove-banner').find("li.li-upload.highlight");
        liItem.focus();
    }

    function setBannerFocus(liItems, index) {
        blurLiElement(liItems, index);
        resetLiIndex();
        $("#uploadBanner").focus();
        $("#uploadBanner").click();
    }
}
