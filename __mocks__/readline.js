const readline = jest.genMockFromModule("readline");

let mockResult = "n";

function __setResult(result) {
  mockResult = result;
}

function createInterface() {
  return {
    question: (_, cb) => cb(mockResult),
    close: () => null
  };
}

readline.__setResult = __setResult;
readline.createInterface = createInterface;

module.exports = readline;
