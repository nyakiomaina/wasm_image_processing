use wasm_bindgen::prelude::*;

const CHECKERBOARD_SIZE: usize = 20;
const OUTPUT_BUFFER_SIZE: usize = CHECKERBOARD_SIZE * CHECKERBOARD_SIZE * 4;
static mut OUTPUT_BUFFER: [u8; OUTPUT_BUFFER_SIZE] = [0; OUTPUT_BUFFER_SIZE];

#[wasm_bindgen]
pub fn get_output_buffer_pointer() -> *const u8 {
    let pointer: *const u8;
    unsafe {
        pointer = OUTPUT_BUFFER.as_ptr();
    }

    return pointer;
}

#[wasm_bindgen]
pub fn generate_checker_board(
    dark_value_red: u8,
    dark_value_green: u8,
    dark_value_blue: u8,
    light_value_red: u8,
    light_value_green: u8,
    light_value_blue: u8
    ) {

    for y in 0..CHECKERBOARD_SIZE {
        for x in 0..CHECKERBOARD_SIZE {
            let mut is_dark_square: bool = true;

            if y % 2 == 0 {
                is_dark_square = false;
            }

            if x % 2 == 0 {
                is_dark_square = !is_dark_square;
            }

            let mut square_value_red: u8 = dark_value_red;
            let mut square_value_green: u8 = dark_value_green;
            let mut square_value_blue: u8 = dark_value_blue;
            if !is_dark_square {
                square_value_red = light_value_red;
                square_value_green = light_value_green;
                square_value_blue = light_value_blue;
            }

            let square_number: usize = y * CHECKERBOARD_SIZE + x;
            let square_rgba_index: usize = square_number * 4;

            unsafe {
                OUTPUT_BUFFER[square_rgba_index + 0] = square_value_red; // Red
                OUTPUT_BUFFER[square_rgba_index + 1] = square_value_green; // Green
                OUTPUT_BUFFER[square_rgba_index + 2] = square_value_blue; // Blue
                OUTPUT_BUFFER[square_rgba_index + 3] = 255; // Alpha
            }
        }
    }
}