function setupContextMenu() {
  chrome.contextMenus.create({
    id: "create-letter",
    title: "Create Cover Letter From Text",
    contexts: ["selection"],
  }),
    chrome.contextMenus.create({
      id: "create-letter-notes",
      title: "Create Cover Letter From Text With Notes",
      contexts: ["selection"],
    });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  chrome.storage.session.set({
    lastJob: data.selectionText,
    waitForNotes: data.menuItemId === "create-letter-notes",
  });

  chrome.sidePanel.open({ tabId: tab.id });
});
