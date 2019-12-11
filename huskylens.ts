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

//% weight=100  color=#00A654 block="Huskylens"
namespace huskylens{

    //% block="request"
    //% shim=HUKSYLENS::request
   export function request():void {
       return;
   }

   //% block="request|%ID"
    //% shim=HUKSYLENS::isLearned

   export function isLearned(ID:number) :boolean{
        return false;
    }
}
