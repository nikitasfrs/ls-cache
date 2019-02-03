# ls-cache
Simple localStorage caching library

## Usage
```js
const cache = new Cache({
  maxEntries: 100,
  mountIn: 'Acme Inc.',
  namespace: 'base-product'
  cacheMinutes: 30
});

cache.set("data_key_foobar", {bar: 'baz'}); // entry for this key will remain in cache for 30 minutes

const item = cache.get("deta_key_foobar");     
console.log(item);    // {bar: 'baz'}
```

### Key normalizer support
A normalizer function which will get called each time a key gets set through a given cache instance, can be supplied via the `keyNormalizer` property, optionally, in the constructor object.


As an example, a cache instance containing JSON network response objects, having the request URL as keys can be implemented in the following way:

```js

// Sorts query parameters in a URL, for consistency
function normalizeUrl(url = '') {
  const [ params, qs ] = url.split('?');
  if (!qs) {
    return url;
  }
  if (URLSearchParams) {
    const searchParams = new URLSearchParams(qs);
    searchParams.sort();
    return `${params}?${searchParams}`;
  }
  return url; 
}

const cache = new Cache({
  maxEntries: 100,
  mountIn: 'Acme Inc.',
  namespace: 'base-product'
  cacheMinutes: 30,
  keyNormalizer: normalizeUrl
});

function fetchData(url, responseType, caching) {
  const cachedItem = cache.get(url);

  if (caching && cachedItem) {
    return Promise.resolve(cachedItem);
  } else {
    return fetch(url, {
      method: 'GET'
    }).then(res => {
        const result = res.json();
        if (caching) {
          result.then(data => {
            cache.set(url, data);
          })
        }
      }
      return result;
    });
  }
}

```

