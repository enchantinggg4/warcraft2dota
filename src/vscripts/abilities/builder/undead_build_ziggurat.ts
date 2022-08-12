import { registerAbility } from "../../lib/dota_ts_adapter";
import { generic_build_ability } from "./generic_build_ability";

@registerAbility()
export class undead_build_ziggurat extends generic_build_ability {

    OnSpellStart(): void {
        const evt = {
            caster: this.GetOwner(),
            ability: this
        };
        if(BuildingHelper.AddBuilding(evt)){

            print('HELLO?>????')
            evt.OnPreConstruction(() => {
                print('on pre construction?')
            });

            evt.OnConstructionCompleted(() => {
                print('construction complete')
            })


            evt.OnConstructionStarted(() => {
                print('construction started')
            })

            evt.OnConstructionFailed(() => {
                print('construction failed')
            });

            evt.OnConstructionCancelled(() => {
                print('construction cancelled')
            });


            evt.OnBuildingPosChosen(() => {
                print('pos chosen')
            })



            evt.OnAboveHalfHealth(() => {
                print('above 50%')
            })

            evt.OnBelowHalfHealth(() => {
                print('below 50%')
            })
        }
    }
}