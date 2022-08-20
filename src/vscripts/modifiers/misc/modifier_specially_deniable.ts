import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_specially_deniable extends BaseModifier {

    IsHidden(): boolean {
        return true;
    }
    
    CheckState() {
        return {
            [ModifierState.SPECIALLY_DENIABLE]: true
        }
    }
}