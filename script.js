let easyMDE;
let latestStoredMarkdown;
const WAIT_BEFORE_SAVING = 3*1000; // 3 seconds.
let currentSaveTimeout = null;
let initialLoad = false;

window.onload = () => {
  easyMDE = new EasyMDE({
    renderingConfig: {
      singleLineBreaks: false
    },
    spellChecker: false
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
};

async function loadMarkdownFromResource(url) {
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
    easyMDE.value(markdown);
  } else if (response.status === 404) {
    document.getElementById('save-status').innerText =
      `This resource doesn't exist yet. We will create it once you start writing.`;
    initialLoad = true;
    easyMDE.value('');
  } else {
    console.log(await response.text());
  }
}

async function storeMarkdownToResource(url, markdown) {
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
