function openSummaryListPanel() {


	summaryPanel = document.getElementById("summary-panel");
	summaryPanel.style.visibility = "visible";
	//summaryPanel.classList.toggle("show-panel");

	openButton = document.getElementById("open-summary-list-panel");
	openButton.style.visibility = "hidden";
}

function closeSummaryListPanel() {
	summaryPanel = document.getElementById("summary-panel");
	summaryPanel.style.visibility = "hidden";
	//summaryPanel.classList.toggle("hide-panel");

	openButton = document.getElementById("open-summary-list-panel");
	openButton.style.visibility = "visible";
}

function openSupportPanel() {
	supportPanel = document.getElementById("support-paper-panel");
	supportPanel.style.visibility = "visible";

	openButton = document.getElementById("open-support-panel-button");
	openButton.style.visibility = "hidden";
}

function closeSupportPanel() {
	supportPanel = document.getElementById("support-paper-panel");
	supportPanel.style.visibility = "hidden";

	openButton = document.getElementById("open-support-panel-button");
	openButton.style.visibility = "visible";
}
