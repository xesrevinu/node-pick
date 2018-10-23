const cheerio = require('cheerio')
const R = require('ramda')
const defaultOperators = require('./operators')

const debugLog = require('debug')('node-pick:index')

const debug = R.curry((label, x) => {
  debugLog(label + ': ', x)
  return x
})

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

const ofArray = R.when(R.complement(R.is(Array)), R.of)

const renameKeys = R.curry((keysMap, arr) =>
  R.map(x => {
    return keysMap[x] ? keysMap[x] : x
  }, arr)
)

const isSelectNode = x => {
  return isObject(x) && !R.isEmpty(x.selector)
}

const getOp = op => R.propOr(defaultOperators.html, op, defaultOperators)

const opPipe = R.curry((ops, fn) => {
  return R.compose(...ops)(fn)
})

// all @xxx
const attrOps = R.compose(
  R.map(R.replace(/@/, '')),
  R.filter(R.startsWith('@'))
)

/**
 * {
 *   a: "@class"
 * }
 *
 * result: [ "className" ]
 */
const objectOp = R.compose(
  attrOps,
  renameKeys({ '@class': '@className' }),
  R.values
)

/**
 * ['@class']
 *
 * result: ["className"]
 */
const stringOp = R.compose(
  attrOps,
  renameKeys({ '@class': '@className' }),
  ofArray
)

// filter nodeType === 1 or 2
const filterNodeType = R.filter(R.propSatisfies(R.contains(R.__, [1, 2]), 'nodeType'))

const getSelectValue = (rule, $) => {
  const selectors = R.take(2, ofArray(rule.selector))
  const [firstSelect, lastSelect] = selectors

  const exec = R.curry((ops, fun) => {
    return R.chain(
      elem =>
        R.map(op => {
          const ops = [getOp(op)]

          return opPipe(ops, $(elem))
        }, ops),
      fun.toArray()
    )
  })

  const pickOperator = R.curry((operator, data) => {
    return R.compose(x => {
      if (!operator) {
        return defaultOperators.rawHtml(x)
      }

      if (R.is(String, operator)) {
        return exec(stringOp(operator), x)
      } else {
        return R.zipObj(R.keys(operator), exec(objectOp(operator), x))
      }
    })(data)
  })

  /**
   *
   * @param {Array} select
   * @param {Array} op
   */
  const buildSelectorTree = (select, op) => {
    if (isObject(op) || R.is(String, op) || !op) {
      let current = null
      let nextSelect = null
      if (R.is(String, op)) {
        current = op
        nextSelect = null
      } else if (isObject(op)) {
        current = R.reject(isSelectNode, op)
        nextSelect = R.filter(isSelectNode, op)
      }

      return R.compose(
        R.chain(
          R.compose(
            elem => {
              if (!R.isNil(nextSelect)) {
                const nextResult = R.mapObjIndexed((item, key) => {
                  return getSelectValue(item, $)
                }, nextSelect)

                return R.merge(nextResult, pickOperator(current, elem))
              }

              return pickOperator(current, elem)
            },
            $
          )
        ),
        filterNodeType
      )(select)
    }

    const flattenSelect = R.chain(
      d =>
        $(d)
          .find(R.head(op))
          .toArray(),
      select
    )

    switch (op.length) {
      case 1:
        return buildSelectorTree(flattenSelect, null)
      case 2:
        return buildSelectorTree(flattenSelect, R.last(op))
    }
  }

  return buildSelectorTree($(firstSelect).toArray(), lastSelect)
}

function nodePick(html, opt = { log: false }) {
  const { log, ...cheerioOpt } = opt
  const $ = cheerio.load(html, cheerioOpt)

  debug('opt', opt)

  function output(rule) {
    const compose = []

    if (log) {
      compose.push(x => console.log('Node-pick Result: \n', JSON.stringify(x)))
    }

    if (!R.is(Object, rule)) {
      throw new Error('config error')
    }

    return R.compose(
      ...compose,
      R.mapObjIndexed((item, key) => {
        return getSelectValue(item, $)
      })
    )(rule)
  }

  return {
    $: $,
    output
  }
}

module.exports = nodePick
