declare interface Gatherer extends CDOTA_BaseNPC {
    lumber_gathered: number;
    target_tree?: unknown

    CanCarryMoreLumber(): boolean;
    GatherFromNearestTree(pos: Vector): void
    GatherFromNearestGoldMine(flag: CDOTA_BaseNPC): void;


    GetGatherAbility(): CDOTABaseAbility
    GetReturnAbility(): CDOTABaseAbility

    ReturnResources(a: boolean, b: boolean): void;

}

declare interface CDOTA_BaseNPC {
    GetKeyValue<T>(key: string): T

    GetAttacksEnabled(): 'none' | unknown

    GetAttackType(): unknown

    GetArmorType(): unknown

    HasSplashAttack(): boolean

    IsGatherer(this: CDOTA_BaseNPC): this is Gatherer

    GetFormationRank(): number;

    IsNeutral(): boolean

    GetCollisionSize(): number


    SetCanAttackTrees(bAble: boolean): void

    /// ???

    state?: 'idle' | unknown
}

declare interface CustomNetTableDeclarations {
    builders: any;
}


declare interface CDOTAGameRules {
    UnitKV: any;
}