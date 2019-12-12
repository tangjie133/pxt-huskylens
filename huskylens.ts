// 在此处添加您的代码
enum Content1 {
    //% block="X coordinates"
    X = 1,
    //% block="Y coordonates"
    Y = 2,
    //% block="object lenght"
    h = 3,
    //% block="object width"
    WIDTH = 4
}

enum protocolCommand {
    COMMAND_REQUEST = 0x20,
    COMMAND_REQUEST_BLOCKS = 0x21,
    COMMAND_REQUEST_ARROWS = 0x22,
    COMMAND_REQUEST_LEARNED = 0x23,
    COMMAND_REQUEST_BLOCKS_LEARNED = 0x24,
    COMMAND_REQUEST_ARROWS_LEARNED = 0x25,
    COMMAND_REQUEST_BY_ID = 0x26,
    COMMAND_REQUEST_BLOCKS_BY_ID = 0x27,
    COMMAND_REQUEST_ARROWS_BY_ID = 0x28,
    COMMAND_RETURN_INFO = 0x29,
    COMMAND_RETURN_BLOCK = 0x30,
    COMMAND_RETURN_ARROW = 0x31,
    COMMAND_REQUEST_KNOCK = 0x32,
    COMMAND_REQUEST_ALGORITHM = 0x33,
    COMMAND_RETURN_OK = 0x34
}

enum protocolAlgorithm {
    ALGORITHM_FACE_RECOGNITION = 0,
    ALGORITHM_OBJECT_TRACKING = 1,
    ALGORITHM_OBJECT_RECOGNITION = 2,
    ALGORITHM_LINE_TRACKING = 3,
    ALGORITHM_COLOR_RECOGNITION = 4,
    ALGORITHM_TAG_RECOGNITION = 5,
    ALGORITHM_OBJECT_CLASSIFICATION = 6,
} 
//% weight=100  color=#00A654 block="Huskylens"
namespace huskylens{

    let i = 1;
    let FRAME_BUFFER_SIZE = 128
    let HEADER_0_INDEX = 0
    let HEADER_1_INDEX = 1
    let ADDRESS_INDEX = 2
    let CONTENT_SIZE_INDEX = 3
    let COMMAND_INDEX = 4
    let CONTENT_INDEX = 5
    let PROTOCOL_SIZE = 6
    let send_index = 0;
    let receive_index = 0;

    let COMMAND_REQUEST = 0x20;

    let receive_buffer: number[] = [];
    let send_buffer: any[] = [];
    let buffer: number[] = [];

    let send_fail = false;
    let receive_fail = false;
    let content_current = 0;
    let content_end = 0;
    let content_read_end = false;

    let command: number

    //% block="request"
   export function request():boolean {
       
       //let length = husky_lens_protocol_write_end();
       buffer = husky_lens_protocol_write_begin(COMMAND_REQUEST);
       let Buffer = pins.createBufferFromArray(buffer);
       protocolWrite(Buffer);
       return true;
   }

   //% block="request|%ID"
   
   export function isLearned(ID:number) :boolean{
        return false;
    }

//
   function validateCheckSum() {
       
       let stackSumIndex = receive_buffer[3] + CONTENT_INDEX;
       let sum = 0;
       for (let i = 0; i < stackSumIndex; i++) {
           sum += receive_buffer[i];
       }
       sum = sum & 0xff;
       
       return (sum == receive_buffer[stackSumIndex]);
   }
//
   function husky_lens_protocol_write_end(){
       if (send_fail) { return 0; }
       if (send_index + 1 >= FRAME_BUFFER_SIZE) { return 0; }
       send_buffer[CONTENT_SIZE_INDEX] = send_index - CONTENT_INDEX;
       let sum = 0;
       for (let  i = 0; i < send_index; i++)
       {
           sum += send_buffer[i];
       }
       
       sum = sum & 0xff;
       send_buffer[send_index] = sum;
       send_index++;
       return send_index;
   }
//
   function husky_lens_protocol_write_begin(command=0) {
       send_fail = false;
       send_buffer[HEADER_0_INDEX] = 0x55;
       send_buffer[HEADER_1_INDEX] = 0xAA;
       send_buffer[ADDRESS_INDEX] = 0x11;
       send_buffer[COMMAND_INDEX] = command;
       send_index = CONTENT_INDEX;
       return send_buffer;
   }
//
   function protocolWrite(buffer:Buffer){
       
       pins.i2cWriteBuffer(0x32, buffer);
   }
//
   function processReturn(){
       if (!wait(protocolCommand.COMMAND_RETURN_INFO)) return false;
       protocolReadReturnInfo(protocolInfo);
      // protocolPtr = (Protocol_t *) realloc(protocolPtr, protocolInfo.protocolSize * sizeof(Protocol_t));

       for (let i = 0; i < protocolInfo.protocolSize; i++)
       {
           if (!wait()) return false;
           if (protocolReadReturnBlock(protocolPtr[i])) continue;
           else if (protocolReadReturnArrow(protocolPtr[i])) continue;
           else return false;
       }
       return true;
   }
//   
   
   function wait(command = 0){
       timerBegin();
       while (!timerAvailable()) {
           if (protocolAvailable()) {
               if (command) {
                   if (husky_lens_protocol_read_begin(command)) return true;
               }
               else {
                   return true;
               }
           }
       }
       return false;
   }
//
    function husky_lens_protocol_read_begin(command=0){
       if (command == receive_buffer[COMMAND_INDEX]) {
           content_current = CONTENT_INDEX;
           content_read_end = false;
           receive_fail = false;
           return true;
       }
       return false;
   }
//
    let timeOutDuration = 100;
    let timeOutTimer:number
   function  timerBegin(){
        timeOutTimer = input.runningTimeMicros();
   }
//
   function timerAvailable(){
       return (input.runningTimeMicros() - timeOutTimer > timeOutDuration);
   }
//
   function protocolAvailable(){
       let buf = pins.i2cReadBuffer(0x32, 16, true)
       for(let i=1;i<16;i++){
       if (husky_lens_protocol_receive(buf[i])){
           
           return true;
                }
        }
       return false;
       }
//
   function husky_lens_protocol_receive(data: number): boolean {
       switch (receive_index) {
           case 0:

               if (data != 0x55) { receive_index = 0; return false; }
               //serial.writeNumber(receive_buffer[0])
               receive_buffer[0] = 0x55;
               break;
           case 1:
               //serial.writeNumber(receive_buffer[1])
               if (data != 0xaa) { receive_index = 0; return false; }
               receive_buffer[1] = 0xaa;
               break;
           case 2:
               //serial.writeNumber(receive_buffer[2])
               receive_buffer[2] = data;
               break;
           case 3:

               if (data >= FRAME_BUFFER_SIZE - PROTOCOL_SIZE) { receive_index = 0; return false; }
               receive_buffer[3] = data;
               //serial.writeNumber(receive_buffer[3])
               break;
           default:
               receive_buffer[receive_index] = data;

               if (receive_index == receive_buffer[3] + CONTENT_INDEX) {
                   content_end = receive_index;
                   receive_index = 0;
                   //serial.writeNumber(receive_buffer[7])
                   return validateCheckSum();

               }
               break;
       }
       receive_index++;
       return false;
   }
//
   


}
