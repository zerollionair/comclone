export class Generator{

    static  genNum(num : number): string     {
        const numSet = '0123456789'
        let result = ''
        for (let i = 0; i < num; i++) {
            const rand = Math.floor(Math.random() * numSet.length)
            result += numSet[rand]
        }
        return result
    }
}