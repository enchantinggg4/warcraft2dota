import { reloadable } from "../lib/tstl-utils";
import { modifier_harvest_tree } from "../modifiers/worker/modifier_harvest_tree";
import { modifier_harvest_tree_active } from "../modifiers/worker/modifier_harvest_tree_active";
import { asArray } from "./luacompat";

@reloadable
class _CustomGameEvents {

    public OnRightClick(data: any){
        const [x, y, z] = asArray<number>(data.position)
        
        const selectedEntities: CDOTA_BaseNPC[] = asArray<EntityIndex>(data.selected).map((it) => EntIndexToHScript(it) as CDOTA_BaseNPC);

        const clickPos = Vector(x, y, z);

        const trees: CDOTA_MapTree[] = GridNav.GetAllTreesAroundPoint(clickPos, 100, false);

        const myTree = trees[0];
        if(!myTree) return;


        print(selectedEntities.length)
        // ok we right clicked tree with current units
        for(let npc of selectedEntities){
            if(npc.HasModifier(modifier_harvest_tree.name)){
                npc.AddNewModifier(npc, undefined, modifier_harvest_tree_active.name, { duration: - 1, x, y, z });
            }
        }
        
    }

}

export const CustomGameEvents = new _CustomGameEvents();