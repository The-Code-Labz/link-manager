var UI = {
      linkInput: null,
      addButton: null,
      linksContainer: null,
      searchInput: null,
      tagInput: null,
      isExtension: typeof chrome !== 'undefined' && chrome.tabs,
    
      init: function() {
        this.linkInput = document.getElementById('linkInput');
        this.addButton = document.getElementById('addButton');
        this.linksContainer = document.getElementById('linksContainer');
        this.searchInput = document.getElementById('searchInput');
        this.tagInput = document.getElementById('tagInput');
    
        this.addButton.addEventListener('click', this.handleAddLink.bind(this));
        this.linkInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            this.handleAddLink();
          }
        }.bind(this));
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
      },
    
      handleAddLink: function() {
        var url = this.linkInput.value.trim();
        var tags = this.tagInput.value.trim();
        if (!url) return;
    
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
    
        LinkStorage.addLink(url, tags).then(function() {
          this.linkInput.value = '';
          this.tagInput.value = '';
          this.renderLinks();
        }.bind(this));
      },
    
      createLinkElement: function(link) {
        var linkItem = document.createElement('div');
        linkItem.className = 'link-item';
    
        var baseUrl = new URL(link.url).hostname;
    
        var linkTitle = document.createElement('a');
        linkTitle.className = 'link-title';
        linkTitle.href = '#';
        linkTitle.textContent = baseUrl;
        linkTitle.title = link.url;
        linkTitle.addEventListener('click', function(e) {
          e.preventDefault();
          if (this.isExtension) {
            chrome.tabs.create({ url: link.url });
          } else {
            // Development environment: open in new tab
            window.open(link.url, '_blank');
          }
        }.bind(this));
    
        var tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        if (link.tags) {
          link.tags.split(',').forEach(function(tag) {
            var tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag.trim();
            tagsContainer.appendChild(tagElement);
          });
        }
    
        var deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
          LinkStorage.removeLink(link.url).then(this.renderLinks.bind(this));
        }.bind(this));
    
        linkItem.appendChild(linkTitle);
        linkItem.appendChild(tagsContainer);
        linkItem.appendChild(deleteButton);
    
        return linkItem;
      },
    
      renderLinks: function(filteredLinks) {
        LinkStorage.getLinks().then(function(links) {
          var linksToRender = filteredLinks || links;
          this.linksContainer.innerHTML = '';
          linksToRender.forEach(function(link) {
            this.linksContainer.appendChild(this.createLinkElement(link));
          }.bind(this));
        }.bind(this));
      },
    
      handleSearch: function() {
        var searchTerm = this.searchInput.value.trim().toLowerCase();
        LinkStorage.getLinks().then(function(links) {
          var filteredLinks = links.filter(function(link) {
            var urlMatch = link.url.toLowerCase().includes(searchTerm);
            var tagMatch = link.tags && link.tags.toLowerCase().includes(searchTerm);
            return urlMatch || tagMatch;
          });
          this.renderLinks(filteredLinks);
        }.bind(this));
      }
    };
