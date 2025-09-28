export const checkValue = (name, controlsLength) => {
    /* find outs current status of all radio buttons of corresponding IE and return a string which will be sent to IE
    Example String: op1:1-op2:1-op3:1-op4:1
    */
    let opString = "";
    for (let i = 1; i <= controlsLength; i++) {
      opString += `op${i}:${
        document.querySelector(`input[aria-label="${name}-${i}"]`).checked ? 1 : 0
      }${i !== controlsLength ? "-" : ""}`;
    }
    return String(opString);
  };