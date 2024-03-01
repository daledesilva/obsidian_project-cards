import { TAbstractFile, TFile, TFolder } from "obsidian";
import ProjectCardsPlugin from "src/main";
import { contentsIndicatesProject, getItemsInFolder } from "./get-files";

/////////
/////////

export const fetchExcerpt = async (plugin: ProjectCardsPlugin, item: TAbstractFile): Promise<null|string> => {
    const v = item.vault;
    let excerpt: null | string = null;

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    if(item instanceof TFile)           excerpt = await fetchFileExcerpt(item);
    else if(item instanceof TFolder)    excerpt = await fetchProjectExcerpt(plugin, item)

    return excerpt;
}

const fetchFileExcerpt = async (file: TFile): Promise<null|string> => {
    const v = file.vault;
    let excerpt: string = '';

    // TODO: Use shortSummary property if present
    // Otherwise do all below (createExcerpt)

    excerpt = await v.cachedRead(file);
    excerpt = removeFrontmatter(excerpt);
    excerpt = removeCodeBlocks(excerpt);
    excerpt = simplifyWhiteSpace(excerpt);

    return excerpt;
}

const fetchProjectExcerpt = async (plugin: ProjectCardsPlugin, folder: TFolder): Promise<null|string> => {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return null;
    
    for(let i=0; i<itemsInFolder.length; i++) {
        const item = itemsInFolder[i];
        if(item instanceof TFile) {
            const frontmatter = getFrontmatter(plugin, item);
            if(frontmatter['state']) {
                return await fetchFileExcerpt(item);
            }
        }
    }

    return null;
}

export const isProjectFolder = async (plugin: ProjectCardsPlugin, folder: TFolder): Promise<boolean> => {
    const itemsInFolder = getItemsInFolder(folder);
    if(!itemsInFolder)  return false;

    // TODO:
    // if(markedAsProjectFolder(plugin, folder)) {
        // return true
    // } else if(markedAsCategoryFolder(plugin, folder)) {
        // return false
    // } else
    if(contentsIndicatesProject(plugin, folder)) {
        return true
    }

    return false;

}


// REVIEW: Review this chat GPT function
function removeFrontmatter(text: string): string {
    const sectionRegex = /---([^`]+?)---(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: Review this chat GPT function
function removeCodeBlocks(text: string): string {
    const sectionRegex = /(\s*)```([^`]+?)```(\s*)/g;
    return text.replace(sectionRegex, "");
}

// REVIEW: This isn't properly working with new lines across code blocks and maybe more
function simplifyWhiteSpace(text: string): string {
    const lineBreakRegex = /(\\n|\\n\s+|\s+\\n)+/;
    return text.replace(lineBreakRegex, '. ');
}

export const getFrontmatter = (plugin: null | ProjectCardsPlugin, file: TFile): {} | FrontmatterCache => {
    if(!plugin) {
        console.log('getFrontmatter returned no frontmatter because plugin was undefined or null.')
        return {};
    }
    let frontmatter: {} | FrontmatterCache = {};
    
    let metadataCache;
    if(plugin.app.metadataCache) metadataCache = plugin.app.metadataCache;
    
    let fileCache;
    if(metadataCache) fileCache = metadataCache.getFileCache(file);

    if(fileCache) {
        let tempFrontmatter = fileCache.frontmatter;
        if(tempFrontmatter) {
            frontmatter = tempFrontmatter;
        } else {
            frontmatter = {};
        }
    }

    return frontmatter;
}

export const setFrontmatter = (plugin: ProjectCardsPlugin, file: TFile, newFrontmatter: FrontmatterCache) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter = newFrontmatter;
    });
}

export const getFileState = (plugin: ProjectCardsPlugin, file: TFile): null | string => {
    const frontmatter = getFrontmatter(plugin,file);
    if(!frontmatter) return null;

    const state = frontmatter['state'];
    return state;
}

export const setFileState = (plugin: ProjectCardsPlugin, file: TFile, state: null | string) => {
    plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
        console.log('frontmatter before', frontmatter);
        if(state) {
            frontmatter['state'] = state;
        } else {
            frontmatter['state'] = undefined;
            // delete frontmatter['state']; // This doesn't work
        }
        console.log('frontmatter after', frontmatter);
    });
}

export const getFileTitle = (file: TFile): string => {
    const str = file.name.split('.')
    str.pop();
    return str.join('.');
}