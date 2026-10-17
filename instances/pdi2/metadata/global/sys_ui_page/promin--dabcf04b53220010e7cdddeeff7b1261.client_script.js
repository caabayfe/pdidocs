var projectDefId, versionId, miningState, watchList, progressViewer, executionId, errorHeaderMessage, standardErrorMessage = getMessage("Error while generating process model. Please contact system administrator.");


var uuid = document.getElementById("uuid").value;
var date = document.getElementById("date").value;
var source = document.getElementById("source").value;
var flag = true;
var slides = 3;
var currentIndex = 0;
var displayErrorMessage;
var ga = new GlideAjax('sn_po_demo_data.PODemoData'); //Check for po-demo-data to redirect user to PO project 
ga.addParam('sysparm_name', 'getLinkedPOProject');
ga.addParam('sysparm_uuid', uuid);
ga.getXML(isIndicatorLinkedWithProject);

function isIndicatorLinkedWithProject(response) {
    response = response.responseXML.documentElement.getAttribute("answer");
    if (response != "" && response != null) {
        window.location.replace("/now/experience/promin/process-details/" + response);
    }
}

ga = new GlideAjax('ProminPAUtil');
ga.addParam('sysparm_name', 'isFormulaIndicator');
ga.addParam('sysparm_uuid', uuid);
ga.addParam('sysparm_source', source);
ga.getXML(isFormulaIndicatorResponse);

function isFormulaIndicatorResponse(response) {
    response = response.responseXML.documentElement.getAttribute("answer");
    response = JSON.parse(response);

    if (response.status == "error") {
        setError({
                errorMessage: response.errorMessage,
                header: ''
            });
    } else if (response.status == "success") {
        var formulaIndicatorResponse = response.isFormulaIndicatorResponse;
        if (formulaIndicatorResponse.isFreemium) {
            launchWorkbench(formulaIndicatorResponse.indicatorUuid, date, source);
        } else if (formulaIndicatorResponse.isFormula) {
            var indicatorList = formulaIndicatorResponse.indicatorList;
            if (indicatorList.length > 0) {
                var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
                var dialog = new dialogClass('promin_select_indicator');
                dialog.setTitle(getMessage("Select contributing indicator"));
                dialog.setPreference('date', date);
                dialog.setPreference('source', source);
                dialog.setPreference('formulaIndicatorName', formulaIndicatorResponse.formulaIndicatorName);
                dialog.setPreference("indicatorList", JSON.stringify(indicatorList));
                dialog.setBackdropStatic(true);
                dialog.render();
            } else {
                setError({
                    errorMessage: getMessage("Could not find contributing indicators for the selected formula indicator. Please contact system administrator."),
                    header: ''
                });
            }
        } else {
            launchWorkbench(uuid, date, source);
        }
    }
}

function setError(response) {
    if (typeof(response.errorMessage) != "string") {
        displayErrorMessage = standardErrorMessage;
    } else {
        displayErrorMessage = response.errorMessage;
        errorHeaderMessage = response.header;
    }
    miningState = "ERROR";
    showMiningProgress("ERROR");
}

function launchWorkbench(uuid, date, source) {
    var ga = new GlideAjax('ProminPAUtil');
    ga.addParam('sysparm_name', 'launchPOWorkbench');
    ga.addParam('sysparm_uuid', uuid);
    ga.addParam('sysparm_date', date);
    ga.addParam('sysparm_source', source);
    ga.getXML(responseForScheduleMining);

    function responseForScheduleMining(response) {
        response = response.responseXML.documentElement.getAttribute("answer");
        response = JSON.parse(response);
        if (response.status == "error") {
            setError(response);
        } else if (response.status == "success") {
            var scheduleResponse = response.scheduleResponse;
            projectDefId = scheduleResponse.projectDefId;
            versionId = scheduleResponse.versionId;
            watchList = scheduleResponse.watchList;
            miningState = scheduleResponse.miningState;
            executionId = scheduleResponse.executionId;
            if (miningState === "AVAILABLE") {
                showMiningProgress(miningState);
            } else {
                showMiningProgress();
            }
        }
    }
}

function escapeHTML(unsafeText) {
    var div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML;
}

function showMiningProgress(miningState) {
    if (miningState == "ERROR" || executionId != undefined || executionId != null && executionId.length >= 32) {
        var map = getMessages(["Progress", "Process Mining", "Cancel", "Notify Me", "Close"]);
        progressViewer = new GlideModal("simple_progress_viewer", true, "40em", "10em");
        progressViewer.setTitle(getMessage("Getting started with Process Mining"));
        progressViewer.setPreference("sysparm_renderer_execution_id", executionId);
        progressViewer.setPreference("sysparm_renderer_progress_title", map["Process Mining"]);
        progressViewer.on("executionComplete", function(trackerObj) {
            if (trackerObj.state == 2 || miningState == 'AVAILABLE') {
                getCarouselContent();
                if (miningState == "AVAILABLE") {
                    document.getElementById('closeBtn').style.display = "inline-block";
                    document.getElementById('workbench').style.display = "inline-block";
                    document.getElementById("workbench").focus();
                } else {
                    executionCompleted(trackerObj.state);
                }
            } else if (trackerObj.state == 3 || trackerObj.state == 4) {
                getCarouselContent();
                var failedMessageFirstLine = "Mining failed. Please contact your system/process administrator or ServiceNow support, or try again later.";
                document.getElementById('miningError').innerHTML = (trackerObj.state == 3) ?
                    ("<p><b>" + escapeHTML(failedMessageFirstLine) + "</b></p><p>" + escapeHTML(trackerObj.message) + "</p>") :
                    trackerObj.message;
                executionCompleted(trackerObj.state);
            }
        });
        progressViewer.on("renderStatus", function(trackerObj) {
            if (miningState !== "AVAILABLE") {
                document.getElementById('container').style.display = "block";
            }
            if (flag) {
                getCarouselContent();
            }

            var cancelBtn = $("sysparm_button_cancel");
            if (cancelBtn)
                return;

            var notifyBtn = $("sysparm_button_notify");

            var buttonPanel = getButtonPanel();
            var miningErrorCell = buttonPanel.firstChild;
            var buttonCell = buttonPanel.firstChild.nextSibling;
            miningError = new Element("p");
            miningError.id = "miningError";
            miningError.style.textAlign = "left";
            miningError.style.margin = "0";
            miningErrorCell.appendChild(miningError);

            cancelBtn = new Element("button");
            cancelBtn.id = "sysparm_button_cancel";
            cancelBtn.type = "button";
            miningError.style.padding = "var(--now-global-space--md)";
            cancelBtn.innerHTML = map["Cancel"];
            cancelBtn.onclick = function() {
                cancelMiningProcess();
                jQuery('#sysparm_button_cancel').hide();
                jQuery('#sysparm_button_notify').hide();
            };
            buttonCell.appendChild(cancelBtn);
            if (watchList.indexOf(g_user.userID) < 0) {
                notifyBtn = new Element("button");
                notifyBtn.id = "sysparm_button_notify";
                notifyBtn.type = "button";
                notifyBtn.innerHTML = getMessage("Notify me");
                notifyBtn.style.marginLeft = "var(--now-global-space--md)";
                notifyBtn.onclick = function() {
                    addUserToWatchList(function() {
                        notifyBtn.disabled = true;
                        alert(getMessage("You'll receive an email notifying you of the final extraction status."));
                    });
                };
                buttonCell.appendChild(notifyBtn);
            }
        });
        progressViewer.render();

        if (miningState == "ERROR") {
            var myTimeout = setTimeout(function() {
                getCarouselContent();
                document.getElementById('closeBtn').style.display = "inline-block";
                document.getElementById('miningError').style.display = "block";
                document.getElementById('miningError').innerHTML = escapeHTML(errorHeaderMessage) ? ("<b>" + escapeHTML(errorHeaderMessage) + "</b><p>" + escapeHTML(displayErrorMessage) + "</p>") : escapeHTML(displayErrorMessage);
            }, 1000);
        }
    } else {
        setError({
            errorMessage: getMessage('Could not find running job for process model. Please contact system administrator.'),
            header: ''
        });
    }
}

function executionCompleted(state) {
    var buttonPanel = getButtonPanel();

    var closeBtn = new Element("button");
    closeBtn.id = "closeBtn";
    closeBtn.type = "button";
    closeBtn.innerHTML = "Close";
    closeBtn.onclick = function() {
        window.close();
    };
    buttonPanel.appendChild(closeBtn);

    if (state == 2) {
        var workbenchBtn = new Element("button");
        workbenchBtn.id = "sysparm_button_workbench";
        workbenchBtn.type = "button";
        workbenchBtn.innerHTML = "Open in workbench";
        workbenchBtn.onclick = function() {
            redirectToWorkBench();
        };
        buttonPanel.appendChild(workbenchBtn);
    }

    jQuery('#sysparm_button_cancel').hide();
    jQuery('#sysparm_button_notify').hide();
}

function redirectToWorkBench() {
    window.location.replace("/now/experience/promin/process-details/" + versionId);
}

function cancelMiningProcess() {
    var ga = new GlideAjax('global.ProminUtilsAJAX');
    ga.addParam('sysparm_name', 'cancelMining');
    ga.addParam('sysparm_versionId', versionId);
    ga.getXML();
}

function addUserToWatchList(callbackFn) {
    var gaNotify = new GlideAjax('global.ProminUtilsAJAX');
    gaNotify.addParam('sysparm_name', 'addUserToWatchList');
    gaNotify.addParam('sysparm_projectDefId', projectDefId);
    gaNotify.getXML(confirmUserAddParse);

    function confirmUserAddParse(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer == "true") {
            callbackFn();
        } else
            alert(getMessage("Cannot add you to the watch list"));
    }
}

function getButtonPanel() {
    var buttonsPanel = $("container");
    if (!buttonsPanel)
        return;

    var table = new Element("table", {
        cellpadding: 0,
        cellspacing: 0,
        width: "100%"
    });
    var buttonsCell = table.appendChild(new Element("tr"));
    buttonsCell.appendChild(new Element("td"));
    buttonsCell.appendChild(new Element("td"));
    buttonsCell.align = "right";
    buttonsPanel.appendChild(table);
    return buttonsCell;
}

function getCarouselContent() {
    flag = false;
    var carouselContainer = $("buttonsPanel");
    if (!carouselContainer)
        return;

    carouselContainer.style.padding = "var(--now-global-space--sm) var(--now-global-space--lg) 0 var(--now-global-space--lg)";
    var carousel = new Element("div");
    carousel.classList.add("carousel");
    var container = new Element("div");
    container.classList.add("carousel-container");
    var slideContainer = new Element("div", {
        width: "100%",
        height: "100%",
    });
    var slide1 = new Element("div");
    slide1.classList.add("carousel-item");
    var slide2 = new Element("div");
    slide2.classList.add("carousel-item");
    var introVideoIframe = new Element("iframe", {
        width: "100%",
        height: "340",
        allowfullscreen: "true",
        webkitallowfullscreen: "true",
        mozallowfullscreen: "true",
        title: getMessage("Process mining introduction")
    });
    introVideoIframe.src = '//players.brightcove.net/6274575390001/nUx4EKfUz_default/index.html?videoId=6350985192112';

    var slide3 = new Element("div");
    var images = ["icon-help", "icon-book-open", "icon-lightbulb"];
    var titles = [getMessage("FAQs"), getMessage("Process Mining Academy"), getMessage("Use Cases")];
    var descriptions = [getMessage("Get answer to common Process Mining questions"), getMessage("Series of recorded session focused on different aspects of Process Mining solution"), getMessage("Get inspired with these short videos that cover how to use Process Mining to do SLA breach analysis, Multi-hop analysis, Channel analysis and more")];
    slide3.classList.add("card-list", "carousel-item");
    for (i = 0; i < slides; i++) {
        var card = new Element("div");
        card.classList.add("card", i);
        var cardImage = new Element("div");
        cardImage.classList.add("card_image");
        var image = new Element("span");
        image.classList.add(images[i]);
        var cardContent = new Element("div");
        cardContent.classList.add("card_content", "title-black");
        var cardTitleContainer = new Element("div");
        cardTitleContainer.classList.add("card_title_container");
        var link = new Element("span");
        link.classList.add("link_image", i, "icon-open-document-new-tab");
        var cardTitle = new Element("p");
        cardTitle.innerHTML = titles[i];
        cardTitle.classList.add("card_title");
        var cardDescription = new Element("p");
        cardDescription.innerHTML = descriptions[i];
        cardDescription.classList.add("card_description");
        card.appendChild(cardImage);
        cardImage.appendChild(image);
        card.appendChild(cardContent);
        cardContent.appendChild(cardTitleContainer);
        cardTitleContainer.appendChild(cardTitle);
        cardTitleContainer.appendChild(link);
        cardContent.appendChild(cardDescription);
        slide3.appendChild(card);
    }
    var demoVideoImg = new Element("img", {
        width: "100%",
        height: "340",
    });
    demoVideoImg.alt = getMessage("Process mining demo");
    var imageContentContainer = new Element("div");
    imageContentContainer.classList.add('image-content-container');
    var imageHeading = new Element("p");
    imageHeading.innerHTML = getMessage("Process mining for the modern enterprise");
    imageHeading.id = 'image-heading';
    var imageContent = new Element("p");
    imageContent.id = 'image-content';
    imageContent.innerHTML = getMessage("Uncovering process bottlenecks and identifying process improvement and automation opportunities on the fly.");
    var imageBtn = new Element("button");
    imageBtn.id = 'image-button';
    imageBtn.innerHTML = "View demo";
    imageContentContainer.appendChild(imageHeading);
    imageContentContainer.appendChild(imageContent);
    imageContentContainer.appendChild(imageBtn);
    demoVideoImg.src = "process-mining-banner.png";

    var workbenchButton = new Element("button");
    workbenchButton.innerHTML = getMessage("Open in workbench");
    workbenchButton.id = "workbench";
    workbenchButton.style.display = "none";

    var closeButton = new Element("button");
    closeButton.innerHTML = getMessage("Close");
    closeButton.id = "closeBtn";
    closeButton.style.display = "none";

    var miningError = new Element("p");
    miningError.id = "miningError";
    miningError.style.textAlign = "left";
    miningError.style.display = "none";

    var nextSlide = new Element("button");
    nextSlide.id = "nextSlide";
    nextSlide.ariaLabel = getMessage("Next slide");
    nextSlide.classList.add('slide_button');
    var iconNext = new Element("span");
    iconNext.classList.add('arrow-next');
    nextSlide.appendChild(iconNext);

    var prevSlide = new Element("button");
    prevSlide.id = "prevSlide";
    prevSlide.ariaLabel = getMessage("Previous slide");
    prevSlide.classList.add('slide_button');
    var iconPrev = new Element("span");
    iconPrev.classList.add('arrow-prev');
    prevSlide.appendChild(iconPrev);
    var dotsContainer = new Element("div");
    dotsContainer.classList.add("dots_container");
    dotsContainer.id = "indicator";

    for (var j = 0; j < 3; j++) {
        dotsContainer.innerHTML += "<div class='dots'></div>";
    }
    carousel.appendChild(container);
    container.appendChild(slideContainer);
    slideContainer.appendChild(slide1);
    slideContainer.appendChild(nextSlide);
    slideContainer.appendChild(prevSlide);
    slide1.appendChild(introVideoIframe);
    container.appendChild(slide2);
    slide2.appendChild(demoVideoImg);
    slide2.appendChild(imageContentContainer);
    container.appendChild(slide3);


    carousel.appendChild(dotsContainer);
    carousel.appendChild(workbenchButton);
    carousel.appendChild(miningError);
    carousel.appendChild(closeButton);

    function setButtonTitle(currentIndex) {
        if (currentIndex == 0) {
            document.getElementById('simple_progress_viewer_title').innerHTML = getMessage("Getting started with Process Mining");
        }
        if (currentIndex == 1) {
            document.getElementById('simple_progress_viewer_title').innerHTML = getMessage("Process Mining demo");
        }
        if (currentIndex == 2) {
            document.getElementById('simple_progress_viewer_title').innerHTML = getMessage("Learn more");
        }
    }

    function showSlide(index) {
        currentIndex = index;
        for (var j = 0; j < slides; j++) {
            dots[j].style.background = "#FFFFFF";
        }
        dots[index].style.background = "RGB(var(--now-button--primary--background-color, var(--now-color--primary-1, 30, 133, 109)))";
        // Hide all carousel items
        carouselItems.forEach(function(item) {
            item.style.display = 'none';
        });
        // Show the slide at the specified index
        carouselItems[index].style.display = index == 2 ? 'flex' : 'block';
        setButtonTitle(index);
    }

    function nextSlides() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        setButtonTitle(currentIndex);
        showSlide(currentIndex);
    }

    function previousSlide() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        setButtonTitle(currentIndex);
        showSlide(currentIndex);
    }

    carouselContainer.appendChild(carousel);
    var carouselItems = document.querySelectorAll('.carousel-item');
    var cards = document.querySelectorAll('.card');
    var dots = document.getElementsByClassName("dots");
    var cardLinks = ["https://www.servicenow.com/community/process-mining-article/servicenow-process-mining-formerly-process-optimization-faq/ta-p/2309083", "https://www.servicenow.com/community/process-mining-blog/process-mining-academy/ba-p/2339885", "https://www.servicenow.com/community/process-mining-blog/process-mining-use-case-series/ba-p/2459329"];
    dots[0].style.background = "RGB(var(--now-button--primary--background-color, var(--now-color--primary-1, 30, 133, 109)))";
    for (i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function(e) {
            var index = e.currentTarget.className.split(" ")[1];
            window.open(cardLinks[index], '_blank').focus();
        });
    }
    for (var i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', showSlide.bind(null, i));
    }
    document.getElementById('nextSlide').addEventListener('click', nextSlides);
    document.getElementById('prevSlide').addEventListener('click', previousSlide);
    document.getElementById('workbench').addEventListener('click', function(e) {
        redirectToWorkBench();
    });

    document.getElementById('closeBtn').addEventListener('click', function(e) {
        window.close();
    });
    document.getElementById('image-button').addEventListener('click', function(e) {
        window.open("https://www.youtube.com/watch?v=BF4MVJeV7Xw", '_blank').focus();
    });
    setButtonTitle(currentIndex);
    showSlide(currentIndex);

}
