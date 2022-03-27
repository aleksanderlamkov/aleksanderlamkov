function error(msg, detail = false) {
  if (detail) {
    console.debug('Detail: ', detail);
  }
  throw new Error(msg);
}

export {error};