// Import stylesheets
import "./style.css";
import { processQueueAsync, processEvent } from "./src/queueProcessing.js";

// Write Javascript code!
const appDiv = document.getElementById("app");
appDiv.innerHTML = `<h1>JS Starter</h1>
<div>
  <p>
    Clicked: <span id="value">0</span> times
    <button id="increment">+</button>
    <button id="decrement">-</button>
    <button id="incrementAsync">Increment async</button>
  </p>
</div>
<div>
  <radiogroup id="radiogroup" class="wide-select">
    <label><input type="radio" name="radio" value="a">A</label>
    <label><input type="radio" name="radio" value="b">B</label>
    <label><input type="radio" name="radio" value="c">C</label>
    <label><input type="radio" name="radio" value="d">D</label>
    <label><input type="radio" name="radio" value="e">E</label>
    <label><input type="radio" name="radio" value="f">F</label>
    <label><input type="radio" name="radio" value="g">G</label>
    <label><input type="radio" name="radio" value="h">H</label>
    <label><input type="radio" name="radio" value="i">I</label>
    <label><input type="radio" name="radio" value="j">J</label>
    <label><input type="radio" name="radio" value="k">K</label>
    <label><input type="radio" name="radio" value="l">L</label>
    <label><input type="radio" name="radio" value="m">M</label>
    <label><input type="radio" name="radio" value="n">N</label>
    <label><input type="radio" name="radio" value="o">O</label>
    <label><input type="radio" name="radio" value="p">P</label>
    <label><input type="radio" name="radio" value="q">Q</label>
    <label><input type="radio" name="radio" value="r">R</label>
    <label><input type="radio" name="radio" value="s">S</label>
    <label><input type="radio" name="radio" value="t">T</label>
    <label><input type="radio" name="radio" value="u">U</label>
    <label><input type="radio" name="radio" value="v">V</label>
    <label><input type="radio" name="radio" value="w">W</label>
    <label><input type="radio" name="radio" value="x">X</label>
    <label><input type="radio" name="radio" value="y">Y</label>
    <label><input type="radio" name="radio" value="z">Z</label>
  </radiogroup>
</div>
<div>
  <button id="btn1" type="button">One!</button>
  <button id="btn2" type="button">Two!</button>
  <button id="btn3" type="button">Three!</button>
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
        action.value = state; // you can manipulate the entry you are processing, make sure you yield the manipulated entry
        if (state % 3 === 0)
          yield action;
        break;
      case "DECREMENT":
        state && state--;
        yield { type: "VALUE", value: state }; //you can introduce an extra entry, goes to the next function in the pipeline
        break;
      default:
        yield { type: "VALUE", value: state };
    }
    //yield action; // you have to yield the original action to pass your manipulation
  }
}

var valueEl = document.getElementById("value");

async function* render(input) {
  yield { type: "BASE" };
  yield { type: "TREBBLE" };
  for await (const i of input) {
    console.log(`render method: ${i.type}, val = ${i.value}`);
    if (i.value > -1) {
      valueEl.innerHTML = i.value.toString(); //manipulate the DOM for example
    }
    yield i;
  }
}
const endOfPipeline = name => i =>
  console.log(`${name}: end of days: waarde ${i.value}, type=${i.type}`); //think about what your messages look like
const store = processQueueAsync(endOfPipeline("store"), counter, render); // order matters

//const reverseStore = process(endOfPipeline('reverseStore'), render, counter); // order matters

async function* part1(input) {
  for await (const i of input) {
    console.log(`part 1: ${i}`);
    switch (i) {
      case "g":
        yield i.toUpperCase();
        break;
      default:
        yield i;
    }
  }
}

function part2(input) {
  console.log(`part 2: ${input}`);
  switch (input) {
    case "g":
      return input.toUpperCase();
    default:
      return input;
  }
}
function part3(input) {
  console.log(`part 3: ${input}`);
  switch (input) {
    case "h":
      return input.toUpperCase() + "ello";
    default:
      return input;
  }
}

let val = "";
const eventProcessor = processEvent(
  v => {
    if (val !== v) {
      console.log(`val: ${val} => ${v}`);
      val = v;
    }
  },
  part2,
  part3
);

document.getElementById("radiogroup").addEventListener("change", function(e) {
  eventProcessor.push(e.target.value);
});
document.getElementById("increment").addEventListener("click", function() {
  store.push({ type: "INCREMENT" });
});
document.getElementById("decrement").addEventListener("click", function() {
  store.push({ type: "DECREMENT" });
});
document.getElementById("incrementAsync").addEventListener("click", function() {
  setTimeout(function() {
    store.push({ type: "INCREMENT" });
  }, 1000);
});

// and now for some implementation
// use generator functions to create a pipeline
// vanila JS example
async function* buttonPress(input) {
  let onePressedState = false;
  let twoPressedState = false;
  let threePressedState = false;
  yield { value: onePressedState && twoPressedState && threePressedState, type: "state" }; // you can pass something down the pipeline to initialize
  //  yield { type: "VALUE", value: ++state }; //and another they will only be executed once.
  for await (const action of input) {
    console.log(`buttonPress method: action buttonId = ${action.id}`);
    switch (action.id) {
      case "btn1":
        onePressedState = true;
        setTimeout(() => {
          onePressedState = false;
        },2000); // 2seconds to press the rest
        break;
      case "btn2":
        twoPressedState = true;
        setTimeout(() => {
          twoPressedState = false;
        },2000); // 2seconds to press the rest
        break;
      case "btn3":
        threePressedState = true;
        setTimeout(() => {
          threePressedState = false;
        },2000); // 2seconds to press the rest
        break;
    }
    console.log(`one: ${onePressedState}, two: ${twoPressedState}, three: ${threePressedState}`);
    if (onePressedState && twoPressedState && threePressedState)
      yield { value: onePressedState && twoPressedState && threePressedState, type: "state" };
  }
}
const buttonFlow = processQueueAsync(endOfPipeline("buttonFlow"), buttonPress);
const buttons = document.querySelectorAll('button[type=button]');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttonFlow.push({ id: button.id, type: "press" });
  });
})
