import './markdown-header-view-mod.scss';
import ProjectCardsPlugin from "src/main";
import { FileView, ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import CardBrowser from "src/components/card-browser/card-browser";
import { createContext } from 'react';
import { PluginContext } from "src/utils/plugin-context";
import { getFileState } from 'src/logic/read-files';

//////////
//////////

const MarkdownHeaderClassName = 'project-cards_status-menu';

//////////

export function registerMarkdownHeaderViewMod (plugin: ProjectCardsPlugin) {
    loadOnNewMarkdownView(plugin);
}

function loadOnNewMarkdownView(plugin: ProjectCardsPlugin) {
	plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', () => {
		const viewType = plugin.app.workspace.getLeaf().view.getViewType();
		if(viewType === 'markdown') {
            addMarkdownViewHeader(plugin);
        }
	}));
}

function addMarkdownViewHeader(plugin: ProjectCardsPlugin) {
    let { workspace } = plugin.app;
    let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if(!leaf) return;

    const containerEl = leaf.view.containerEl;
    const headerEl = containerEl.children[0];
    const titleContainerEl = headerEl.find('.view-header-title-container');
    if(!titleContainerEl) return;

    const activeFile = workspace.getActiveFile();
    if(!activeFile) return;
    const curFileState = getFileState(plugin, activeFile);

    let statusMenuEl: null | Element;
    statusMenuEl = titleContainerEl.find(`.${MarkdownHeaderClassName}`);
    if(!statusMenuEl) {
        statusMenuEl = titleContainerEl.createDiv(MarkdownHeaderClassName);
    }
    statusMenuEl.textContent = curFileState;
    
    // this.root = createRoot(statusMenuEl);
    // this.root.render(
    //     <PluginContext.Provider value={this.plugin}>
    //         <CardBrowser plugin={this.plugin}/>
    //     </PluginContext.Provider>
    // );

}