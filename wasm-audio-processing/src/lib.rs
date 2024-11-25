use wasm_bindgen::prelude::*;

const NUMBER_OF_SAMPLES: usize = 1024;

static mut INPUT_BUFFER: [u8; NUMBER_OF_SAMPLES] = [0; NUMBER_OF_SAMPLES];
static mut OUTPUT_BUFFER: [u8; NUMBER_OF_SAMPLES] = [0; NUMBER_OF_SAMPLES];

#[wasm_bindgen]
pub fn get_input_buffer_pointer() -> *const u8 {
    let pointer: *const u8;
    unsafe {
        pointer = INPUT_BUFFER.as_ptr();
    }

    return pointer;
}

#[wasm_bindgen]
pub fn get_output_buffer_pointer() -> *const u8 {
    let pointer: *const u8;
    unsafe {
        pointer = OUTPUT_BUFFER.as_ptr();
    }

    return pointer;
}

#[wasm_bindgen]
pub fn amplify_audio() {

    for i in 0..NUMBER_OF_SAMPLES {
        let mut audio_sample: u8;
        unsafe {
            audio_sample = INPUT_BUFFER[i];
        }

        if audio_sample > 127 {
            let audio_sample_diff = audio_sample - 127;
            audio_sample = audio_sample + audio_sample_diff;
        } else if audio_sample < 127 {
            audio_sample = audio_sample / 2;
        }
        unsafe {
            OUTPUT_BUFFER[i] = audio_sample;
        }
    }
}