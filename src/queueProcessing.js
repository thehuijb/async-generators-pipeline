// using reduce to pipe functions together
// expects an array of functions
const pipe = fns => x => { 
  if (fns && fns.length > 0) {
   return fns.reduce((v, fn) => fn(v), x);
  } else {
    return x;
  }
}
const wait = (ms) => {
  return new Promise(function(r) {
    setTimeout(r, ms);
  });
}


// nano framework pass functions to method that you want to execute as part of the process
function process(finalFn, ...fns) {
  let callback;
  const queue = [];
  async function* produce() {
    for (;;) {
      while (queue.length) {
        yield queue.shift();
      }
      await new Promise(i => (callback = i));
      callback = null;
    }
  }
  const producer = produce();

  const consumer = async () => {
    for await (const i of pipe(fns)(producer)) {
      finalFn(i); // anything added to the queue eventually ends up here.
    }
  };
  consumer();
  return {
    dispatch(action) {
      if (callback) {
        callback();
      }
      queue.push(action);
    }
  };
}

// nano framework pass functions to method that you want to execute as part of the process
function processLast(finalFn, ...fns) {
  let callback;
  const queue = [];
  async function* produce() {
    for (;;) {
      while (queue.length) {
        if (queue.length > 1) {
          queue.shift();
          continue;
        }
        await wait(500);
        if (queue.length > 1) {
          continue;
        }
        yield queue.shift();
      }
      await new Promise(i => (callback = i));
      callback = null;
    }
  }
  const producer = produce();

  const consumer = async () => {
    for await (const i of pipe(fns)(producer)) {
      finalFn(i); // anything added to the queue eventually ends up here.
    }
  };
  consumer();
  return {
    dispatch(action) {
      if (callback) {
        callback();
      }
      queue.push(action);
    }
  };
}

export { process, processLast};