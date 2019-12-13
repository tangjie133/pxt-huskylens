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

enum HUSKYLENSResultType_t {
    //%block="HUSKYLENSResultBlock"
    HUSKYLENSResultBlock=1,
     //%block="HUSKYLENSResultArrow"
    HUSKYLENSResultArrow=2,
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
    COMMAND_RETURN_BLOCK = 0x2A,
    COMMAND_RETURN_ARROW = 0x2B,
    COMMAND_REQUEST_KNOCK = 0x2C,
    COMMAND_REQUEST_ALGORITHM = 0x2D,
    COMMAND_RETURN_OK = 0x2E
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
    let Protocol_t: number[] =[0,0,0,0,0,0]
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
    let send_buffer: number[] = [];
    let buffer: number[] = [];

    let send_fail = false;
    let receive_fail = false;
    let content_current = 0;
    let content_end = 0;
    let content_read_end = false;

    let command: number
    let content: number
    //% block="request"
   export function request():void {
       
       //let length = husky_lens_protocol_write_end();
       buffer = husky_lens_protocol_write_begin(COMMAND_REQUEST);
       let Buffer = pins.createBufferFromArray(buffer);
       protocolWrite(Buffer);
       processReturn();
   }

   //% block="request|%ID"
   
   export function isLearned(ID:number) :boolean{
       let x = countLearnedIDs();
       if (ID == x)return true;
       return false;
    }

   //% block="ID|%ID HUSKYLENSResultType|%Ht"
   export function isAppear(ID: number, Ht: HUSKYLENSResultType_t): boolean {
       switch (Ht) {
           case 1:
               if (countBlocks()!=0)return true;
           case 2:
               if (countArrows() != 0) return true;
           default:
               return false;
       }
       //return false;
   }

   //%block="reade|%number1"
   export function nm(number1: Content1): number {
       switch (number1) {
           case 1:
               return Protocol_t[1] ;
           case 2:
               return Protocol_t[2];
           default:
               return 0;
       }
       //return false;
   }


    //%block="init I2C"
    export function initI2c():void {
        while (!readKnock()){
            serial.writeNumber(1);
        }
        serial.writeNumber(2);
    }

    //%block="init"
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
       //serial.writeNumber(buffer[4])
         //serial.writeLine("")
       pins.i2cWriteBuffer(0x32, buffer, true);
   }
//
   function processReturn(){
       if (!(protocolCommand.COMMAND_RETURN_INFO)) return false;
       //protocolReadReturnInfo(protocolInfo);
       protocolWriteFiveInt16(protocolCommand.COMMAND_RETURN_INFO);
      // protocolPtr = (Protocol_t *) realloc(protocolPtr, protocolInfo.protocolSize * sizeof(Protocol_t));

       for (let i = 0; i < Protocol_t[1]; i++)
       {
           if (!wait()) return false;
           if (protocolReadFiveInt16(protocolCommand.COMMAND_RETURN_BLOCK)) continue;
           else if (protocolReadFiveInt16(protocolCommand.COMMAND_RETURN_ARROW)) continue;
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
                
                   if (husky_lens_protocol_read_begin(command)) { 
                    //    serial.writeNumber(3)
                    //    serial.writeLine("")
                       return true;
                   }
               }
               else {
                //     serial.writeNumber(4)
                // serial.writeLine("")
                   return true;
               }
           }
       }
       return false;
   }
//
    function husky_lens_protocol_read_begin(command=0){
        
        //serial.writeNumber(receive_buffer[COMMAND_INDEX])
         //serial.writeLine("")
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
       let buf = pins.i2cReadBuffer(0x32, 16, false)
       //serial.writeNumber(buf[4])
       //serial.writeLine("")
       for(let i=0;i<16;i++){
           if (husky_lens_protocol_receive(buf[i])){
           return true;
                }
        }
       return false
       }
//
   function husky_lens_protocol_receive(data: number): boolean {
         //serial.writeNumber(data)
        //serial.writeLine("")
       switch (receive_index) {
           case HEADER_0_INDEX:
               if (data != 0x55) { receive_index = 0; return false; }
               receive_buffer[HEADER_0_INDEX] = 0x55;
               //serial.writeNumber(receive_buffer[0])
               break;
           case HEADER_1_INDEX:
               if (data != 0xAA) { receive_index = 0; return false; }
               receive_buffer[HEADER_1_INDEX] = 0xAA;
               break;
           case ADDRESS_INDEX:
               
               receive_buffer[ADDRESS_INDEX] = data;
               //serial.writeNumber(receive_buffer[2])
               break;
           case CONTENT_SIZE_INDEX:

               if (data >= FRAME_BUFFER_SIZE - PROTOCOL_SIZE) { receive_index = 0; return false; }
               receive_buffer[CONTENT_SIZE_INDEX] = data;
               //serial.writeNumber(receive_buffer[3])
               //serial.writeLine("")
               break;
           default:
               receive_buffer[receive_index] = data;

               if (receive_index == receive_buffer[CONTENT_SIZE_INDEX] + CONTENT_INDEX) {
                   content_end = receive_index;
                   receive_index = 0;
                   //serial.writeNumber(receive_buffer[4])
                   return validateCheckSum();

               }
               break;
       }
       receive_index++;
       return false;
   }

//
   //function  protocolReadReturnInfo(Protocol_t & protocol){ return protocolReadFiveInt16(protocol, COMMAND_RETURN_INFO); }
   
//
   function protocolWriteFiveInt16(command=0){
       Protocol_t[0] = command;
    let buffer = husky_lens_protocol_write_begin(command);
    husky_lens_protocol_write_int16(Protocol_t[1]);
    husky_lens_protocol_write_int16(Protocol_t[2]);
    husky_lens_protocol_write_int16(Protocol_t[3]);
    husky_lens_protocol_write_int16(Protocol_t[4]);
    husky_lens_protocol_write_int16(Protocol_t[5]);
       //let  length = husky_lens_protocol_write_end();
       let Buffer = pins.createBufferFromArray(buffer);
       protocolWrite(Buffer);
   }

//
   function husky_lens_protocol_write_int16(content=0){
       if (send_index + content >= FRAME_BUFFER_SIZE) { send_fail = true; return; }
       //if (IS_BIG_ENDIAN()) { __builtin_bswap16(content); }
       //memcpy(send_buffer + send_index, &content, sizeof(content));
       //send_buffer[send_index]=content;
       send_index +=2;
   }
// 
   function protocolReadFiveInt16(command=0){
       if (husky_lens_protocol_read_begin(command)) {
           Protocol_t[0] = command;
           Protocol_t[1] = husky_lens_protocol_read_int16();
           Protocol_t[2] = husky_lens_protocol_read_int16();
           Protocol_t[3]= husky_lens_protocol_read_int16();
           Protocol_t[4] = husky_lens_protocol_read_int16();
           Protocol_t[5] = husky_lens_protocol_read_int16();
           husky_lens_protocol_read_end();
           return true;
       }
       else {
           return false;
       }
   }
//
   function husky_lens_protocol_read_int16(){
       if (content_current >= content_end || content_read_end) { receive_fail = true; return 0; }
       let result = receive_buffer[content_current];
       //memcpy(&result, receive_buffer + content_current, sizeof(result));
       //if (IS_BIG_ENDIAN()) { __builtin_bswap16(result); }
       content_current += 2//sizeof(result);
       return result;
   }
//
   function husky_lens_protocol_read_end(){
       if (receive_fail) {
           receive_fail = false;
           return false;
       }
       return content_current == content_end;
   }
// 
   function countLearnedIDs(){
       return Protocol_t[2]
   }
//
   function countBlocks() {
       let counter = 0;
       for (let i = 0; i < Protocol_t[2]; i++)
       {
           if (Protocol_t[0] == protocolCommand.COMMAND_RETURN_BLOCK) counter++;
       }
       return counter;
   }
//
   function countArrows() {
       let counter = 0;
       for (let i = 0; i < Protocol_t[2]; i++)
       {
           if (Protocol_t[0] == protocolCommand.COMMAND_RETURN_ARROW) counter++;
       }
       return counter;
   }
//
   function readKnock(){
       for (let i = 0; i < 5; i++)
       {
           protocolWriteCommand(protocolCommand.COMMAND_REQUEST_KNOCK);//2C
           if (wait(protocolCommand.COMMAND_RETURN_OK)) {
               return true;  
           }
       }
       
       return false;
   }
//
   function protocolWriteCommand(command=0){
       Protocol_t[0] = command;
       let buffer = husky_lens_protocol_write_begin(Protocol_t[0]);
       let length = husky_lens_protocol_write_end();
       let Buffer = pins.createBufferFromArray(buffer);
       protocolWrite(Buffer);
   }
//
   function protocolReadCommand(command=0){
       if (husky_lens_protocol_read_begin(command)) {
           Protocol_t[0] = command;
           husky_lens_protocol_read_end();
           return true;
       }
       else {
           return false;
       }
   }

}
