var LinkStorage = {
      isExtension: typeof chrome !== 'undefined' && chrome.storage,
      storage: {},
    
      getLinks: function() {
        return new Promise(function(resolve) {
          if (this.isExtension) {
            chrome.storage.local.get(['links'], function(result) {
              resolve(result.links || []);
            });
          } else {
            // Development environment: use in-memory storage
            resolve(this.storage.links || []);
          }
        }.bind(this));
      },
    
      saveLinks: function(links) {
        return new Promise(function(resolve) {
          if (this.isExtension) {
            chrome.storage.local.set({ links: links }, resolve);
          } else {
            // Development environment: use in-memory storage
            this.storage.links = links;
            resolve();
          }
        }.bind(this));
      },
    
      addLink: function(url, tags) {
        return this.getLinks().then(function(links) {
          links = links || [];
          links.push({
            url: url,
            tags: tags,
            timestamp: Date.now()
          });
          links.sort(function(a, b) {
            return b.timestamp - a.timestamp;
          });
          return this.saveLinks(links);
        }.bind(this));
      },
    
      removeLink: function(url) {
        return this.getLinks().then(function(links) {
          var filteredLinks = links.filter(function(link) {
            return link.url !== url;
          });
          return this.saveLinks(filteredLinks);
        }.bind(this));
      }
    };
