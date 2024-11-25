import wasmInit from "./pkg/wasm_audio_processing.js";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const numberOfSamples = 1024;
const audioBuffer = audioContext.createBuffer(
  2,
  numberOfSamples,
  audioContext.sampleRate
);

const originalAudioSamples = new Float32Array(numberOfSamples);
const amplifiedAudioSamples = new Float32Array(numberOfSamples);

const floatSamplesToByteSamples = floatSamples => {
  const byteSamples = new Uint8Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
    const diff = floatSamples[i] * 127;
    byteSamples[i] = 127 + diff;
  }
  return byteSamples;
};

const byteSamplesToFloatSamples = byteSamples => {
  const floatSamples = new Float32Array(byteSamples.length);
  for (let i = 0; i < byteSamples.length; i++) {
    const byteSample = byteSamples[i];
    const floatSample = (byteSample - 127) / 127;
    floatSamples[i] = floatSample;
  }
  return floatSamples;
};

const runWasm = async () => {
  const rustWasm = await wasmInit("./pkg/wasm_audio_processing_bg.wasm");

  const wasmByteMemoryArray = new Uint8Array(rustWasm.memory.buffer);

  const sampleValue = 0.3;
  for (let i = 0; i < numberOfSamples; i++) {
    if (i < numberOfSamples / 2) {
      originalAudioSamples[i] = sampleValue;
    } else {
      originalAudioSamples[i] = sampleValue * -1;
    }
  }

  const originalByteAudioSamples = floatSamplesToByteSamples(
    originalAudioSamples
  );

  const inputPointer = rustWasm.get_input_buffer_pointer();
  wasmByteMemoryArray.set(originalByteAudioSamples, inputPointer);

  rustWasm.amplify_audio();

  const outputPointer = rustWasm.get_output_buffer_pointer();
  const outputBuffer = wasmByteMemoryArray.slice(
    outputPointer,
    outputPointer + numberOfSamples
  );

  amplifiedAudioSamples.set(byteSamplesToFloatSamples(outputBuffer));

};
runWasm();

function beforePlay() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

let audioBufferSource = undefined;
function stopAudioBufferSource() {
  if (audioBufferSource) {
    audioBufferSource.stop();
    audioBufferSource = undefined;
  }
}
function createAndStartAudioBufferSource() {
  stopAudioBufferSource();

  audioBufferSource = audioContext.createBufferSource();
  audioBufferSource.buffer = audioBuffer;
  audioBufferSource.loop = true;

  audioBufferSource.connect(audioContext.destination);
  audioBufferSource.start();
}

window.playOriginal = () => {
  beforePlay();
  audioBuffer.getChannelData(0).set(originalAudioSamples);
  audioBuffer.getChannelData(1).set(originalAudioSamples);

  createAndStartAudioBufferSource();
};

window.playAmplified = () => {
  beforePlay();
  audioBuffer.getChannelData(0).set(amplifiedAudioSamples);
  audioBuffer.getChannelData(1).set(amplifiedAudioSamples);

  createAndStartAudioBufferSource();
};

window.pause = () => {
  beforePlay();
  stopAudioBufferSource();
};