import { LOCAL_STORAGE_PREFIX } from "src/constants";
import { WritableAtom, atom, createStore, getDefaultStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ProjectBrowserPlugin from "src/main";
import { debug } from "src/utils/log-to-console";

/////////
/////////

interface StaticGlobals {
	plugin: ProjectBrowserPlugin,
}

// TODO: When the plugin reloads this causes an error because the Jotai store is not properly cleaned up and then it is created again.
// It causes state transitions to not work when the plugin is reloaded.
export const globalsAtom = atom<StaticGlobals>()
export function setGlobals(globals: StaticGlobals): void {
	const store = getDefaultStore();
	store.set(globalsAtom, globals);
}
export function getGlobals(): StaticGlobals {
	const store = getDefaultStore();
	const globals = store.get(globalsAtom);
	if(!globals) {
		throw new Error(`Project Browser plugin globals isn't available yet`);
	}
	return globals;
}

//////////
//////////

interface StateMenuSettings {
	visible: boolean,
};
const defaultStateMenuSettings: StateMenuSettings = {
	visible: true,
};
export const stateMenuAtom = atom<StateMenuSettings>(defaultStateMenuSettings)
export function initStateMenuSettings() {
	const {plugin} = getGlobals();
	const store = getDefaultStore();
	const curStateMenuSettings = store.get(stateMenuAtom);
	const newStateMenuSettings = JSON.parse(JSON.stringify(curStateMenuSettings));
	newStateMenuSettings.visible = plugin.settings.showStateMenu;
	store.set(stateMenuAtom, newStateMenuSettings);
}
export function setStateMenuSettings(stateMenuSettings: StateMenuSettings): void {
	const store = getDefaultStore();
	store.set(stateMenuAtom, stateMenuSettings);
}
export function getStateMenuSettings(): StateMenuSettings {
	const store = getDefaultStore();
	return store.get(stateMenuAtom);
}

//////////
//////////

export const deviceMemoryStore = createStore();
export const showHiddenFoldersAtom = atomWithStorage(LOCAL_STORAGE_PREFIX + 'show-hidden-folders', false)

export function hideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, false);
}
export function unhideHiddenFolders() {
    deviceMemoryStore.set(showHiddenFoldersAtom, true);
}
/***
 * Fetch the current state of the showHiddenFolders Atom.
 * Use 'useAtomValue(showHiddenFoldersAtom) in React instead.
 */
export function getShowHiddenFolders(): boolean {
    return deviceMemoryStore.get(showHiddenFoldersAtom);
}

