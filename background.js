chrome.action.onClicked.addListener(async (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {

        let total = 0;
        document.querySelectorAll('code').forEach(code => {
          const match = code.textContent.match(/^(\d+(\.\d+)?)h$/);
          if (match) total += parseFloat(match[1]);
        });
        
        alert(`Total: ${total}h`);
      
      }
    });
  });  