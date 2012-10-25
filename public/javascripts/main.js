/*
    var dflowCursor = document.getElementById('dflow-cursor');
    var dflowGraph = document.getElementById('dflow-graph');

    var dflowAddNode = document.getElementById('dflow-add-node');

    var toggleDiv = function (div) {
      // TODO ritorna true o false se e' visibile oppure no
      // cosi si puo fare if(div.toggle())
      if (div.style.display == 'inline') {
        div.style.display = 'none';
      }
      else if (div.style.display == 'none') {
        div.style.display = 'inline';
      }
      else if (div.style.display == '') {
        div.style.display = 'inline';
      }
    }

    var addNode = function () {
      var nodeDiv = document.createElement('div');
      nodeDiv.className = 'dflow-node';
      nodeDiv.style.left = dflowCursor.style.left;
      nodeDiv.style.top = dflowCursor.style.top;
      nodeDiv.style.height = 50 + 'px';
      nodeDiv.style.width = 100 + 'px';
      dflowGraph.appendChild(nodeDiv);
    }
*/

var $addNode = $('dflow-add-node');
var $cursor = $('dflow-cursor');
var $graph = $('dflow-graph');

var graph = document.getElementById('dflow-graph');

// Put $cursor in the middle of $graph.
$cursor.position({relativeTo:'dflow-graph'});
//$cursor.makeDraggable({container:$graph});

var fakeId = 0;

$addNode.addEvent('click',function(ev){
  ev.stop();
  $cursor.hide();
  /*
  var newNode = new Element('div.dflow-node', {
    styles: {
      border: '1px solid #aaaaaa',
      height: '100px',
      width: '100px'
    }
  });
  newNode.position({relativeTo:'dflow-graph'});
  newNode.setPosition($cursor.getPosition());
  newNode.makeDraggable({container:$graph});
  $graph.inject(newNode);
  newNode.show();
  */
  fakeId++;
  var nodeDivId = 'node-' + fakeId;
  var nodeDiv = document.createElement('div');
  nodeDiv.id = nodeDivId;
  nodeDiv.className = 'dflow-node';
  nodeDiv.style.left = 100 + 'px';
  nodeDiv.style.top = 100 + 'px';
  nodeDiv.style.height = 50 + 'px';
  nodeDiv.style.width = 100 + 'px';
  graph.appendChild(nodeDiv);

  var $node = $(nodeDivId);
  $node.makeDraggable({container:$graph});
});

$graph.addEvent('dblclick',function(ev){
  ev.stop();
  $cursor.toggle();
});

var socket = io.connect();
socket.on('connect', function () { console.log('connect'); });
socket.on('message', function () { console.log('message'); });
socket.on('disconnect', function () { console.log('disconnect'); });
