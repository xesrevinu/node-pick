function src($) {
  return $.attr('src')
}

function href($) {
  return $.attr('href')
}

function text($) {
  return $.text()
}

function id($) {
  return $.attr('id')
}

function className($) {
  return $.attr('class')
}

function rawHtml($) {
  return $.html()
}

module.exports = { src, href, text, id, className, rawHtml }
