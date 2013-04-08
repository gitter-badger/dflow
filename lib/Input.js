
var Output = require('./Output.js')
var Slot   = require('./Slot.js')
var util   = require('util')

function Input () {
  var self = this

  var arg = arguments[0] || {}

  Slot.call(self, arg)

  var _source;

  function getSource () { return _source }
  self.getSource = getSource

  function setSource (newSource) {
    if (newSource instanceof Output) {
      _source = newSource
      self.getData = _source.getData
      self.emit('source')
    }
    else {
      // TODO aggiustare eccezioni
      new TypeError()
    }
    //TODO se newSource c'era gia', notifica la oldSource che ti sei staccato
    //si ma fai tutto ad eventi.
  }
  self.setSource = setSource

  setSource(arg.source)

  function isConnected () {
    return _source instanceof Output
  }
  self.isConnected = isConnected

  function inputToJSON () {
    var json = self.slotToJSON()
    json.sourceId = _source.getId() // TODO solo se è collegato
    return json
  }
  self.inputToJSON = inputToJSON
  self.toJSON      = inputToJSON
}

util.inherits(Input, Slot)

module.exports = Input
