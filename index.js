// Import stylesheets
import './style.css';
import process from './src/queueProcessing.js';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>JS Starter</h1>
<div>
  <p>
    Clicked: <span id="value">0</span> times
    <button id="increment">+</button>
    <button id="decrement">-</button>
    <button id="incrementAsync">Increment async</button>
  </p>
</div>`;

// and now for some implementation
// use generator functions to create a pipeline
// vanila JS example
async function* counter(input) {
  let state = 0;
  yield { type: "LALALA", value: state }; // you can pass something down the pipeline to initialize
//  yield { type: "VALUE", value: ++state }; //and another they will only be executed once.
  for await (const action of input) {
    console.log(`counter method: action type = ${action.type}`);
    switch (action.type) {
      case "INCREMENT":
        state++;
        action.value = state; // you can manipulate the entree you are processing, make sure you yield the manipulated entree
        break;
      case "DECREMENT":
        state--;
        yield { type: "VALUE", value: state }; //you can introduce an extra entree, goes to the next function in the pipeline
        break;
      default:
        yield { type: "VALUE", value: state };
    }
    yield action; // you have to yield the original action to pass your manipulation
  }
}

var valueEl = document.getElementById("value");

async function* render(input) {
  yield { type: "BASE" }
  yield { type: "TREBBLE"}
  for await (const i of input) {
    console.log(`render method: ${i.type}, val = ${i.value}`)
    if (i.value > -1){
      valueEl.innerHTML = i.value.toString(); //manipulate the DOM for example
    }
    yield i;
  }
}
const endOfPipeline = (name)=> (i) => console.log(`${name}: end of days: waarde ${i.value}, type=${i.type}`); //think about what your messages look like
const store = process(endOfPipeline('store'), counter, render); // order matters
//const reverseStore = process(endOfPipeline('reverseStore'), render, counter); // order matters

document.getElementById("increment").addEventListener("click", function() {
  store.dispatch({ type: "INCREMENT" });
});
document.getElementById("decrement").addEventListener("click", function() {
  store.dispatch({ type: "DECREMENT" });
});
document.getElementById("incrementAsync").addEventListener("click", function() {
  setTimeout(function() {
    store.dispatch({ type: "INCREMENT" });
  }, 1000);
});
