/** 
 * Timeline de vis.js
 */

var timeline
var groupsTimeline = new vis.DataSet([
  { id: '2017', content: "2017", value: 1 },
  { id: '2018', content: "2018", value: 2 },
  { id: '2019', content: "2019", value: 3 },
  { id: '2020', content: "2020", value: 4 },
]);

function createDataset(list){

  let items=[];
  let elements = [];

  list.map( item => {
    let fecha = item.fecha.split('-')
    let hora = item.hora.split(':')
    //console.log("fecha", fecha)
    let node = {
      'id': item.sesId,
      'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? "default" : 'magenta') ) ),
      'group': item.anio,
      'content': item.name,
      'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
      //'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]), parseInt(fecha[2]), 23, 59 ),
    }

    elements.push(node)
  })

  console.log("items timeline:", elements)
  //console.log('dataset:', Object.values(elements))

  items = new vis.DataSet(elements);

  return items
}

function createTimelineEvents(){
  let sesionesList = Object.values(sesiones) 
  console.log(sesionesList)

  let newList = [... sesionesList]

  let items = createDataset(newList)

  // create visualization
  var container = document.getElementById("areabuscadordeSesiones1");
  var options = {
    // option groupOrder can be a property name or a sort function
    // the sort function must compare two groups and return a value
    //     > 0 when a > b
    //     < 0 when a < b
    //       0 when a == b
    groupOrder: function (a, b) {
      return a.value - b.value;
    },
    editable: false,
    multiselect: true,
    sequentialSelection: true,
    height: "450px",
    orientation: 'top',
    min: new Date(2017, 0, 1), // lower limit of visible range
    max: new Date(2020, 12, 24), // upper limit of visible range
    //zoomMin: 1000 * 60 * 60 * 24, // one day in milliseconds
    //zoomMax: 1000 * 60 * 60 * 24 * 31 * 3, // about three months in milliseconds
    cluster: {
      titleTemplate:
        "El Cluster contiene {count} votos. Haga Zoom in para ver los votos individuales.",
      showStipes: true,
    },
  
  };
  
  
  timeline = new vis.Timeline(container);
  timeline.setOptions(options);
  timeline.setGroups(groupsTimeline);
  timeline.setItems(items);
  //timeline.focus(20)

}

//selectVertical.onclick = function () {
//  var ids = selectionVertical.value.split(",").map(function (value) {
//    return value.trim();
//  });
//  var ids2 = selectionVertical.value
//  console.log(ids2)
//  timeline.focus(ids2)
//  //timeline.setSelection(ids, { focus: focus.checked });
//};
//