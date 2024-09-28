import classNames from 'classnames';
import './small-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileExcerpt } from "src/logic/file-processes";
import { trimFilenameExt } from 'src/logic/string-processes';
import { PluginContext } from 'src/utils/plugin-context';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';

/////////
/////////

interface SmallNoteCardProps {
    file: TFile,
}

export const SmallNoteCard = (props: SmallNoteCardProps) => {
    const plugin = React.useContext(PluginContext);
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);

    const name = props.file.basename; //trimFilenameExt(props.file.name);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;

    const [articleRotation] = React.useState(Math.random() * 4 - 2);

    ////////

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerFileContextMenu({
            plugin,
            fileButtonEl: noteRef.current,
            file: props.file,
            onFileChange: () => {
                cardBrowserContext.rememberLastTouchedFile(props.file);
            },
        });
    }, [])
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_small-note-card',
                showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { () => {
                cardBrowserContext.openFile(props.file)
            }}
            style = {{
                rotate: articleRotation + 'deg',
            }}
        >
            <h3>
                {name}
            </h3>
        </article>
    </>

    ///////
    ///////

}








