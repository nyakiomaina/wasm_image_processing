import wasmInit from "./pkg/wasm_image_processing.js";

const runWasm = async () => {
  const rustWasm = await wasmInit("./pkg/wasm_image_processing_bg.wasm");

  const wasmByteMemoryArray = new Uint8Array(rustWasm.memory.buffer);

  const canvasElement = document.querySelector("canvas");

  const canvasContext = canvasElement.getContext("2d");
  const canvasImageData = canvasContext.createImageData(
    canvasElement.width,
    canvasElement.height
  );

  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const getDarkValue = () => {
    return Math.floor(Math.random() * 100);
  };
  const getLightValue = () => {
    return Math.floor(Math.random() * 127) + 127;
  };

  const drawCheckerBoard = () => {
    const checkerBoardSize = 20;

    rustWasm.generate_checker_board(
      getDarkValue(),
      getDarkValue(),
      getDarkValue(),
      getLightValue(),
      getLightValue(),
      getLightValue()
    );

    const wasmByteMemoryArray = new Uint8Array(rustWasm.memory.buffer);

    const outputPointer = rustWasm.get_output_buffer_pointer();
    const imageDataArray = wasmByteMemoryArray.slice(
      outputPointer,
      outputPointer + checkerBoardSize * checkerBoardSize * 4
    );
    canvasImageData.data.set(imageDataArray);

    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasContext.putImageData(canvasImageData, 0, 0);
  };

  drawCheckerBoard();
  setInterval(() => {
    drawCheckerBoard();
  }, 1000);
};
runWasm();