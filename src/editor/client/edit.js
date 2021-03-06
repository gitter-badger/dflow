var debug = require('debug')

var socket = window.io()

var graph = null

window.myDebug = debug
window.onload = initPage

function initPage () {
  // Debug setup.
  window.myDebug.enable('dflow')
  var debug = window.myDebug('dflow')
  // TODO add Debug toogle button

  // Initialize canvas and other elements.
  var Canvas = require('flow-view').Canvas

  var canvas = new Canvas('graph', {
    nodeSelector: {
      dataList: {
        URL: '/tasklist'
      }
    }
  })

  var canvasMethods = ['addLink', 'addNode',
                       'delLink', 'delNode']

  canvasMethods.forEach(function (methodName) {
    canvas.broker.removeAllListeners(methodName)

    canvas.broker.on(methodName, function (data) {
      debug(methodName, data)
      socket.emit(methodName, data)
    })

    socket.on(methodName, function (data) {
      canvas[methodName](data)
    })
  })

  var nodeMethods = ['addInput', 'addOutput']

  nodeMethods.forEach(function (methodName) {
    canvas.broker.removeAllListeners(methodName)

    canvas.broker.on(methodName, function (data) {
      debug(methodName, data)
      socket.emit(methodName, data)
    })

    socket.on(methodName, function (data) {
      var id = data.nodeid
      var position = data.position

      var node = canvas.node[id]

      node[methodName](position)
    })
  })

  canvas.broker.on('moveNode', function (data) {
    debug('moveNode', data)
    socket.emit('moveNode', data)
  })

  canvas.broker.on('dblclickNode', function (data) {
    debug('dblclickNode', data)

    var nodeid = data.nodeid
    var node = canvas.node[nodeid]

    var taskName = node.text
    var taskId = node.id

    $('#task-name').html(`
      ${taskName}
      <div class="detail">${taskId}</div>
    `)

    $('#inspector').modal('show')
  })

  socket.on('moveNode', function (data) {
    debug('moveNode', data)

    var x = data.x
    var y = data.y

    var node = canvas.node[data.nodeid]

    node.group.move(x, y)

    node.outs.forEach(function (output) {
      Object.keys(output.link).forEach(function (id) {
        var link = output.link[id]

        if (link) {
          link.linePlot()
        }
      })
    })

    node.ins.forEach(function (input) {
      var link = input.link

      if (link) {
        link.linePlot()
      }
    })
  })

  socket.on('loadGraph', function (data) {
    debug('loadGraph', data)

    graph = data
    canvas.deleteView()
    canvas.render(graph.view)
  })
}
