// using reduce to pipe functions together
// expects an array of generator functions
const pipeGenerators = fns => x => {
  if (fns && fns.length > 0) {
    return fns.reduce((v, fn) => fn(v), x);
  } else {
    return x;
  }
};

// using reduce to pipe functions together by wrapping them with async generator functions
// expects an array of functions
const pipe = fns => x => {
  if (fns && fns.length > 0) {
    return fns.reduce((v, fn) => {
      return (async function*(input) {
        for await (const i of input) {
          yield fn(i);
        }
      })(v);
    }, x);
  } else {
    return x;
  }
};

const wait = ms => {
  return new Promise(function(r) {
    setTimeout(r, ms);
  });
};

/*
 * async generator will produce the entries in the queue one by one and wait for new entries
 * if onlyLast === true the async generator will produce only the final entry in the queue
 * will skip entries if new entries come in within the given ms (defaults to 500)
 * param - onlyLast if true only get the final entry
 * param -
 */
async function* produce({ onlyLast = false, queue, ref, ms = 500 }) {
  for (;;) {
    while (queue.length) {
      if (onlyLast) {
        if (queue.length > 1) {
          queue.shift();
          continue;
        }
        await wait(ms);
        if (queue.length > 1) {
          continue;
        }
      }
      yield queue.shift(); //yield the first entry in the queue.
    }
    await new Promise(i => (ref.callback = i));
    ref.callback = null;
  }
}

// async function to consume enties produced by the producer and pass them along the pipeline
async function consume(producer, finalFn = () => {}, fns, gen = false) {
  let pipeline = gen ? pipeGenerators(fns) : pipe(fns);
  for await (const i of pipeline(producer)) {
    finalFn(i); // anything added to the queue eventually ends up here.
  }
}

// nano framework passed generator functions are added to the pipeline
function processQueue(finalFn, ...fns) {
  const ref = { callback: null };
  const queue = [];

  const producer = produce({ queue, ref });

  consume(producer, finalFn, fns);

  return {
    dispatch(action) {
      if (ref.callback) {
        ref.callback();
      }
      queue.push(action);
    }
  };
}

function getProducer(onlyLast, ms = 500) {
  return {
    callback: null,
    queue: [],
    [Symbol.asyncIterator]: async function*() {
      for (;;) {
        while (this.queue.length) {
          if (onlyLast) {
            if (this.queue.length > 1) {
              this.queue.shift();
              continue;
            }
            await wait(ms);
            if (this.queue.length > 1) {
              continue;
            }
          }
          yield this.queue.shift();
        }
        await new Promise(i => (this.callback = i));
        this.callback = null;
      }
    }
  };
}

function processEvent(finalFn, ...fns) {
  const gen = getProducer(true);
  consume(gen, finalFn, fns);
  return {
    push(val) {
      if (gen.callback) {
        gen.callback();
      }
      gen.queue.push(val);
    }
  };
}
// nano framework pass generator functions to method that you want to execute as part of the pipeline
function processQueueAsync(finalFn, ...fns) {
  const ref = { callback: null };
  const queue = [];
  const producer = produce({ queue, ref });
  consume(producer, finalFn, fns, true);
  return {
    push(action) {
      if (ref.callback) {
        ref.callback();
      }
      queue.push(action);
    }
  };
}
// nano framework pass generator functions to method that you want to execute as part of the pipeline
function processEventAsync(finalFn, ...fns) {
  const gen = getProducer(true);
  consume(gen, finalFn, fns, true);
  return {
    push(action) {
      if (gen.callback) {
        gen.callback();
      }
      gen.queue.push(action);
    }
  };
}

export { processQueue, processEvent, processQueueAsync, processEventAsync };
