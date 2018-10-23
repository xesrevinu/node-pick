const fs = require('fs')
const path = require('path')
const chai = require('chai')
const nodePick = require('../src')

const expect = chai.expect

const rule = {
  title: {
    selector: 'title'
  },
  apple: {
    selector: ['.apple', '@text']
  },
  name: {
    selector: [
      '#app',
      {
        html: '@text',
        ul: {
          selector: [
            'ul',
            {
              xx: {
                selector: ['li', '@text']
              },
              first: {
                selector: ['li:nth-child(1)', '@text']
              }
            }
          ]
        }
      }
    ]
  },
  list: {
    selector: [
      'div',
      {
        text: '@text',
        names: {
          selector: ['ul > li', '@rawHtml']
        },
        firstName: {
          selector: ['ul > li:nth-child(1)', '@text']
        }
      }
    ]
  },
  list2: {
    selector: ['ul', ['li', '@text']]
  }
}

describe('Pick-Pick Test', function() {
  let html = null

  before(function() {
    html = fs.readFileSync(path.resolve(__dirname, './test.html')).toString()
  })

  it('expect pick value', function() {
    const data = nodePick(html).output(rule)

    expect(data).to.be.a('object')
    expect(data.title[0]).to.be.eq('Hello World!')
    expect(data.apple[0]).to.be.eq('Apple')
    // TODO:
  })
})
