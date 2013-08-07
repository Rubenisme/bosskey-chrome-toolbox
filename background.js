  var shortcut = new Shortcut();
  shortcut.createTable();
  shortcut.insertRecord(key_util.extension_support_shortcut_map, 0);
  var custom_shortcut_list = [];
  var plugin = {
    convenience: document.getElementById('plugin_convenience'),
    addKeyboardListener: function(input) {
      this.convenience.AddListener(input);
    },
    removeKeyboardListener: function() {
      this.convenience.RemoveListener();
    },
    updateTabCount: function(windowid, tabcount) {
      this.convenience.UpdateTabCount(windowid, tabcount);
    },
    pressBossKey: function() {
      this.convenience.PressBossKey();
    },
    hiddenCurrentWindow: function() {
      this.convenience.HideCurrentChromeWindow();
    },
    restoreLastHiddenWindow: function() {
      this.convenience.RestoreLastHiddenWindow();
    },
    triggerChromeShortcuts: function(virtualKey) {
      this.convenience.TriggerChromeShortcuts(virtualKey)
    },
    updateShortCutList: function(shortcutList) {
      this.convenience.UpdateShortCutList(shortcutList);
    },
    closeChromePrompt: function(flag) {
      this.convenience.CloseChromePrompt(flag);
    },
    existsPinnedTab: function(windowId, pinned) {
      this.convenience.ExistsPinnedTab(windowId, pinned);
    },
    chromeWindowCreated: function(windowid) {
      this.convenience.ChromeWindowCreated(windowid);
    },
    chromeWindowRemoved: function(windowid) {
      this.convenience.ChromeWindowRemoved(windowid);
    }
  }
  
  function updateTabCount(windowId) {
    chrome.tabs.getAllInWindow(windowId, function(tabs) {
      if (tabs) {
        plugin.updateTabCount(windowId, tabs.length);
        var pinned = false;
        for(var index = 0; index < tabs.length; index++) {
          if (tabs[index].pinned) {
            pinned = true;
          }
        }
        plugin.existsPinnedTab(windowId, pinned);
      }
    });
  }

  function beforeLastTabClose() {
    chrome.tabs.getSelected(null, function(tab) {
      if (tab.url != 'chrome://newtab/') {
        chrome.tabs.create({url: 'chrome://newtab/'});
        chrome.tabs.remove(tab.id);
      }
    });
  }

  function closeCurrentTab() {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.remove(tab.id);
    });
  }

  function updateCloseChromePromptFlag(flag) {
    localStorage['closeChromePrompt'] = flag;
  }

  function executeShortcut(obj) {
    if (obj) {
      switch(obj.operation) {
        case 'bossKey':
          bossKeyExecute();
          break;
        case 'hideCurrentWindow':
          plugin.hiddenCurrentWindow();
          break;
        case 'restoreLastHiddenWindow':
          plugin.restoreLastHiddenWindow();
          break;
      }
    }
  }

  function bossKeyExecute() {
    plugin.pressBossKey();
  }
  
  
  function init() {
    localStorage['isFirstInstallThisVer'] =  localStorage['isFirstInstallThisVer'] || 'true';
    if (isWindowsPlatform())
	{
      chrome.tabs.onCreated.addListener(function(tab) {
        updateTabCount(tab.windowId);
      });
      chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
        updateTabCount(attachInfo.newWindowId);
      });
      chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
        updateTabCount(detachInfo.oldWindowId);
      });
      chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        if (!removeInfo.isWindowClosing) {
          chrome.windows.getCurrent(function(window) {
            updateTabCount(window.id);
          });
        }
      });
      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.pinned == true) {
          plugin.existsPinnedTab(tab.windowId, true);
        } else if (changeInfo.pinned == false) {
          chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
            var pinned = false;
            for(var index = 0; index < tabs.length; index++) {
              if (tabs[index].pinned) {
                pinned = true;
              }
            }
            plugin.existsPinnedTab(tab.windowId, pinned);
          });
        }
      });
      chrome.windows.onCreated.addListener(function(window) {
        if (window.type == 'normal') {
          setTimeout(function() {
            plugin.chromeWindowCreated(window.id);
            updateTabCount(window.id);
          }, 1000);
        }
      });
      chrome.windows.onRemoved.addListener(function(windowid) {
        plugin.chromeWindowRemoved(windowid);
      });
      chrome.windows.getCurrent(function(window) {
        plugin.chromeWindowCreated(window.id);
        updateTabCount(window.id);
      });
    }
  }

  function getNPMessage(messageId) {
    var npMessage = {
      1001: 'np_message_1001',
      1002: 'np_message_1002',
      1003: 'np_message_1003',
      1004: 'np_message_1004',
      1005: 'np_message_1005',
      1006: 'np_message_1006'
    };
    var message = '';
    if (npMessage[messageId]) {
      message = chrome.i18n.getMessage(npMessage[messageId]);
    }
    return message;
  }

