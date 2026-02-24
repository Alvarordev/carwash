const API = 'http://localhost:3001/orders';

(async () => {
  try {
    const page = 1, limit = 10;
    const url = `${API}?_page=${page}&_limit=${limit}`;
    console.log('Fetching paginated URL:', url);
    const res = await fetch(url);
    console.log('status', res.status);
    const json = await res.json();
    console.log('paginated response type:', Array.isArray(json) ? 'array' : typeof json);
    console.log('paginated keys:', Object.keys(json || {}).slice(0, 10));
    if (Array.isArray(json)) console.log('paginated len', json.length);
    else {
      console.log('paginated.items', json.items, 'dataLen', Array.isArray(json.data) ? json.data.length : null);
    }

    console.log('Attempting fallback to full endpoint:', API);
    const res2 = await fetch(API);
    const all = await res2.json();
    console.log('full endpoint type:', Array.isArray(all) ? 'array' : typeof all, 'len', Array.isArray(all) ? all.length : null);
  } catch (e) {
    console.error('error', e);
  }
})();
