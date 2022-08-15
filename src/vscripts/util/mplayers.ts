import { ResourceManager } from "../ResourceManager"

export function EnoughForDoMyPower(playerID: PlayerID, ability: CDOTABaseAbility): boolean{
    const gold_cost = ability.GetGoldCost(ability.GetLevel()) || 0
    const lumber_cost = ability.GetSpecialValueFor("lumber_cost") || 0
    const food_cost = ability.GetSpecialValueFor("food_cost") || 0

    const current_gold = ResourceManager.GetGold(playerID)
    const current_lumber = ResourceManager.GetLumber(playerID)
    const current_food = ResourceManager.GetFoodLimit(playerID) - ResourceManager.GetFoodUsed(playerID)

    const bCanAffordGoldCost = current_gold >= gold_cost
    const bCanAffordLumberCost = current_lumber >= lumber_cost
    const bCanAffordFoodCost = current_food >= food_cost

    return bCanAffordGoldCost && bCanAffordLumberCost && bCanAffordFoodCost
}