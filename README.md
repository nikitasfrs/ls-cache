# ls-cache
Simple localStorage caching library

## Usage
```js
const cache = new Cache({
  maxEntries: 100,
  mountIn: 'Acme Inc.',
  namespace: 'base-product'
  cacheMinutes: 30,
  keyNormalizer: normalizeUrl
});
```
