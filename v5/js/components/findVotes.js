
/**Zona para buscar votaciones */

const votesList = document.getElementById('votesList');

function searchSesiones(searchText) {
    
  let word = validateInput(searchText)
  LOGO && console.log("search: ", word)
  let ses = Object.values(sesiones)
  
  let matches = filterData(word, ses)
 
  if (searchText.length === 0) {
      matches = []
      votesList.innerHTML = ''
  }
  if (matches.length > 13)
      matches = matches.slice(0, 13)

      LOGO && console.log("data:", matches)
  outputSesiones(matches)
}

//valida si ingreso algun numero que pueda ser una sesion
function validateInput (text) {
    let value = text
    let searchSes = text.split(" ")
    numberFlag = false
    //asuntoFlag = true
    searchSes.forEach(function (word) {
        let num1 = parseInt(word)
        LOGO && console.log(num1)
        if(!isNaN(num1)){
            LOGO && console.log("Es un numero: ", num1)
            value = word
            numberFlag = true
            //asuntoFlag = false
        }
    })
    return value
  } 
  
  
  function filterData (text, ses) {
    sesFlag = false
    let matches1 = []
    let matches2 = ses.filter(sess => {
        const regex2 = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
        //console.log(regex2)
        //sess.asunto.match(regex2) .replace(regex2, '<b>'+text+'</b>')
        
        return sess.asunto.match(regex2)
    });
    if(numberFlag == true){
        //filtrar por sesion
        matches1 = ses.filter(sess => {
            const regex = new RegExp(`^${text}`, 'gi')
            //console.log(regex)
            let sesionN = sess.sesion.toString();
            if(sesionN === text) sesFlag = true
            return sesionN.match(regex) 
        });
    }
    LOGO && console.log("Sesiones:", matches1)
    LOGO && console.log("Asuntos:", matches2)
    if(matches1.length > 0) {
        //sesFlag = true
        matches1.sort((a,b) => (a.votacion > b.votacion) ? 1 : ((b.votacion > a.votacion) ? -1 : 0))
        return matches1
    }
    else{
        LOGO && console.log(matches2)
        let words = matches2.map(match => {
            var newtext = match.asunto.replace(text, '<b>'+text+'</b>')
            //console.log(newtext)
            match.bold = newtext
            return match
        })
        LOGO && console.log(words)
        return words
    }
    
  }

  
function outputSesiones(matches) {
  if (matches.length > 0) {
      const html = matches.map(match =>
        `<div class="d-flex flex-row">
            <div class="list-group-item list-group-item-action mb-1 ">
                <input class="mr-2" type="checkbox" value="" id="ih${match.sesId}" onclick="checkSes(${match.sesId})">
                <a id=${match.sesId} onclick="findsesion(${match.sesId})">
                    ${ sesFlag ? ' ': `<span style="color: #034EA2; font-weight: bold;"> Sesión ${match.sesion}</span>`}
                    <span style="color: #034EA2; font-weight: bold;"> Votación ${match.votacion}</span>
                    <span style="color: #54575b;"> (${match.fecha} ${match.hora}): </span>
                    <span> ${ match.bold ? match.bold : match.asunto } ... </span> 
                </a>
            </div>
        </div>`).
      join('');
      //console.log(html)
      // matchList.innerHTML = html 
      votesList.innerHTML = html
  } else{
      const noData = ` <div class="d-flex justify-content-center" style="margin: auto">
                          <span style="color: #034EA2; font-weight: bold; margin-top: 20px;"> No hay resultados </span>
                      </div>`
      votesList.innerHTML = noData;
  }
}


function findsesion(id){
    timeline.setSelection(id, { focus: true });
    //timeline.focus(id);
}

function checkSes(id) {  
    console.log("Checkses:", id)

    let inputTag = d3.select("#h"+id) //Checkbox del timeline
    let parent = inputTag.select(function() {
      return this.closest(".vis-readonly");  // Get the closest parent matching the selector string.
    });

    if (d3.select("#ih"+id).property("checked")) { //checkbox del buscador
        console.log("checked")
        getIdSes(id)
        parent.style('opacity', 1)
        inputTag.property('checked', true);
      }
      else{
        console.log("Deschecked")
        removeCircle(id)
        removeSes(id)
        parent.style('opacity', 0.5)
        inputTag.property('checked', false);
      }
}