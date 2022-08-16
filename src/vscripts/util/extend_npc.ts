import { modifier_harvest_tree } from "../modifiers/worker/modifier_harvest_tree"
import { FindEmptyNavigableTreeNearby } from "./Utility"

// @ts-ignore
CDOTA_BaseNPC.GatherFromNearestTree = function (this: Gatherer, position: Vector, distance: number, bManualOrder: unknown) {
    position = position || this.GetAbsOrigin() // If no position, use the unit origin
    distance = distance || 500
    // Gatherer.MinDistanceToTree // If no distance, use the minimum

    const gather_ability = this.GetGatherAbility()
    const return_ability = this.GetReturnAbility()


    const empty_tree = FindEmptyNavigableTreeNearby(this, position, distance) // TODO: Not Empty

    
    if (empty_tree) {
        print("GatherFromNearestTree " + empty_tree.GetEntityIndex())
    }
    else {
        print("Error, cant find valid nearest tree")
    }

    // Can the unit still gather more resources ?
    if (this.lumber_gathered == 0 || this.CanCarryMoreLumber())
        if (gather_ability.IsHidden() && return_ability){ // Swap to a gather ability and keep extracting
            this.SwapAbilities(gather_ability.GetAbilityName(), return_ability.GetAbilityName(), true, false)
        }

        if (empty_tree){
            const tree_index = empty_tree.GetEntityIndex()
            this.target_tree = empty_tree // The new selected tree
            print("Now targeting Tree " + tree_index)
            if (bManualOrder){
                // Gatherer: CreateSelectionParticle(unit, empty_tree)
            }
            ExecuteOrderFromTable({ UnitIndex: this.GetEntityIndex(), OrderType: UnitOrder.CAST_TARGET_TREE, TargetIndex: tree_index, AbilityIndex: gather_ability.GetEntityIndex(), Queue: false })
        }

    else {//Return
        this.target_tree = empty_tree // The new selected tree
        this.ReturnResources(false, false) // Propagate return order
    }
}





CDOTA_BaseNPC.GetCollisionSize = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.GetKeyValue("CollisionSize")
}


CDOTA_BaseNPC.IsNeutral = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.GetTeamNumber() == DotaTeam.NEUTRALS || this.GetUnitName().includes("neutral_")
}

CDOTA_BaseNPC.GetAttacksEnabled = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.attacksEnabled || this.GetKeyValue("AttacksEnabled") || "none"
}

CDOTA_BaseNPC.GetAttackType = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.AttackType || this.GetKeyValue("AttackType")
}

CDOTA_BaseNPC.GetArmorType = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.ArmorType || this.GetKeyValue("ArmorType")
}

CDOTA_BaseNPC.HasSplashAttack = function (this: CDOTA_BaseNPC) {
    // @ts-ignore
    return this.GetKeyValue("SplashAttack")
}

CDOTA_BaseNPC.IsGatherer = function (this: CDOTA_BaseNPC) {
    return this.GetKeyValue("GatherAbility") != undefined
}

CDOTA_BaseNPC.GetFormationRank = function (this: CDOTA_BaseNPC) {
    return this.GetKeyValue("FormationRank") || 0
}

CDOTA_BaseNPC.SetCanAttackTrees = function (this: CDOTA_BaseNPC, bAble: boolean) {
    if (bAble) {
        this.AddNewModifier(this, undefined, modifier_harvest_tree.name, {});
    }
    else {
        this.RemoveModifierByName(modifier_harvest_tree.name);
    }
};