/** 
 * Timeline de vis.js
 */

 var timeline
 var defaultOptions;

 var selectionVertical = document.getElementById("selectionVertical");
 var selectVertical = document.getElementById("selectVertical");
 var fit = document.getElementById("fit");
 
 var datas;

 // create a handlebars template
 var source = document.getElementById("item-template").innerHTML;
 var template = Handlebars.compile(
   document.getElementById("item-template").innerHTML
 );

 function createDataset(list){

  let items=[];
  let elements = [];

  list.map( item => {
    let fecha = item.fecha.split('-')
    let hora = item.hora.split(':')
    
    let node = {
      'id': item.sesId,
      'className': item.anio == '2017' ? 'orange' : (item.anio == '2018' ? 'green' : (item.anio == '2019' ? 'red' : (item.anio == '2020' ? 'magenta' : 'default') ) ),
      'group': item.anio,
      'content': getContent(item),
      'asunto': item.asunto,
      'title': item.name,
      "type": "box",
      'start': new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), parseInt(hora[0]), parseInt(hora[1]) ),
      'end' : new Date( parseInt(fecha[0]), parseInt(fecha[1]-1), parseInt(fecha[2]), 23, 59 ),
    }

    elements.push(node)
  })

  /**
   * <div>Conversation</div><img src="../resources/img/community-users-icon.png" style="width:32px; height:32px;">'
   * '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"><label class="form-check-label" for="flexCheckDefault">Default checkbox</label></div>',

   *  '<div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault"><label class="form-check-label" for="flexCheckDefault">'
       + item.name + '</label></div>',
   */
  console.log("items timeline:", elements)
  //console.log('dataset:', Object.values(elements))
  items = new vis.DataSet(elements);
  return items
}

function getContent2(item){
  var itemDiv = document.createElement("div");
  itemDiv.className = "form-check"
  
  var span3 = document.createElement("label");
  span3.className = "form-check-label textbox";
  span3.for = "h"+item.sesId
  span3.appendChild(document.createTextNode(item.asunto));
  itemDiv.appendChild(span3);

  return itemDiv
}


function getContent(item){
  var itemDiv = document.createElement("div");
  itemDiv.className = "form-check"
  var check = document.createElement("input");
  check.className = "form-check-input"
  check.type = "checkbox";
  check.id =  "h"+item.sesId
  //check.checked = true
  //console.log("create:", item.sesId)
  //getIdSes(item.sesId)
  //check.setAttribute("onclick", oncheckItem(item.sesId));
  
  check.addEventListener('click', (event, item) => {
    console.log('event:', event)
    console.log(event.target, event.target.id)
    
    let id = event.target.id
    let sId = event.target.id.substring(1)

    let inputTag = d3.select("#"+id)
    //let div = inputTag.node().parentNode;
    //let div2 = inputTag.node().closest(".vis-readonly");
    let parent = inputTag.select(function() {
      return this.closest(".vis-readonly");  // Get the closest parent matching the selector string.
    });
    console.log(parent.attr('class'))

    if (d3.select("#"+id).property("checked")) {
      console.log("checked")
      getIdSes(sId)
      parent.style('opacity', 1)
    }
    else{
      console.log("Deschecked")
      removeCircle(sId)
      removeSes(sId)
      parent.style('opacity', 0.5)
    }
  });

  itemDiv.appendChild(check);
  

  var span3 = document.createElement("label");
  span3.className = "form-check-label textbox";
  span3.for = "h"+item.sesId
  span3.appendChild(document.createTextNode(item.asunto));
  itemDiv.appendChild(span3);

  return itemDiv
}


function createTimelineEvents(){
  let sesionesList = Object.values(sesiones) 
  //console.log(sesionesList)
//
  //let newList = [... sesionesList]

  let items = createDataset(sesionesList)

  datas = new vis.DataSet([]);

  // create visualization
  var container = document.getElementById("timelineVis");
  
  defaultOptions = {
    editable: {
      add: true,
    },
    //selectable: true, 
    //multiselect: true,
    //sequentialSelection: true,
    stack: false,
    showCurrentTime: true,
    //verticalScroll: true,
    horizontalScroll: true,
    zoomKey: "shiftKey",
    height: "400px",
    maxHeight : '500px',
    orientation: 'top',
    min: new Date(2017, 4, 1), // lower limit of visible range
    max: new Date(2021, 5, 20),
    //max: new Date(2021, 6, 24), // upper limit of visible range
    zoomFriction: 4,
    moveable: true,
    zoomable: true,
    //zoomMin: 1000 * 60 * 60 * 24 ,//*31, // one day in milliseconds
    //zoomMax: 1000 * 60 * 60 * 24 * 31 * 9, // about three months in milliseconds
    tooltip: {
      followMouse: true,
    },
    onDropObjectOnItem: function (objectData, item, callback) {
      console.log("ondrop:", objectData, item)
      if (!item) {
        return;
      }
      alert(
        'dropped object with content: "' +
          objectData.content +
          '" to item: "' +
          item.content +
          '"'
      );
    },
    onAdd: function (item, callback) {
      console.log("ONadd:", item)
      callback(item)
    },
  };
  
  timeline = new vis.Timeline(container);
  timeline.setOptions(defaultOptions);
  timeline.setItems(datas);

  //timeline.on("select", function (properties) {
  //  //logEvent("select", properties);
  //  console.log(timeline.getSelection())
  //  console.log("select", properties)
  //  timeline.focus(timeline.getSelection());
  //  //timeline.setSelection(timeline.getSelection(), { focus: true });
//
  //});

  //timeline.on("click", function (properties) {
  //  console.log("Click", properties)
  //  //var id = properties.item
  //  //if(id != null)
  //  //  getIdSes(id)
  //});

}

//selectVertical.onclick = function () {
//  var ids = selectionVertical.value
//  console.log("HOLA CLICK", ids)
//  timeline.focus(parseInt(ids));
//}

//fit.onclick = function () {
//  timeline.fit();
//};

