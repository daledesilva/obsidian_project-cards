import './state-menu.scss';
import { MarkdownView, TFile } from 'obsidian';
import * as React from "react";
import classnames from 'classnames';
import { getFileState, setFileState } from 'src/logic/frontmatter-processes';
import { getGlobals, stateMenuAtom } from 'src/logic/stores';
import { useAtomValue } from 'jotai';

//////////
//////////

interface StateMenuProps {
    file: TFile,
}

export const StateMenu = (props: StateMenuProps) => {
    const {plugin} = getGlobals();
    
    const stateMenuSettings = useAtomValue(stateMenuAtom);
    const [file, setFile] = React.useState( props.file );
    const [state, setState] = React.useState( getFileState(file) );
    const [menuIsActive, setMenuIsActive] = React.useState(false);
    const firstRunRef = React.useRef<boolean>(true);
    const stateMenuRef = React.useRef<HTMLDivElement>(null);
    const stateMenuContentRef = React.useRef<HTMLDivElement>(null);
    const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

    listenForFileChanges();

    let displayState = state;
    if(!displayState) displayState = 'Set State';

    const visibleStates = plugin.settings.states.visible;
    const hiddenStates = plugin.settings.states.hidden;

    // On first run
    React.useEffect( () => {
        firstRunRef.current = false;

        function handleClickOutside(event: any) {
            if (stateMenuRef.current && !stateMenuRef.current.contains(event.target)) {
                setMenuIsActive(false);
            }
        }
        
        document.addEventListener('pointerdown', handleClickOutside);
        monitorWorkspaceResizes();

        return () => {
            unmonitorWorkspaceResizes();
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, [])
    

    // Whenever stateMenuSettings has updated
    React.useEffect( () => {
        setHeight();
    }, [stateMenuSettings])


    return (
        <div
            className = 'ddc_pb_state-menu'
            ref = {stateMenuRef}
            >
            <div
                className = 'ddc_pb_state-menu-content'
                ref={stateMenuContentRef}
            >

                {!menuIsActive && (
                    <button
                        className = {classnames([
                            'ddc_pb_state-btn',
                            'ddc_pb_in-closed-menu',
                            !firstRunRef.current && 'ddc_pb_has-return-transition'
                        ])}
                        onClick = {() => {
                            setMenuIsActive(true);
                        }}    
                    >
                        {displayState}
                    </button>
                )}
            
                {menuIsActive && (<>
                    <div className='ddc_pb_visible-state-btns'>
                        {visibleStates.map( (thisStatesSettings, index) => (
                            <button
                                key = {index}
                                className = {classnames([
                                    'ddc_pb_state-btn',
                                    'ddc_pb_visible-state',
                                    thisStatesSettings.name === state && 'is-set',
                                ])}
                                onClick = {() => setStateAndCloseMenu(thisStatesSettings.name)}    
                            >
                                {thisStatesSettings.name}
                            </button>
                        ))}
                    </div>
                    <div className='ddc_pb_hidden-state-btns'>
                        {hiddenStates.map( (thisStatesSettings, index) => (
                            <button
                                key = {index}
                                className = {classnames([
                                    'ddc_pb_state-btn',
                                    'ddc_pb_hidden-state',
                                    thisStatesSettings.name === state && 'is-set',
                                ])}
                                onClick = {() => setStateAndCloseMenu(thisStatesSettings.name)}    
                            >
                                {thisStatesSettings.name}
                            </button>
                        ))}
                    </div>
                </>)}

            </div>
        </div>
    )

    //////////

    function listenForFileChanges() {
        if(!plugin) return;

        plugin.registerEvent(plugin.app.workspace.on('file-open', (newFile) => {
            if(!newFile) return;
            let leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
            if(!leaf) return;

            setState( getFileState(newFile) );
            setFile(newFile);
        }));
    }

    function setStateAndCloseMenu(newState: string) {
        if(!plugin) return;

        if(newState !== state) {
            // set the new state
            setFileState(file, newState)
            setState(newState)
        } else {
            // erase the existing state
            setFileState(file, null)
            setState(null)
        }
        setMenuIsActive(false);
    }

    function setHeight() {
        if(stateMenuSettings.visible) {
            setOpenHeight();
        } else {
            setClosedHeight();
        }
    }
    function setOpenHeight() {
        if(!stateMenuContentRef.current) return;
        if(!stateMenuRef.current) return;
        const contentHeight = stateMenuContentRef.current.getBoundingClientRect().height;
        stateMenuRef.current.style.height = `${contentHeight}px`;
    }
    function setClosedHeight() {
        if(!stateMenuRef.current) return;
        stateMenuRef.current.style.height = '0';
    }

    function monitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');
        resizeObserverRef.current = new ResizeObserver(() => {
            setHeight();
        });
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.observe(surroundingWorkspaceSplit);
        }
    }
    function unmonitorWorkspaceResizes() {
        const surroundingWorkspaceSplit = stateMenuRef.current?.closest('.workspace-split');
        if (surroundingWorkspaceSplit) {
            resizeObserverRef.current?.unobserve(surroundingWorkspaceSplit);
        }
        resizeObserverRef.current?.disconnect();
    }
}

