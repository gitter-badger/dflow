
var fs = require('fs')

var pkg = require('../../package.json')

var defaultOpt = {
  autosave: true,
  port: 3000,
  verbose: false // Silence is gold.
}

/**
 * Save graph json file
 *
 * @api private
 */

function saveGraph (graphPath, graph, callback) {
  var jsonString = JSON.stringify(graph)

  fs.writeFile(graphPath, jsonString, 'utf8', function (err) {
    if (err) throw err

    if (typeof callback === 'function')
      callback()
  })
}

/**
 * Log event to stdout
 *
 * @api private
 */

function logEvent (verbose, eventName, eventData) {
  if (verbose)
    console.dir({event: eventName, data: eventData})
}

function editorServer (graphPath, opt) {
  var graph   = require(graphPath),
      nextId = 0

  /**
   * Id generator.
   *
   * @api private
   */

  function getNextId () {
    var currentId = ++nextId + ''

    // Make next id unique.
    if (graph.task[currentId])
      return getNextId()

    if (graph.pipe[currentId])
      return getNextId()

    return currentId
  }

  var save = saveGraph.bind(null, graphPath)

  var bodyParser = require('body-parser'),
      express    = require('express'),
      ejs        = require('ejs'),
      path       = require('path')

  var app  = express(),
      http = require('http').Server(app),
      io   = require('socket.io')(http)

  // Default options.

  var autosave = opt.autosave || defaultOpt.autosave,
      port     = opt.port     || defaultOpt.port,
      verbose  = opt.verbose  || defaultOpt.verbose

  var log = logEvent.bind(null, verbose)

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

  // Public dir.

  var publicDir = express.static(path.join(__dirname, 'public'))

  app.use(publicDir)

  // Routes.

  app.get('/', function (req, res) {
    res.render('index', {graphPath: graphPath, version: pkg.version})
  })

  /*
  app.get('/graph.json', function (req, res) {
      res.json(graph)
  })
  */

  // Socket.IO events.

  io.on('connection', function (socket) {

    if (verbose)
     console.log('a user connected')

     socket.emit('loadGraph', graph)

    /**
     * On addLink event.
     *
     * @api private
     */

    function addLink (data) {
      log('addLink', data)

      var id = getNextId()

      // Add link to view.
      graph.view.link[id] = data

      // Add pipe.
      graph.pipe[id] = [data.from, data.to]

      data.id = id
      io.emit('addLink', data)

      if (autosave) save(graph)
    }

    socket.on('addLink', addLink)

    /**
     * On addInput event.
     *
     * @api private
     */

    function addInput (data) {
      log('addInput', data)

      var content = data.content || {},
          id      = data.nodeid,
          position = data.position

      if (typeof graph.view.node[id].ins === 'undefined')
        graph.view.node[id].ins = []

      graph.view.node[id].ins.push(content)

      io.emit('addInput', data)

      if (autosave) save(graph)
    }

    socket.on('addInput', addInput)

    /**
     * On addOutput event.
     *
     * @api private
     */

    function addOutput (data) {
      log('addOutput', data)

      var content  = data.content || {},
          id       = data.nodeid,
          position = data.position

      if (typeof graph.view.node[id].outs === 'undefined')
        graph.view.node[id].outs = []

      graph.view.node[id].outs.push(content)

      io.emit('addOutput', data)

      if (autosave) save(graph)
    }

    socket.on('addOutput', addOutput)

    /**
     * On addNode event.
     *
     * @api private
     */

    function addNode (data) {
      log('addNode', data)

      var id  = getNextId()

      // Add node to view.
      graph.view.node[id] = data

      // Add task.
      graph.task[id] = data.text

      // Associate node and task.
      graph.view.node[id].task = id

      io.emit('addNode', data)

      if (autosave) save(graph)
    }

    socket.on('addNode', addNode)

    /**
     * On delLink event.
     *
     * @api private
     */

    function delLink (data) {
      log('delLink', data)

      var id = data.linkid

      delete graph.pipe[id]

      delete graph.view.link[id]

      io.emit('delLink', data)

      if (autosave) save(graph)
    }

    socket.on('delLink', delLink)

    /**
     * On delNode event.
     *
     * @api private
     */

    function delNode (data) {
      log('delNode', data)

      var id = data.nodeid

      delete graph.task[id]

      delete graph.view.node[id]

      io.emit('delNode', data)

      if (autosave) save(graph)
    }

    socket.on('delNode', delNode)

    /**
     * On moveNode event.
     *
     * @api private
     */

    function moveNode (data) {
      log('moveNode', data)

      var id = data.nodeid

      var node = data

      // Update view.
      graph.view.node[id].x = node.x
      graph.view.node[id].y = node.y

      // The moveNode event is fired after that node is actually moved client side,
      // so it should be sent back to all clients except the one that emitted it.
      socket.broadcast.emit('moveNode', data)

      if (autosave) save(graph)
    }

    socket.on('moveNode', moveNode)
  })

  // Start server.

  http.listen(port, function () {
    if (verbose) {
      console.log('Listening on port ' + port)

      if (autosave)
        console.log('Option autosave is on')

      console.log('Editing graph ' + graphPath)
    }
  })
}

module.exports = editorServer

