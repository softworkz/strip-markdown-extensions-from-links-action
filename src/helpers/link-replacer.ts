import {existsSync} from "fs"
import {extname} from "path"
import transformLinks from "transform-markdown-links"

class LinkReplacer {

  private readonly filesPath: string

  constructor(filesPath: string) {
    this.filesPath = filesPath
  }

  protected safeDecodeURIComponent(str: string): string {
    try {
      return decodeURIComponent(str)
    } catch (e) {
      return str
    }
  }

  transformMarkdownLinks(oldContent: string): string {
    // Transform regular links
    let newContent = transformLinks(
      oldContent,
      (link: string) => this.processLink(link)
    );
  
    // Transform image links
    newContent = newContent.replace(
      /!\[([^\]]*)\]\((\.\.\/images\/[^)]+)\)/g,
      (match, altText, imagePath) => {
        let newImagePath = imagePath.replace('../images/', 'wiki/');
        newImagePath = newImagePath.replace('images/', 'wiki/');
        return `![${altText}](${newImagePath})`;
      }
    );
    
    if (newContent.includes('.png')) {
        newContent = newContent.replace('../status/', 'wiki/');
    }
  
    // Transform image links
    newContent = newContent.replace(
      /!\[([^\]]*)\]\((\.\.\/status\/[^)]+)\)/g,
      (match, altText, imagePath) => {
          let newImagePath = imagePath.replace('../status/', 'wiki/');
          newImagePath = imagePath.replace('status/', 'wiki/');
        return `![${altText}](${newImagePath})`;
      }
    );

    return newContent;
  }

  protected extractLinkParts(link: string): string[] {
    if (!link.includes('#')) {
      return [link, ""]
    }

    return link.split("#", 2)
  }

  processLink(link: string): string {
    const [potentialEncodedFile, fragment] = this.extractLinkParts(link)
    const potentialFile = this.safeDecodeURIComponent(potentialEncodedFile)
    const fullPath: string = this.filesPath + '/' + potentialFile

    //if (!existsSync(fullPath)) {
    //  return link
    //}

    if (extname(fullPath) !== '.md') {
      return link
    }

    // Remove the subfolder from the path and keep only the filename
    const fileName = potentialFile.split('/').pop() || potentialFile
    const modifiedPath = fileName.substring(0, fileName.length - 3)

    const uriPath = encodeURIComponent(modifiedPath)
    if (!fragment) {
      return uriPath
    }
    return uriPath + "#"+ encodeURIComponent(fragment)
  }

}

export default LinkReplacer
