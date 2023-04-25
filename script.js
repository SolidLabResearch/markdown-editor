let easyMDE;
let latestStoredMarkdown;
const WAIT_BEFORE_SAVING = 3*1000; // 3 seconds.
let currentSaveTimeout = null;
let initialLoad = false;

window.onload = () => {
  document.getElementById('load-button')
    .addEventListener('click', (e) => {
      e.preventDefault();
      const url = document.getElementById('resource').value;
    loadMarkdownFromResource(url);
  });

  document.getElementById('resource')
    .addEventListener('keypress', event => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("load-button").click();
      }
    });

  document.getElementById('clear-recent-items-button')
    .addEventListener('click', (e) => {
      clearRecentItems();
    });

  connectWithSolidExtension();
  loadRecentItems();
};

function loadEditor() {
  easyMDE = new EasyMDE({
    renderingConfig: {
      singleLineBreaks: false
    },
    spellChecker: false,
    sideBySideFullscreen: false
  });
  easyMDE.codemirror.on("change", () => {
    if (initialLoad) {
      document.getElementById('save-status').innerText = 'Saved.';
      initialLoad = false;
      return;
    }

    document.getElementById('save-status').innerText = 'Unsaved changes.';
    latestStoredMarkdown = easyMDE.value();

    if (currentSaveTimeout) {
      clearTimeout(currentSaveTimeout);
    }

    currentSaveTimeout = setTimeout(async () => {
      const url = document.getElementById('resource').value;
      const responseStatus = await storeMarkdownToResource(url, latestStoredMarkdown);

      if (responseStatus) {
        document.getElementById('error').innerText = '';
      } else {
        document.getElementById('error').innerText = 'Failed to save markdown to resource.';
      }
      currentSaveTimeout = null;
      document.getElementById('save-status').innerText = 'Saved.';
    }, WAIT_BEFORE_SAVING);
  });
}

async function loadMarkdownFromResource(url) {
  if (!url) {
    throw new Error('No url was provided.');
  }

  console.log('Loading', url);
  const response = await fetch(url, {
    headers: {
      'accept': 'text/markdown'
    },
    cache: 'no-store'
  });

  if (response.ok) {
    const markdown = await response.text();
    initialLoad = true;
    if (!easyMDE) {
      loadEditor();
    }
    easyMDE.value(markdown);
    addRecentItem(url);
  } else if (response.status === 404) {
    if (!easyMDE) {
      loadEditor();
    }
    initialLoad = true;
    easyMDE.value('');
    document.getElementById('save-status').innerText =
      `This resource doesn't exist yet. We will create it once you start writing.`;
    addRecentItem(url);
  } else {
    console.log(await response.text());
  }
}

async function storeMarkdownToResource(url, markdown) {
  if (!url) {
    throw new Error('No url was provided.');
  }

  console.log('Saving to', url);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'content-type': 'text/markdown'
    },
    body: markdown
  });

  return response.ok;
}

function connectWithSolidExtension() {
  if (!window.solid) {
    console.log('Solid Authentication extension not detected.');
    return;
  }

  window.solid.onStatusChange(status => {
    status = JSON.parse(status);
    showWebID(status.webId);
  });

  window.solid.getStatus(status => {
    status = JSON.parse(status);
    showWebID(status.webId);
  });
}

function showWebID(webId) {
  const $webIdContainer = document.getElementById('webid-container');
  const $webId = document.getElementById('webid');
  if (webId) {
    $webIdContainer.classList.remove('hidden');
    $webId.innerText = webId;
  } else {
    $webIdContainer.classList.add('hidden');
  }
}

function loadRecentItems() {
  let recentItems = window.localStorage.getItem('recentItems');

  if (recentItems) {
    recentItems = JSON.parse(recentItems);
  } else {
    recentItems = [];
  }

  recentItems.reverse();

  let list = `<ul>`;

  recentItems.forEach(item => {
    list += `<li>${item}</li>`;
  });

  list += '</ul>';

  document.getElementById('recent-items-list').innerHTML = list;
  let links = document.querySelectorAll('#recent-items-list li');
  links = Array.from(links);

  links.forEach(link => {
    link.addEventListener('click', () => {
      const url = link.innerText;
      console.log(url);
      document.getElementById('resource').value = url;
      loadMarkdownFromResource(url);
    })
  });
}

function addRecentItem(item) {
  let recentItems = window.localStorage.getItem('recentItems');

  if (recentItems) {
    recentItems = JSON.parse(recentItems);
  } else {
    recentItems = [];
  }

  const index = recentItems.indexOf(item);

  if (index !== -1) {
    recentItems.splice(index, 1);
  }

  recentItems.push(item);
  window.localStorage.setItem('recentItems', JSON.stringify(recentItems));
}

function clearRecentItems() {
  window.localStorage.setItem('recentItems', JSON.stringify([]));
  loadRecentItems();
}
