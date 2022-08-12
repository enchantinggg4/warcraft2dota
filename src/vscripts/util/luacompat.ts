export function asArray<T>(luaTable: any){
    const array: T[] = [];
    let i = 0;
    while(luaTable[i + '']){
        array.push(luaTable[i++ + '']);
    }
    return array;
}