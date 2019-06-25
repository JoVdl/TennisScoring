import React from 'react';
import * as ReactDOM from "react-dom";
import './App.css';
import * as Redux from "redux";

const matchInitialState = [{
    idJoueur: 0,
    nomJoueur: 'R. Federer',
    score_setEnCours: 0,
    score: {
        nbSet: 0,
        score_set1: 0,
        score_set2: 0,
        score_set3: 0,
        score_set4: 0,
        score_set5: 0,
    },
    score_jeu: 0,
    score_tieBreak: 0,
    setResult: "",
}, {
    idJoueur: 1,
    nomJoueur: 'R. Nadal',
    score_setEnCours: 0,
    score: {
        nbSet: 0,
        score_set1: 0,
        score_set2: 0,
        score_set3: 0,
        score_set4: 0,
        score_set5: 0,
    },
    score_jeu: 0,
    score_tieBreak: 0,
    setResult: "",
}]

let setEnCours = 1
let nomVainqueur = ""
let matchTerminé = false
let tieBreakOn = false

function match(state = matchInitialState, action) {
  if (action.type === 'ADD_POINT') {
      if(matchTerminé === false) {
          const idAdversaire = (action.idJoueur === 0) ? 1 : 0
          if (tieBreakOn === true) {
              console.log("TB + 1", state[action.idJoueur].score_jeu, state[idAdversaire].score_jeu)
              state[action.idJoueur].score_jeu ++
              if (state[action.idJoueur].score_jeu >= 7 && state[action.idJoueur].score_jeu - 1 > state[idAdversaire].score_jeu ) {
                  tieBreakOn = false
                  state[action.idJoueur].score_setEnCours ++
                  state[action.idJoueur].score_setEnCours += "," + state[action.idJoueur].score_jeu
                  state[idAdversaire].score_setEnCours += "," + state[idAdversaire].score_jeu
                  finSet(state,action.idJoueur,idAdversaire)
              }
          } else {
              switch (state[action.idJoueur].score_jeu) {
                  case 0:
                      state[action.idJoueur].score_jeu = 15;
                      break;
                  case 15:
                      state[action.idJoueur].score_jeu = 30;
                      break;
                  case 30:
                      state[action.idJoueur].score_jeu = 40;
                      break;
                  case 40:
                      switch (state[idAdversaire].score_jeu) {
                          case 40:
                              state[action.idJoueur].score_jeu = "AV"
                              break;
                          case "AV":
                              state[idAdversaire].score_jeu = 40
                              break;
                          default:
                              addJeu(state,action.idJoueur,idAdversaire)
                      }
                      break;
                  case "AV":
                      addJeu(state,action.idJoueur,idAdversaire)
                      break;
              }
          }
      }
      return state
  }
  return state
}

function addJeu(state, idJoueur, idAdversaire) {
    state[idJoueur].score_setEnCours ++
    console.log(state[idJoueur].score_setEnCours, state[idAdversaire].score_setEnCours)
    // Set toujours en cours
    if (state[idJoueur].score_setEnCours >= 6 && state[idJoueur].score_setEnCours > state[idAdversaire].score_setEnCours + 1){
        finSet(state, idJoueur, idAdversaire)
    } else {
        // Reset du jeu en cours
        state[idJoueur].score_jeu = 0
        state[idAdversaire].score_jeu = 0
        if (state[idJoueur].score_setEnCours === 6 && state[idAdversaire].score_setEnCours === 6) {
            // tie break
            tieBreakOn = true
            console.log("Tie break")
        }
    }
    return state 
}

function finSet(state, idJoueur, idAdversaire) {
    // Set terminé
    // Assign le résultat du set terminé
    state[idJoueur].score.nbSet ++

    state[idJoueur].score["score_set" + setEnCours] = state[idJoueur].score_setEnCours
    state[idJoueur].setResult += "W"
    state[idAdversaire].score["score_set" + setEnCours] = state[idAdversaire].score_setEnCours
    state[idAdversaire].setResult += "L"
    // Reset du set en cours
    state[idJoueur].score_setEnCours = 0
    state[idAdversaire].score_setEnCours = 0
    // Reset du jeu en cours
    state[idJoueur].score_jeu = 0
    state[idAdversaire].score_jeu = 0

    setEnCours ++
    checkFinPartie(state)
}

function checkFinPartie(state) {
    for (let i = 0; i < state.length; i++) {
        if(state[i].score.nbSet === 3) {
            nomVainqueur = state[i].nomJoueur
            matchTerminé = true
            console.log("Fin du match -  Vainqueur : " + nomVainqueur)
        }
    }
}

const store = Redux.createStore(
    Redux.combineReducers({
        match
    })
)

function App() {
  return (
  <div className="scoreBoard">
      <p className={matchTerminé !== false ? 'partieTerminé' : 'set'}>Match terminé - Victoire : {nomVainqueur}</p>
      { store.getState().match.map((match) => (
        <tr className="ligneJoueur">
              <td className="nom" onClick={() => store.dispatch({
                  type: "ADD_POINT",
                  idJoueur: match.idJoueur,
              })}>
                  {match.nomJoueur}
              </td>
              <td className={setEnCours > 1 ? 'setTerminé' : 'set'}><p className={match.setResult.charAt(0) === "L" ? "setPerdu" : "setGagné"}>{match.score.score_set1.toString().substring(0,1)}<p className="scoreTieBreak">{match.score.score_set1.toString().substring(2) !== "" ? "(" + match.score.score_set1.toString().substring(2) + ")" : ""}</p></p></td>
              <td className={setEnCours > 2 ? 'setTerminé' : 'set'}><p className={match.setResult.charAt(1) === "L" ? "setPerdu" : "setGagné"}>{match.score.score_set2.toString().substring(0,1)}<p className="scoreTieBreak">{match.score.score_set2.toString().substring(2) !== "" ? "(" + match.score.score_set2.toString().substring(2) + ")" : ""}</p></p></td>
              <td className={setEnCours > 3 ? 'setTerminé' : 'set'}><p className={match.setResult.charAt(2) === "L" ? "setPerdu" : "setGagné"}>{match.score.score_set3.toString().substring(0,1)}<p className="scoreTieBreak">{match.score.score_set3.toString().substring(2) !== "" ? "(" + match.score.score_set3.toString().substring(2) + ")" : ""}</p></p></td>
              <td className={setEnCours > 4 ? 'setTerminé' : 'set'}><p className={match.setResult.charAt(3) === "L" ? "setPerdu" : "setGagné"}>{match.score.score_set4.toString().substring(0,1)}<p className="scoreTieBreak">{match.score.score_set4.toString().substring(2) !== "" ? "(" + match.score.score_set4.toString().substring(2) + ")" : ""}</p></p></td>
              <td className={setEnCours > 5 ? 'setTerminé' : 'set'}><p className={match.setResult.charAt(4) === "L" ? "setPerdu" : "setGagné"}>{match.score.score_set5.toString().substring(0,1)}<p className="scoreTieBreak">{match.score.score_set5.toString().substring(2) !== "" ? "(" + match.score.score_set5.toString().substring(2) + ")" : ""}</p></p></td>
              <td className="setEnCours">{match.score_setEnCours}</td>
              <td className="jeuEnCours">{match.score_jeu}</td>
        </tr>
      ))}
  </div>
  )
}


function render() {
    ReactDOM.render(<App/>, document.getElementById('root'))
}

store.subscribe(render)

export default App;
