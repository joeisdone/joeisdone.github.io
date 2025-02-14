// unzipWorker.js
self.importScripts('jszip.min.js'); // Important: load JSZip within the worker

self.onmessage = async (e) => {
  const { zipUrl, innerFilename } = e.data;
  try {
    const resp = await fetch(zipUrl);
    if (!resp.ok) {
      throw new Error('Could not fetch ' + zipUrl + ' (status ' + resp.status + ')');
    }
    const buffer = await resp.arrayBuffer();

    const jsZip = new JSZip();
    const loaded = await jsZip.loadAsync(buffer);

    if (!loaded.file(innerFilename)) {
      throw new Error('Missing ' + innerFilename + ' in ' + zipUrl);
    }
    const text = await loaded.file(innerFilename).async('string');
    
    // Return success
    self.postMessage({ success: true, text });
  } catch (err) {
    // Return an error message
    self.postMessage({ success: false, error: err.toString() });
  }
};
