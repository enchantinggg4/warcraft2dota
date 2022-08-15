


export interface Building extends CDOTA_BaseNPC {
    IsUnderConstruction?(): boolean;
    QueueTimer?: string;

    initial_spawn_position?: Vector
    flag_type?: string;
    flag?: Vector | CDOTA_BaseNPC

    queue?: EntityIndex[];

    original_attack?: UnitAttackCapability
    disabled_abilities?: CDOTABaseAbility[]



    entangled_gold_mine?: CDOTA_BaseNPC
}

export interface EnqueueEvt<T = Building> {
    caster: T;
    ability: CDOTABaseAbility;
}