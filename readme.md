# Node-Pick

## Dom selection tool based on cheerio.js

### Install

```bash
yarn add node-pick
```

### Rule

```js
const pickRule = {
  title: {
    selector: 'title'
  },
  apple: {
    selector: ['.apple', '@text']
  },
  list: {
    selector: [
      'div',
      {
        text: '@text',
        names: {
          selector: ['ul > li', '@text']
        }
      }
    ]
  }
}

console.log(nodePick('you-html-string').output(pickRule))
```

### Output 🌈

```json
{
  "title": ["Hello World!"],
  "apple": ["Apple"],
  "list": [
    {
      "names": ["Apple", "Orange", "Pear"],
      "text": "\n    \n      Apple\n      Orange\n      Pear\n    \n  "
    }
  ]
}
```

## TODO:

- [ ] more operators / custom operators
- [ ] add value type
- [ ] ...

## License

MIT
