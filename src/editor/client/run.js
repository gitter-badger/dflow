var dflow = require('dflow')

var xmlhttp = new window.XMLHttpRequest()

function runGraph () {
  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    var graph = JSON.parse(xmlhttp.responseText)
    var f = dflow.fun(graph)

    try {
      f()
    } catch (err) {
      console.error(err)
    }
  }
}

xmlhttp.onreadystatechange = runGraph
xmlhttp.open('GET', '/graph', true)
xmlhttp.send()
