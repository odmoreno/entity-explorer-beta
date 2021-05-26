/*
 *    busqueda.js
 *    Componente para la lista de asambleistas contenidas en el grafico y el buscador de entidades
 */

var LOGO = false

let optionSort = 1
let dictElements ={}

let dictEntidades = {
  'Región': {label: false, name: 'region'},
  'Partido': {label: false, name: 'partidos'},
  'Provincia': {label: false, name: 'provincia'},
}

let entityList = document.getElementById('entity-list');
let listaResultados = document.getElementById('resultadosDiv');



function ListEntitys (nodos) {
  let list = Object.values(nodos)
  LOGO && console.log("LIST:", list)
  list = list.filter(element => element.visitado) 
  //list.sort(value => { return value.visitado ? -1 : 1})
  //entityList.innerHTML = ''
  d3.select('#div-entity').style('height','792px')
  
  const html = list.map(element => 
    `<div  id="e${element.numeroId}"  class="card-list py-2 asamb-list nodrag noselect">
        <div class="d-flex flex-row ml-4 justify-content-between">
          <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

            <svg height="15" width="15" class="mr-3">
              <rect x="5" y="5" 
                    width="12" height="12"
                    rx="2" ry="2" fill="${color(element, colorMap)}" /></svg>

            <span id="z${element.numeroId}" class="${element.visitado ? 'entitySelected': 'entityAway'}"  
                  onmouseover="overEntity(${element.numeroId})" onmouseleave="onLeaveEntity(${element.numeroId})"> 
                    ${element.nombre} </span>
          </div>
          <div class="dropdown no-arrow">
            <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fas fa-ellipsis-h fa-sm fa-fw text-gray-400"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
              <div class="dropdown-header">Opciones:</div>
                <a class="dropdown-item" onclick="removeEntityChart(${element.numeroId})" style="display: ${element.visitado ? 'block': 'none'} ;">Remover del gráfico</a>
                <a class="dropdown-item" id="quitar${element.numeroId}" onclick="quitarResaltado(${element.numeroId})" style="display: ${element.visitado && element.labelFlag ? 'block': 'none'} ;">Quitar resaltado</a>
                <a class="dropdown-item" id="fijar${element.numeroId}" onclick="fijarResaltado(${element.numeroId})" style="display: ${element.visitado && !element.labelFlag ? 'block': 'none'} ;">Fijar resaltado</a>
            </div>
          </div>
        </div>
    </div>`
  ).join('');

  entityList.innerHTML += html
  divTootltip()


}

function divTootltip(){
  const asambsDivs = document.querySelectorAll('.entitySelected');
  LOGO && console.log("tips:", asambsDivs);

  asambsDivs.forEach(change => change.addEventListener("mouseover", function() {
    let id = change.id.substring(1)
    let d = nodosActuales[id]
    //console.log("Change:", id, nodosActuales[id])
    
    tippy(change, {
      allowHTML: true,
      //theme: 'light',
      placement: 'left',
      content: `<div class="d-flex flex-column">
          <span id="asambTip" class="p-1" ><span style='text-transform:capitalize' >Asambleista ${d.tipo == 'nacional' ? d.tipo : ` por ${d.provincia}` }</span></span>
          <span id="votoTip" class="p-1" ><span style='text-transform:capitalize; align-content: center;' >Voto: ${ d.voto }</span></span>
          <span id="partidoTip" class="p-1" ><span style='text-transform:capitalize; align-content: center;' >Partido: ${ d.partido }</span></span>
      </div>`,
      offset: [0, 50],
    });
    const instance = change._tippy;
    //instance.setContent("Updated content!");
  }));
}

function overEntity(id){

  let element = nodosActuales[id]
  if(element.visitado){
    d3.select("#e"+id).style("border", "2px solid orange")
    d3.select("#node"+id).attr("stroke", "orange").attr("stroke-width", 3.0)
    d3.select('#text' + id).attr("visibility", "visible")
  }  

  //tip3.attr('class', 'd3-tip animate').show(element)
}

function onLeaveEntity(id){
  
  let element = nodosActuales[id]
  if(element.visitado && !element.labelFlag){
    d3.select("#e"+id).style("border", "2px solid white")
    d3.select("#node"+id).attr("stroke", "#fff").attr("stroke-width", 0)
    d3.select('#text' + id).attr("visibility", "hidden")
  }
}

/**Opciones de la lista de asambleistas */

function removeEntityChart(id){
  entidades[id].visitado = false
  updateChartEntitys()
  findEntities(valueText)
}

function fijarResaltado(id){
  LOGO && console.log('Fijar ID:', id)
  let nodoCircle = d3.select("#node"+id)
  LOGO && console.log("Stroke:", nodoCircle.style("stroke"))

  nodoCircle.attr("stroke", "orange")
            .attr("stroke-width", 3.0)

  d3.select('#text' + id).attr("visibility", "visible")

  entidades[id].labelFlag = true

  d3.select('#fijar'+id).style("display", "none")
  d3.select('#quitar'+id).style("display", "block")
}


function quitarResaltado(id){
  d3.select("#node"+id).attr("stroke", "#fff").attr("stroke-width", 0)
  d3.select('#text' + id).attr("visibility", "hidden")

  entidades[id].labelFlag = false
  d3.select('#fijar'+id).style("display", "block")
  d3.select('#quitar'+id).style("display", "none")
}

//Fin de las opciones de lista



/**Funciones para ordenar la lista de asambleistas */
function sortByOption(op, nodosDesordenados){

  let list = [... Object.values(nodosDesordenados)]
  //nodos.sort((a, b) => (a.curul > b.curul) ? 1 : ((b.curul > a.curul) ? -1 : 0))
  if(op == 1){
    list.sort((a, b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0))
  }
  else if (op == 2){
    list.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
  }
  else if (op == 3){
    list.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
  }
  else if (op == 4){
    list.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
  }
  else if (op == 5){
    list.sort((a, b) => (a.voto > b.voto) ? 1 : ((b.voto > a.voto) ? -1 : (b.nombre > a.nombre) ? -1 : ((a.nombre > b.nombre) ? 1 : 0)))
  }
  else{
    list.sort((a, b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0))
  }

  LOGO && console.log("sorted: ", list)
  return list
}

function sortHandler(val){
  optionSort = val
  sortFunction(nodosActuales)
}

function sortFunction(nodos){
  let list = sortByOption(optionSort, nodos)
  entityList.innerHTML = ''
  ListEntitys(list)
}

//Fin de funciones de ordenamiento

/**Functiones para el buscador */

function findEntities (searchText) {
  //entityList.innerHTML = ''
  listaResultados.innerHTML = ''
  
  let text = searchText.toLowerCase()
  if(text == 'partidos')
      filterPartidos(searchText, true)     
  else if (text.includes("regi"))
      filterRegion(searchText, true)
  else if ( text.includes("prov") )
      filterProv(searchText, true)    
  else if ( text.includes("comision") )
      filterComisiones(searchText, true)    
  else {
      //entityList.innerHTML = ''
      filterPartidos(searchText, false)
      filterRegion(searchText, false)
      filterProv(searchText, false)
      filterAsams(searchText, false)
      //filterComisiones(searchText, false)
  }
  
  if(searchText === "") listaResultados.innerHTML = ''
}

filterAsams = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = Object.values(nodosActuales).filter(sess => {
      return sess.id.match(regex)
  })
  //console.log("asams filtrados: ", matches)
  //sortFunction(matches)
  outputAsambleistas(matches)
}

filterPartidos = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = []

  if(!flag){
    matches = Object.keys(partidos).filter(partido => {
      return partido.match(regex)
    })
  }else
    matches = Object.keys(partidos)

  //console.log("matches list partidos:", matches)
  let results;
  if(matches.length > 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
  }
  else if(matches.length == 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
    let asambsunitario = results[0][1]
    outputAsambleistas(asambsunitario)
  }
}

buscarPartidosOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsPartidos = Object.values(nodosActuales).filter(sess => {
      return sess.partido.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsPartidos)
    data.push(info)
  })
  return data 
}

filterRegion = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = []
  //matches = Object.keys(regiones).filter(region => {
  //  return region.match(regex)
  //})

  if(!flag){
    matches = Object.keys(regiones).filter(region => {
        return region.match(regex)
    })
  }else
    matches = Object.keys(regiones)

  let results;
  if(matches.length > 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
  }
  else if(matches.length == 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
    let asambsunitario = results[0][1]
    outputAsambleistas(asambsunitario)
  }
}

buscarRegionOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.region.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  //console.log("Regiones:", data)
  return data
}

filterProv = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  
  let matches = []
  //matches = Object.keys(provincias).filter(prov => {
  //  return prov.match(regex)
  //})
  
  if(!flag){
    matches = Object.keys(provincias).filter(prov => {
        return prov.match(regex)
    })
  }else
    matches = Object.keys(provincias)
  
  let results;
  if(matches.length > 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
  }
  else if(matches.length == 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
    let asambsunitario = results[0][1]
    outputAsambleistas(asambsunitario)
  }
}

buscarProvinciasOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.provincia.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  //console.log("Provincias:", data)
  return data  
}

/**Checkear las entidades y meterlas al canvass */
function onGetIdList(id, x , y){
  LOGO && console.log("ADD:", id, x , y)
  let idnew = id.substring(1)
  LOGO && console.log(idnew)

  let element = asambleistas[idnew]

  if(element.visitado == false){
    if (!(element.numeroId in entidades)){
      entidades[element.numeroId] = element
      entidades[element.numeroId].xOffset = x +170
      entidades[element.numeroId].yOffset = y +80
      LOGO && console.log(entidades, d3.values(entidades).length)
    }
    else{
      entidades[element.numeroId].visitado = true
    }
    element.visitado = true
    LOGO && console.log("checked", element.visitado);
    updateNodes()
  }
  else {
    entidades[element.numeroId].visitado = false
    updateNodes()
  }
}

function updateNodes () {

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  LOGO && console.log("newnodes:", newnodes)
  groups = _groups()
  nodes = createNodes(newnodes, groups)
  colorMap = $('#colores-select').val() 

  entityList.innerHTML = ''
  sortFunction(nodosActuales)
  findEntities(valueText)
  d3.timeout(chart, 500)
  //updateTable(nodes)
}

//Add todas las entidades del grupo
function addAllEntities(id, x, y){
  LOGO && console.log("ADD:", id, x , y)
  let idnew = id.substring(1)
  LOGO && console.log(idnew)

  let listElements = dictElements[idnew]
  LOGO && console.log("grupo: ", listElements)
  LOGO && console.log("entidades prev: ", entidades)

  for(let index in listElements){
    let element = listElements[index]
    //console.log(element)
    let idEl = element.numeroId
    entidades[idEl] = element
    entidades[idEl].xOffset = x +170
    entidades[idEl].yOffset = y +80
    entidades[idEl].visitado = true
  }
  LOGO && console.log("entidades next: ", entidades)
  updateNodes()
}



/**Lista de entidades Individuales */
function outputAsambleistas (nodos) {
  let list = Object.values(nodos)
  LOGO && console.log("LIST:", list)
  list.sort(value => { return value.visitado ? 1 : -1})

  if (list.length > 0){
    const header = 
      `<div class="card-listU">
        <a href="#collapseAsambs2" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
          <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">Asambleístas</h6>
        </a>
        <div class="collapse show" id="collapseAsambs2">
          <div id="bodyAsambs2" class="card-body">
          </div>
        </div>
      </div>`

    listaResultados.innerHTML += header
    const html = list.map(element => 
      `<div  id="e${element.numeroId}"  class="card-listU py-1 ${!element.visitado ? 'draggme' : 'nodrag2 noselect'}"
          draggable="${!element.visitado ? true : false}" ondragstart="drag(event)" 
          style="border-bottom-color: ${element.visitado ? color(element, colorMap) : '#e3e6f0'};">

          <div class="d-flex flex-row ml-3 justify-content-between">
            <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

            <svg height="15" width="15" class="mr-3">
                <rect x="5" y="5" 
                  width="12" height="12"
                  rx="2" ry="2" fill="${color(element, colorMap)}" /></svg>

              <span class="${element.visitado ? 'entitySelected': 'entityAway'}"  >
                      ${element.nombre} </span>
            </div>
          </div>
      </div>`
    ).join('');

    let entidadesListCard = document.getElementById('bodyAsambs2');
    entidadesListCard.innerHTML += html
  }
  
}

/**Lista de grupos de entidades */
function outputEntidades (matches, option) {
  /**<div  class=" card py-2 </div> "> */
  const header = 
    `<div class="card-listU">
      <a href="#collapse${option}" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
        <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">${option}</h6>
      </a>
      <div class="collapse show" id="collapse${option}">
        <div id="body-${option}" class="card-body">
        </div>
      </div>
    </div>`

  listaResultados.innerHTML += header

  //console.log('matches:', matches)
  //console.log("name: ", matches[0][0].replaceAll(/\s/g,''))
  let element = dictEntidades[option]
  
  if (matches.length > 0){
    const html = matches.map(match => 
      `<div id="o${match[0].replaceAll(/\s/g,'')}" class="card-listU py-1 ${!element.flag ? 'draggme' : 'nodrag'}" 
        draggable="${!element.flag ? true : false}" ondragstart="drag(event)" 
        
          style="border-bottom-color: ${element.flag ? fillColorByType(match[0], element.name) : '#e3e6f0'};">
        
        <div class="d-flex flex-row ml-3 justify-content-between">
            
          <div  class=" d-flex flex-row l mb-1" style="align-items: center;">
          <svg height="15" width="25" class="mr-1">
              <g stroke="black" stroke-width="1">
                <circle cx="6" cy="6" r="5"  fill="${fillColorByType(match[0], element.name)}" />
                <circle cx="12" cy="6" r="5"  fill="${fillColorByType(match[0], element.name)}" />
                <circle cx="9" cy="10" r="5"  fill="${fillColorByType(match[0], element.name)}" />
              </g>
            </svg>
            <span class="${element.flag ? 'entitySelected': 'entityAway'}"  
                  onmouseover="overEntidades()" onmouseleave="onLeaveEntidades()"> 
                    ${match[0]} </span>
          </div>
          <div class="cantidad">
            <span class="mr-2" style="color: #54575b ; text-transform:capitalize"> (${match[1].length}) Asambs.</span>
          </div>
        </div>
      </div>`
      ).join('');
    //console.log(html)
    let entidadesListCard = document.getElementById('body-'+option);
    //console.log(entidadesListCard)
    //entityList.innerHTML += html
    entidadesListCard.innerHTML += html

    updateDictEntities(matches)
  } 
}

function fillColorByType(d, option){
  let color;
  if (option == 'partidos'){
    color = colorPartidos(partidos[d])
  }
  else if(option == 'region'){
    color = colorRegions(regiones[d])
  }
  else if ( option == "provincia") 
    color = colorProvincias(provincias[d])

  //LOGO && console.log('color')
  return color
}

function updateDictEntities(matches){

  matches.map(match => {
    let code = match[0].replaceAll(/\s/g,'')
    dictElements[code] = match[1]
  })
  LOGO && console.log("dict de entidades :", dictElements)
}

function overEntidades(){}

function onLeaveEntidades(){}

fueradelbuscador = () => {
  pinnedlist.innerHTML = ''
  asambslist.innerHTML = ' '
}

fueradelbuscadorEntidades = () => {
  listaResultados.innerHTML = ''
}

//FIN 


/**FUNCIONES de drag con los resultados y drop con el grafico */
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  console.log("Hola, ingreso de entidad en el svg")
  var data = ev.dataTransfer.getData("text")
  var id = document.getElementById(data)
  var x = ev.offsetX
  var y = ev.offsetY

  let idnew = data.substring(0,1)

  LOGO && console.log(ev)
  LOGO && console.log(data, x, y)
  //console.log(d3.select(ev.target).attr('id'))
  LOGO && console.log(id)
  LOGO && console.log(idnew)
  //onGetIdList(data, x, y)
 // var data = ev.dataTransfer.getData("text");
 // ev.target.appendChild(document.getElementById(data));

  if( idnew == 'e'){
    //Mover una entidad
    onGetIdList(data, x, y)
  }
  else if (idnew == 'o'){
    //Mover un grupo
    LOGO && console.log("Mover muchos ", data)
    addAllEntities(data, x, y)
  }

}




