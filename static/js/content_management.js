"use strict";

async function loadContentJson() {

    //let fresh_content_url = "http://newsvibe.online/fresh_content"
    let fresh_content_url = "https://newsvibe.online/fresh_content"
	let jsonData = await fetch( fresh_content_url )
	jsonData = await jsonData.json();
    return jsonData;
}

function getTopicIds(contentJson) {
    let allTopicSummaries = contentJson["topic_summaries"];

    let allKeys = Array();
    for (var key in allTopicSummaries) {
        allKeys.push( key );
    }

    let topicIdsDict = {};
    for (let i=0; i < allKeys.length; i++) {
        let topicId = allKeys[i];
        if (topicId.includes( "_" )) {
            let splittedTopicId = topicId.split("_");
            let highTopicId = parseInt(splittedTopicId[0]);
            let lowTopicId = parseInt(splittedTopicId[1]);
            if (!(highTopicId in topicIdsDict)) {
                topicIdsDict[highTopicId] = Array();
            }
            topicIdsDict[highTopicId].push( lowTopicId );
        }
    }

    for (var highTopicId in topicIdsDict) {
        topicIdsDict[highTopicId] = topicIdsDict[highTopicId].sort(function(a, b) {return a - b;});
    }

    return topicIdsDict;
}

function getTopicSummary(contentJson, highTopicId, lowTopicId) {
    let allTopicSummaries = contentJson["topic_summaries"];

    highTopicId = String(highTopicId);
    let topicId;
    let currentTopicSummary;
    if (lowTopicId === -1 ) {
        topicId = highTopicId;
    } else {
        lowTopicId = String(lowTopicId)
        topicId = highTopicId + "_" + lowTopicId;
    }

    currentTopicSummary = allTopicSummaries[topicId];
    return currentTopicSummary;
}

function getSummaryLinks(contentJson, highTopicId, lowTopicId) {
    let allSummaries = contentJson["article_summaries"];

    let highTopicSummaryLabels = allSummaries[2];
    let integerHighTopicId = parseInt(highTopicId);
    var highTopicMask = highTopicSummaryLabels.map(item => item === integerHighTopicId);

    let summaryLinks = {};
    if (lowTopicId === -1) {
        summaryLinks["links"] = allSummaries[0].filter((item, i) => highTopicMask[i]);
        summaryLinks["summaries"] = allSummaries[1].filter((item, i) => highTopicMask[i]);
    } else {
        let lowTopicSummaryLabels = allSummaries[3];
        let lowTopicMask = lowTopicSummaryLabels.map(item => item === lowTopicId);

        summaryLinks["links"] = allSummaries[0].filter((item, i) => (highTopicMask[i] && lowTopicMask[i]));
        summaryLinks["summaries"] = allSummaries[1].filter((item, i) => (highTopicMask[i] && lowTopicMask[i]));
    }

    return summaryLinks;

}

///////////////////////////////////////////////////////////////////////////

async function updateMainPanels() {

    let realHighTopicKey = window.highTopicsKeys[window.currentHighTopic];

	let highCounter = document.getElementById("high-topic-counter");
    highCounter.innerHTML = (window.currentHighTopic + 1) +  "/" + window.highTopicsCount;

    let lowCounter = document.getElementById("low-topic-counter");
    if (window.currentLowTopic === -1) {
    	lowCounter.innerHTML = "Overview";
    } else {
    	let lowTopicsCount = window.topicIdsDict[realHighTopicKey].length;
    	lowCounter.innerHTML = (window.currentLowTopic + 1) +  "/" + lowTopicsCount;
    }

    let currentTopicDescription = document.getElementById("topic-description-text");
    let realLowTopic;
    if (window.currentLowTopic === -1){
    	realLowTopic = -1;
    } else {
    	realLowTopic = window.topicIdsDict[realHighTopicKey][window.currentLowTopic];
    }

    currentTopicDescription.innerHTML = getTopicSummary(window.contentJson, realHighTopicKey, realLowTopic);

    // update summary list
    let linksSummariesObject = getSummaryLinks(window.contentJson, realHighTopicKey, realLowTopic);
    let currentLinks = linksSummariesObject["links"];
    let currentSummaries = linksSummariesObject["summaries"];
    let linksCount = currentLinks.length;

    var summaryLinksList = document.createElement("ol");
    for (let i = 0; i < linksCount; i++) {
    	var linkListItem = document.createElement("li");
    	var innerLink = document.createElement("a");
    	innerLink.setAttribute("href", currentLinks[i]);
    	innerLink.setAttribute("target", "blank");
    	innerLink.innerHTML = currentSummaries[i];

    	linkListItem.appendChild( innerLink );
    	summaryLinksList.appendChild( linkListItem );
    }

    let currentSummaryLinksElement = document.getElementById("summary-source-link-list");
    currentSummaryLinksElement.innerHTML = "";
    currentSummaryLinksElement.appendChild( summaryLinksList );


}

async function initPanels() {
	while(window.contentLoaded === false)
    	console.log("waiting for content update");
        await new Promise(resolve => setTimeout(resolve, 10));

    window.topicIdsDict = getTopicIds( window.contentJson );
    window.highTopicsKeys = Object.keys(window.topicIdsDict);
    window.highTopicsCount = window.highTopicsKeys.length;
    window.currentHighTopic = 0;
    window.currentLowTopic = -1;
    //console.log( window.topicIdsDict );
    //console.log( window.highTopicsCount );

    let previousHighSummaryButton = document.getElementById("previous-high-topic-button");
    let previouslowSummaryButton = document.getElementById("previous-low-topic-button");
    previousHighSummaryButton.style.visibility = "hidden";
    previouslowSummaryButton.style.visibility = "hidden";


    let newsCounter = document.getElementById("news-counter");
    newsCounter.innerHTML = window.contentJson["news_count"];

    let sourcesCounter = document.getElementById("sources-counter");
    sourcesCounter.innerHTML = window.contentJson["sources_count"];

    let updateTime = document.getElementById("update-time");
    updateTime.innerHTML = window.contentJson["update_time"];

    let keywords = document.getElementById("keywords-tag");
    keywords.setAttribute("content", window.contentJson["keywords"])

    await updateMainPanels();

}

async function getPreviousHighSummary() {
    while(window.contentLoaded === false)
    	console.log("Can't get previous high summary. Waiting for content update.");
        await new Promise(resolve => setTimeout(resolve, 10));

    if (window.currentHighTopic <= 0){ return; }

    window.currentHighTopic -= 1;
    window.currentLowTopic = -1;

    let previouslowSummaryButton = document.getElementById("previous-low-topic-button");
    previouslowSummaryButton.style.visibility = "hidden";

    let nextLowSummaryButton = document.getElementById("next-low-topic-button");
    nextLowSummaryButton.style.visibility = "visible";

    let nextHighSummaryButton = document.getElementById("next-high-topic-button");
    nextHighSummaryButton.style.visibility = "visible";


    let previousHighSummaryButton = document.getElementById("previous-high-topic-button");
    if (window.currentHighTopic <= 0) {
    	previousHighSummaryButton.style.visibility = "hidden";
    } else {
    	previousHighSummaryButton.style.visibility = "visible";
    }

    await updateMainPanels();
}

async function getNextHighSummary() {
	while(window.contentLoaded === false)
    	console.log("Can't get next high summary. Waiting for content update.");
        await new Promise(resolve => setTimeout(resolve, 10));

    if (window.currentHighTopic >= (window.highTopicsCount - 1)){ return; }

    window.currentHighTopic += 1;
    window.currentLowTopic = -1;

    let previouslowSummaryButton = document.getElementById("previous-low-topic-button");
    previouslowSummaryButton.style.visibility = "hidden";

    let nextLowSummaryButton = document.getElementById("next-low-topic-button");
    nextLowSummaryButton.style.visibility = "visible";

    let previousHighSummaryButton = document.getElementById("previous-high-topic-button");
    previousHighSummaryButton.style.visibility = "visible";

    let nextHighSummaryButton = document.getElementById("next-high-topic-button");
    if (window.currentHighTopic >= (window.highTopicsCount - 1)) {
    	nextHighSummaryButton.style.visibility = "hidden";
    } else {
    	nextHighSummaryButton.style.visibility = "visible";
    }

    await updateMainPanels();

}

async function getPreviousLowSummary() {
	while(window.contentLoaded === false)
    	console.log("Can't get previous low summary. Waiting for content update.");
        await new Promise(resolve => setTimeout(resolve, 10));

    if (window.currentLowTopic <= -1){ return; }

    window.currentLowTopic -= 1;

    let nextLowSummaryButton = document.getElementById("next-low-topic-button");
    nextLowSummaryButton.style.visibility = "visible";

    let previousLowSummaryButton = document.getElementById("previous-low-topic-button");
    if (window.currentLowTopic <= -1) {
    	previousLowSummaryButton.style.visibility = "hidden";
    } else {
    	previousLowSummaryButton.style.visibility = "visible";
    }

    await updateMainPanels();

}

async function getNextLowSummary() {
	while(window.contentLoaded === false)
    	console.log("Can't get next low summary. Waiting for content update.");
        await new Promise(resolve => setTimeout(resolve, 10));

    let lowTopicsCount = window.topicIdsDict[String(window.currentHighTopic)].length;
    if (window.currentLowTopic >= lowTopicsCount - 1){ return; }

    window.currentLowTopic += 1;

    let previouslowSummaryButton = document.getElementById("previous-low-topic-button");
    previouslowSummaryButton.style.visibility = "visible";

    let nextLowSummaryButton = document.getElementById("next-low-topic-button");
    if (window.currentLowTopic >= lowTopicsCount - 1) {
    	nextLowSummaryButton.style.visibility = "hidden";
    } else {
    	nextLowSummaryButton.style.visibility = "visible";
    }

    await updateMainPanels();

}

///////////////////////////////////////////////////////////////////////////


async function initContentJson() {
	window.contentJson = await loadContentJson();
	window.contentLoaded = true;
}

function testLoadedContent() {
	// get topic ids
	let topicIdsDict = getTopicIds( window.contentJson );
	console.log( topicIdsDict );
	console.log( Object.keys(topicIdsDict).length );

	// get group summary
	let sampleTopicSummary = getTopicSummary( window.contentJson, 0, 1 );
	console.log(sampleTopicSummary);

	 // get summary links
	let summaryLinks = getSummaryLinks(window.contentJson, 0, 0)
	console.log( summaryLinks );
}

window.contentLoaded = false;

initContentJson()
	.then(result => {console.log(window.contentLoaded);
		console.log(window.contentJson);})
	.catch(err => {console.log(err);});


(async() => {
    console.log("waiting for content update");
    while(window.contentLoaded === false)
        await new Promise(resolve => setTimeout(resolve, 10));
    console.log("content updated");
    //testLoadedContent();
    initPanels();
})();