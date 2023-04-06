/**
 * @description: sayHi
 * @param name 名字
 * @param age 年龄
 * @param sex 性别
 */
function sayHi(name: string, age: number, sex: string):void {
    console.log(`name: ${name}`);
}

/**
 * 人
 */
class Person {
    name?: string;
    age?: number;
    sex: string = "男";
    constructor(name: string, age: number, sex: string) {
        this.name = name;
        this.age = age;
        this.sex = sex;
    }

    /**
     * @description: 打印个人信息
     */    
    printMessage() {
        console.log(`姓名: ${this.name}, 年龄: ${this.age}, 性别: ${this.sex}`);
    }
}
