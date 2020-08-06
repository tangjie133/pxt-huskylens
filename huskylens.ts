/** 
 * @file pxt-DFRobot_HuskyLens/huskylens.ts
 * @brief DFRobot's huskylens makecode library.
 * @n [Get the module here](https://github.com/DFRobot/pxt-DFRobot_HaskyLens)
 * @n HuskyLens is an easy-to-use AI vision sensor with six built-in functions: face recognition, object tracking, object recognition, line tracking, color recognition, and label (qr code) recognition. 
 * Only one button is needed to complete the AI training, which can get rid of tedious training and complicated visual algorithm and help users stay focused on the conception and implementation of the project.
 * 
 * @copyright    [DFRobot](http://www.dfrobot.com), 2016
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](jie.tang@dfrobot.com)
 * @date  2020-3-17
*/
enum Content1 {
    //% block="X coordinates"
    xCenter = 1,
    //% block="Y coordinates"
    yCenter = 2,
    //% block="Object width"
    width = 3,
    //% block="Object height"
    height = 4
}

enum Content2 {
    //% block=" xOrigin"
    xOrigin = 1,
    //% block="yOrigin"
    yOrigin = 2,
    //% block="xTarget"
    xTarget = 3,
    //% block="yTarget"
    yTarget = 4
}

enum Content3 {
    //% block="ID"
    ID = 5,
    //% block="X coordinates"
    xCenter = 1,
    //% block="Y coordinates"
    yCenter = 2,
    //% block="Object width"
    width = 3,
    //% block="Object height"
    height = 4
}

enum Content4 {
    //% block="ID"
    ID = 5,
    //% block=" xOrigin"
    xOrigin = 1,
    //% block="yOrigin"
    yOrigin = 2,
    //% block="xTarget"
    xTarget = 3,
    //% block="yTarget"
    yTarget = 4

}

enum HUSKYLENSResultType_t {
    //%block="frame"
    HUSKYLENSResultBlock = 1,
    //%block="arrow"
    HUSKYLENSResultArrow = 2,
}

enum HUSKYLENSMode{
    //%block="save"
    SAVE,
    //%block="load"
    LOAD,
}
enum HUSKYLENSphoto{
    //%block="photo"
    PHOTO,
    //%block="screenshot"
    SCREENSHOT
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
    COMMAND_RETURN_OK = 0x2E,
    COMMAND_REQUEST_LEARN = 0x2F,
    COMMAND_REQUEST_FORGET = 0x30,
    COMMAND_REQUEST_SENSOR = 0x31,

}

enum protocolAlgorithm {
    //%block="Face Recognition"
    ALGORITHM_FACE_RECOGNITION = 0,
    //%block="Object Tracking"
    ALGORITHM_OBJECT_TRACKING = 1,
    //%block="Object Recognition"
    ALGORITHM_OBJECT_RECOGNITION = 2,
    //%block="Line Tracking"
    ALGORITHM_LINE_TRACKING = 3,
    //%block="Color Recognition"
    ALGORITHM_COLOR_RECOGNITION = 4,
    //%block="Tag Recognition"
    ALGORITHM_TAG_RECOGNITION = 5,
    //%block="Object classification"
    OBJECTCLASSIFICATION,
    //%block="QR recogmition (Edu only)"
    QRRECOGMITION,
    //%block="Barcode recognition (Edu only)"
    BARCODERECOGNITION,

}


//% weight=100  color=#e7660b icon="\uf083"  block="HuskyLens"
namespace huskylens {
    let protocolPtr: number[][] = [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0]]
    let Protocol_t: number[] = [0, 0, 0, 0, 0, 0]
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
    

    /**
     * HuskyLens init I2C until success
     */
    //%block="HuskyLens initialize via I2C until success"
    //% weight=90
    export function initI2c(): void {
        while (!readKnock()) {
            no();
        }
        yes();
    }
    /**
     * HuskyLens change mode algorithm until success.
     */
    //%block="HuskyLens switch to %mode algorithm until it success"
    //% weight=85
    export function initMode(mode: protocolAlgorithm) {
        while (!writeAlgorithm(mode, protocolCommand.COMMAND_REQUEST_ALGORITHM)) {
           no();
        }
        yes();
    }
    /**
     * HuskyLens requests data and stores it in the result.
     */

    //% block="HuskyLens capture and save the current image in screen to flash"
    //% weight=80
    export function request(): void {
        protocolWriteCommand(protocolCommand.COMMAND_REQUEST)
        processReturn();
    }
    /**
     * HuskyLens get the number of the learned ID from result.
     */
    //%block="HuskyLens get ID amount of learned objects from the result"
    //% weight=79
    export function getIds(): number {
        return Protocol_t[2];
    }
    /**
     * The box or arrow HuskyLens got from result appears in screen?
     */
    //%block="HuskyLens confirm from the result,whether the %Htin is in the screen?"
    //% weight=78
    export function isAppear_s(Ht: HUSKYLENSResultType_t): boolean {
        switch (Ht) {
            case 1:
                return countBlocks_s() != 0 ? true:false;
            case 2:
                return countArrows_s() != 0 ? true:false;
            default:
                return false;
        }
    }
    /**
     * HuskyLens get the parameter of box near the screen center from result.
     */
    //% block="HuskyLens get parameter close to frame %data from the result"
    //% weight=77
    export function readBox_s(data: Content3): number {
        let hk_x
        let hk_y = readBlockCenterParameterDirect();
        if (hk_y != -1) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_y][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_y][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_y][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_y][4]; break;
                default:
                    hk_x = protocolPtr[hk_y][5];
            }
        }
        else hk_x = -1
        return hk_x;
    }
    /**
     * HuskyLens get the parameter of arrow near the screen center from result.
     */
    //% block="HuskyLens get parameter close to arrow %data from the result"
    //% weight=77
    export function readArrow_s(data: Content4): number {
        let hk_x
        let hk_y = readArrowCenterParameterDirect()
        if (hk_y != -1) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_y][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_y][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_y][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_y][4]; break;
                default:
                    hk_x = protocolPtr[hk_y][5];
            }
        }
        else hk_x = -1
        return hk_x;
    }
    /**
     * The ID Huskylens got from result has been learned before?
     * @param id to id ,eg: 1
     */
    //% block="HuskyLens confirm from the result,whether ID %id is learned?"
    //% weight=76
    export function isLearned(id: number): boolean {
        let hk_x = countLearnedIDs();
        if (id <= hk_x) return true;
        return false;
    }
    /**
     * The box or arrow corresponding to ID obtained by HuskyLens from result appears in screen？
     * @param id to id ,eg: 1
     */
    //% block="HuskyLens confirm from the result,whether ID %id %Ht is in the screen"
    //% weight=75
    export function isAppear(id: number, Ht: HUSKYLENSResultType_t): boolean {
        switch (Ht) {
            case 1:
                return countBlocks(id) != 0 ? true : false ;
            case 2:
                return countArrows(id) != 0 ? true : false;
            default:
                return false;
        }
    }
    /**
     * HuskyLens get the parameter of the box corresponding to ID from result.
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens get parameter %number1 of ID %id frame from the result"
    //% weight=65
    export function readeBox(id: number, number1: Content1): number {
        let hk_y = cycle_block(id, 1);
        let hk_x
        if (countBlocks(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
     /**
     * HuskyLens get the parameter of the arrow corresponding to ID from result.
     * @param id to id ,eg: 1
     */

    //%block="HuskyLens get parameter %number1 of ID %id arrow from the result"
    //% weight=60
    export function readeArrow(id: number, number1: Content2): number {
        let hk_y = cycle_arrow(id, 1);
        let hk_x
        if (countArrows(id) != 0) {
            if (hk_y != null) {

                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the box or arrow total number from result.
     * 
     */
    //%block="HuskyLens get %Httotal amount from the result"
    //% weight=90
    //% advanced=true
    export function getBox(Ht: HUSKYLENSResultType_t): number {
        switch (Ht) {
            case 1:
                return countBlocks_s();
            case 2:
                return countArrows_s();
            default:
                return 0;
        }
    }
    /**
     * HuskyLens get the parameter of Nth box from result.
     * @param index to index ,eg: 1
     */
    //% block="HuskyLens get parameter %data of ID %index frame from the result"
    //% weight=60
    //% advanced=true
    export function readBox_ss(index: number, data: Content3): number {
        let hk_x
        let hk_i = index - 1
        if (protocolPtr[0][0] == protocolCommand.COMMAND_RETURN_BLOCK) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_i][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_i][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_i][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_i][4]; break;
                default:
                    hk_x = protocolPtr[hk_i][5];
            }
        } else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the parameter of the Nth arrow from result.
     * @param index to index ,eg: 1
    */
    //% block="HuskyLens get parameter %data of ID %index arrow from the result"
    //% weight=60
    //% advanced=true
    export function readArrow_ss(index: number, data: Content4): number {
        let hk_x
        let hk_i = index - 1
        if (protocolPtr[0][0] == protocolCommand.COMMAND_RETURN_ARROW) {
            switch (data) {
                case 1:
                    hk_x = protocolPtr[hk_i][1]; break;
                case 2:
                    hk_x = protocolPtr[hk_i][2]; break;
                case 3:
                    hk_x = protocolPtr[hk_i][3]; break;
                case 4:
                    hk_x = protocolPtr[hk_i][4]; break;
                default:
                    hk_x = protocolPtr[hk_i][5];
            }
        } else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the total number of box or arrow from result.
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens get ID %id %Httotal amount from the result"
    //% weight=55
    //% advanced=true
    export function getBox_S(id: number, Ht: HUSKYLENSResultType_t): number {
        switch (Ht) {
            case 1:
                return countBlocks(id);
            case 2:
                return countArrows(id);
            default:
                return 0;
        }
    }
    /**
     * HuskyLens get the parameter of the Nth box corresponding to ID from result.
     * @param id to id ,eg: 1
     * @param index to index ,eg: 1
     */
    //%block="HuskyLens get parameter %number1 of ID %id %index frame from the result"
    //% weight=45
    //% advanced=true
    export function readeBox_index(id: number, index: number, number1: Content1): number {
        let hk_y = cycle_block(id, index);
        let hk_x
        if (countBlocks(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * HuskyLens get the parameter of the Nth arrow corresponding to ID from result.
     * @param id to id ,eg: 1
     * @param index to index ,eg: 1
     */
    //%block="HuskyLens get parameter %number1 of ID %id %index arrow from the result"
    //% weight=35
    //% advanced=true
    export function readeArrow_index(index: number, id: number, number1: Content2): number {
        let hk_y = cycle_arrow(id, index);
        let hk_x
        if (countArrows(id) != 0) {
            if (hk_y != null) {
                switch (number1) {
                    case 1:
                        hk_x = protocolPtr[hk_y][1]; break;
                    case 2:
                        hk_x = protocolPtr[hk_y][2]; break;
                    case 3:
                        hk_x = protocolPtr[hk_y][3]; break;
                    case 4:
                        hk_x = protocolPtr[hk_y][4]; break;
                    default:
                        hk_x = -1;
                }
            }
            else hk_x = -1;
        }
        else hk_x = -1;
        return hk_x;
    }
    /**
     * Huskylens automatic learning ID
     * @param id to id ,eg: 1
     */
    //%block="HuskyLens learn ID %id once automatically"
    //% weight=30
    //% advanced=true
    export function writeLearn1(id: number):void{
        while(!writeAlgorithm(id, 0X36)){
            no();
        }
        yes();
    }
    /**
     * Huskylens forget all learning data of the current algorithm
     */
    //%block="HuskyLens forget all learning data of the current algorithm"
    //% weight=29
    //% advanced=true
    export function forgetLearn():void{
        while(!writeAlgorithm(0x47, 0X37)){
            no();
        }
        yes();
    }
    /**
     * Set ID name
     * @param id to id ,eg: 1
     * @param name to name ,eg: "DFRobot"
     */
    //%block="HuskyLens name the current algorithm of ID %id to %name"
    //% weight=28
    //% advanced=true
    export function writeName(id:number,name:string):void{
        do
        {
            let newname = name;
            let buffer = husky_lens_protocol_write_begin(0x2f);
            send_buffer[send_index] = id;
            send_buffer[send_index+1] = newname.length;
            send_index += 2;
            for(let i=0;i<newname.length;i++){
                send_buffer[send_index] = newname.charCodeAt(i);
                //serial.writeNumber(newname.charCodeAt(i))
                send_index ++;
            }
            send_buffer[send_index]=0;
            send_index += 1;
            let length = husky_lens_protocol_write_end();
            let Buffer = pins.createBufferFromArray(buffer);
            protocolWrite(Buffer);
        }while(!wait(protocolCommand.COMMAND_RETURN_OK));
        yes();
    }
    /**
     * Display characters on the screen
     * @param name to name ,eg: "DFRobot"
     * @param x to x ,eg: 150
     * @param y to y ,eg: 30
     */
    //%block="HuskyLens show characters %name x %x y %y super-imposed"
    //% weight=27
    //% advanced=true
    //% x.min=0 x.max=319
    //% y.min=0 y.max=239
    export function writeOSD(name:string, x:number, y:number):void{
        do
        {
            let buffer = husky_lens_protocol_write_begin(0x34);
            send_buffer[send_index] = name.length;
            if(x>255){
                send_buffer[send_index+1] = (x%255)&0xffff;
            }else{
                send_buffer[send_index+1] = x;
            }
            send_buffer[send_index+2] = y;
            send_index += 4;
            for(let i=0;i<name.length;i++){
                send_buffer[send_index] = name.charCodeAt(i);
                //serial.writeNumber(name.charCodeAt(i));
                send_index ++;
            }
            let length = husky_lens_protocol_write_end();
            let Buffer = pins.createBufferFromArray(buffer);
            protocolWrite(Buffer);
        }while(!wait(protocolCommand.COMMAND_RETURN_OK));
        yes();
    }
    /**
     * HuskyLens clear characters in the screen
     */
    //%block="HuskyLens clear characters in the screen"
    //% weight=26
    //% advanced=true
    export function clearOSD():void{
        while(!writeAlgorithm(0x45, 0X35)){
            no();
        }
        yes();
    }
    /**
     * Photos and screenshots
     */
    //%block="HuskyLens trigger to take a %request and save it to a TF card"
    //% weight=25
    //% advanced=true
    export function takePhotoToSDCard(request:HUSKYLENSphoto):void{
        switch(request){
        case HUSKYLENSphoto.PHOTO:
            while(!writeAlgorithm(0x40, 0X30)){
                no();
            }
            yes();
            break;
        case HUSKYLENSphoto.SCREENSHOT:
            while(!writeAlgorithm(0x49, 0X39)){
                no();
            }
            yes();
            break;
        default:
            while(!writeAlgorithm(0x40, 0X30)){
                no();
            }
            yes();
        } 
    }
    /**
     * Save data model
     */
    //%block="HuskyLens %command current algorithm data as TF card No. %data model"
    //% weight=24
    //% advanced=true
    //% data.min=0 data.max=5
    export function saveModelToTFCard(command:HUSKYLENSMode,data:number):void{
       switch(command){
       case HUSKYLENSMode.SAVE:
            while(!writeAlgorithm(data,0x32)){
                no();
            }
            yes();
            break;
        case HUSKYLENSMode.LOAD:
            while(!writeAlgorithm(data,0x33)){
                no();
            }
            yes();
            break;
        default:
            while(!writeAlgorithm(data,0x32)){
                no();
            }
            yes();
       }
       
        
    }

    function validateCheckSum() {

        let stackSumIndex = receive_buffer[3] + CONTENT_INDEX;
        let hk_sum = 0;
        for (let i = 0; i < stackSumIndex; i++) {
            hk_sum += receive_buffer[i];
        }
        hk_sum = hk_sum & 0xff;

        return (hk_sum == receive_buffer[stackSumIndex]);
    }

    function husky_lens_protocol_write_end() {
        if (send_fail) { return 0; }
        if (send_index + 1 >= FRAME_BUFFER_SIZE) { return 0; }
        send_buffer[CONTENT_SIZE_INDEX] = send_index - CONTENT_INDEX;
        //serial.writeValue("618", send_buffer[CONTENT_SIZE_INDEX])
        let hk_sum = 0;
        for (let i = 0; i < send_index; i++) {
            hk_sum += send_buffer[i];
        }

        hk_sum = hk_sum & 0xff;
        send_buffer[send_index] = hk_sum;
        send_index++;
        return send_index;
    }
    
    function husky_lens_protocol_write_begin(command = 0) {
        send_fail = false;
        send_buffer[HEADER_0_INDEX] = 0x55;
        send_buffer[HEADER_1_INDEX] = 0xAA;
        send_buffer[ADDRESS_INDEX] = 0x11;
        //send_buffer[CONTENT_SIZE_INDEX] = datalen;
        send_buffer[COMMAND_INDEX] = command;
        send_index = CONTENT_INDEX;
        return send_buffer;
    }
    
    function protocolWrite(buffer: Buffer) {
        pins.i2cWriteBuffer(0x32, buffer, false);
    }

    function processReturn() {
        if (!wait(protocolCommand.COMMAND_RETURN_INFO)) return false;
        protocolReadFiveInt16(protocolCommand.COMMAND_RETURN_INFO);
        for (let i = 0; i < Protocol_t[1]; i++) {
           
            if (!wait()) return false;
            if (protocolReadFiveInt161(i, protocolCommand.COMMAND_RETURN_BLOCK)) continue;
            else if (protocolReadFiveInt161(i, protocolCommand.COMMAND_RETURN_ARROW)) continue;
            else return false;
        }
        return true;
    }   

    function wait(command = 0) {
        timerBegin();
        //serial.writeValue("621:", 0)
        basic.pause(100)
        while (timerAvailable()) {
            //serial.writeValue("621:", 1)
            if (protocolAvailable()) {
                //serial.writeValue("621:", 2)
                if (command) {
                    if (husky_lens_protocol_read_begin(command)) {
                        //serial.writeValue("624:", 3)
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }
        return false;
    }
    
    function husky_lens_protocol_read_begin(command = 0) {
        //serial.writeValue("635:", command)
        //serial.writeValue("6356", receive_buffer[COMMAND_INDEX])
        if (command == receive_buffer[COMMAND_INDEX]) {
            content_current = CONTENT_INDEX;
            content_read_end = false;
            receive_fail = false;
            return true;
        }
        return false;
    }
    
    let timeOutDuration = 100;
    let timeOutTimer: number
    function timerBegin() {
        timeOutTimer = input.runningTimeMicros();

    }
    
    function timerAvailable() {
        return (input.runningTimeMicros() - timeOutTimer > timeOutDuration);
    }
    
    let m_i = 16
    function protocolAvailable() {
        let buf = pins.createBuffer(16)
        if (m_i == 16) {
            buf = pins.i2cReadBuffer(0x32, 16, false);
            m_i = 0;
        }
        for (let i = m_i; i < 16; i++) {
            //serial.writeValue("667:", buf[i])
            if (husky_lens_protocol_receive(buf[i])) {
                m_i++;
                return true;
            }
            m_i++;
        }
        return false
    }
    
    function husky_lens_protocol_receive(data: number): boolean {
        switch (receive_index) {
            case HEADER_0_INDEX:
                if (data != 0x55) { receive_index = 0; return false; }
                receive_buffer[HEADER_0_INDEX] = 0x55;
                break;
            case HEADER_1_INDEX:
                if (data != 0xAA) { receive_index = 0; return false; }
                receive_buffer[HEADER_1_INDEX] = 0xAA;
                break;
            case ADDRESS_INDEX:
                receive_buffer[ADDRESS_INDEX] = data;
                break;
            case CONTENT_SIZE_INDEX:
                if (data >= FRAME_BUFFER_SIZE - PROTOCOL_SIZE) { receive_index = 0; return false; }
                receive_buffer[CONTENT_SIZE_INDEX] = data;
                break;
            default:
                receive_buffer[receive_index] = data;

                if (receive_index == receive_buffer[CONTENT_SIZE_INDEX] + CONTENT_INDEX) {
                    content_end = receive_index;
                    receive_index = 0;
                    return validateCheckSum();

                }
                break;
        }
        receive_index++;
        return false;
    }

    function husky_lens_protocol_write_int16(content = 0) {

        let x: number = ((content.toString()).length)
        if (send_index + x >= FRAME_BUFFER_SIZE) { send_fail = true; return; }
        send_buffer[send_index] = content & 0xff;
        //serial.writeValue("711:", send_buffer[send_index])
        send_buffer[send_index + 1] = (content >> 8) & 0xff;
        //serial.writeValue("713:", send_buffer[send_index+1])
        send_index += 2;
    }
    
    function protocolReadFiveInt16(command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            Protocol_t[0] = command;
            Protocol_t[1] = husky_lens_protocol_read_int16();
            Protocol_t[2] = husky_lens_protocol_read_int16();
            Protocol_t[3] = husky_lens_protocol_read_int16();
            Protocol_t[4] = husky_lens_protocol_read_int16();
            Protocol_t[5] = husky_lens_protocol_read_int16();
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }
    
    function protocolReadFiveInt161(i: number, command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            protocolPtr[i][0] = command;
            protocolPtr[i][1] = husky_lens_protocol_read_int16();
            protocolPtr[i][2] = husky_lens_protocol_read_int16();
            protocolPtr[i][3] = husky_lens_protocol_read_int16();
            protocolPtr[i][4] = husky_lens_protocol_read_int16();
            protocolPtr[i][5] = husky_lens_protocol_read_int16();
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }

    function husky_lens_protocol_read_int16() {
        if (content_current >= content_end || content_read_end) { receive_fail = true; return 0; }
        let result = receive_buffer[content_current + 1] << 8 | receive_buffer[content_current];
        content_current += 2
        return result;
    }
    
    function husky_lens_protocol_read_end() {
        if (receive_fail) {
            receive_fail = false;
            return false;
        }
        return content_current == content_end;
    }
     
    function countLearnedIDs() {
        return Protocol_t[2]
    }
    
    function countBlocks(ID: number) {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK && protocolPtr[i][5] == ID) counter++;
        }
        return counter;
    }
    
    function countBlocks_s() {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK) counter++;
        }
        return counter;
    }
    
    function countArrows(ID: number) {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW && protocolPtr[i][5] == ID) counter++;
        }
        return counter;
    }
    
    function countArrows_s() {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW) counter++;
        }
        return counter;
    }
    
    function readKnock() {
        for (let i = 0; i < 5; i++) {
            protocolWriteCommand(protocolCommand.COMMAND_REQUEST_KNOCK);//I2C
            if (wait(protocolCommand.COMMAND_RETURN_OK)) {
                return true;
            }
        }

        return false;
    }

    function writeForget() {
        for (let i = 0; i < 5; i++) {
            protocolWriteCommand(protocolCommand.COMMAND_REQUEST_FORGET);
            if (wait(protocolCommand.COMMAND_RETURN_OK)) {
                return true;
            }
        }
        return false;
    }
    
    function protocolWriteCommand(command = 0) {
        Protocol_t[0] = command;
        let buffer = husky_lens_protocol_write_begin(Protocol_t[0]);
        let length = husky_lens_protocol_write_end();
        let Buffer = pins.createBufferFromArray(buffer);
        protocolWrite(Buffer);
    }
    
    function protocolReadCommand(command = 0) {
        if (husky_lens_protocol_read_begin(command)) {
            Protocol_t[0] = command;
            husky_lens_protocol_read_end();
            return true;
        }
        else {
            return false;
        }
    }
    
    function writeAlgorithm(algorithmType : number,comemand = 0) {
        protocolWriteOneInt16(algorithmType, comemand);
        return wait(protocolCommand.COMMAND_RETURN_OK);
    }

    function writeLearn(algorithmType: number) {
        protocolWriteOneInt16(algorithmType, protocolCommand.COMMAND_REQUEST_LEARN);
        return wait(protocolCommand.COMMAND_RETURN_OK);
    }

    function protocolWriteOneInt16(algorithmType: number, command = 0) {
        let buffer = husky_lens_protocol_write_begin(command);
        husky_lens_protocol_write_int16(algorithmType);
        let length = husky_lens_protocol_write_end();
        let Buffer = pins.createBufferFromArray(buffer);
        protocolWrite(Buffer);
    }

    function cycle_block(ID: number, index = 1): number {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK && protocolPtr[i][5] == ID) {
                counter++;
                if (index == counter) return i;

            }
        }
        return null;
    }
    
    function cycle_arrow(ID: number, index = 1): number {
        let counter = 0;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW && protocolPtr[i][5] == ID) {
                counter++;
                if (index == counter) return i;

            }
        }
        return null;
    }

    function readBlockCenterParameterDirect(): number {
        let distanceMinIndex = -1;
        let distanceMin = 65535;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_BLOCK) {
                let distance = Math.round(Math.sqrt(Math.abs(protocolPtr[i][1] - 320 / 2))) + Math.round(Math.sqrt(Math.abs(protocolPtr[i][2] - 240 / 2)));
                if (distance < distanceMin) {
                    distanceMin = distance;
                    distanceMinIndex = i;
                }
            }
        }
        return distanceMinIndex
    }

    function readArrowCenterParameterDirect(): number {
        let distanceMinIndex = -1;
        let distanceMin = 65535;
        for (let i = 0; i < Protocol_t[1]; i++) {
            if (protocolPtr[i][0] == protocolCommand.COMMAND_RETURN_ARROW) {
                let distance = Math.round(Math.sqrt(Math.abs(protocolPtr[i][1] - 320 / 2))) + Math.round(Math.sqrt(Math.abs(protocolPtr[i][2] - 240 / 2)));
                if (distance < distanceMin) {
                    distanceMin = distance;
                    distanceMinIndex = i;
                }
            }
        }
        return distanceMinIndex
    }

    function no():void
    {
        basic.showIcon(IconNames.No)
        basic.pause(200)
        basic.clearScreen()
         basic.pause(200)
    }
    function yes():void
    {
        basic.showIcon(IconNames.Yes)
        basic.pause(200)
        basic.clearScreen()
    }
    
    
}