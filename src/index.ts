import readDirSync from 'recursive-readdir-sync'
import {readFileSync, writeFileSync} from 'fs'
import {debug, getInput} from '@actions/core'
import * as fs from 'fs';
import * as path from 'path';
import { extname } from "path";
import LinkReplacer from './helpers/link-replacer'

const filesPath: string = getInput('path', {required: true})

const replacer = new LinkReplacer(filesPath)

for (const file of readDirSync(filesPath)) {
  const filename: string = file.toString()

  if (extname(filename) === '.md') {

      const oldContent: string = readFileSync(filename, 'utf8')
      const newContent: string = replacer.transformMarkdownLinks(oldContent)

      if (oldContent != newContent) {
          debug(filename + ' updated')
          writeFileSync(filename, newContent)
      }
  }
}

const transformSidebar = () => {
    const sidebarPath = path.join(filesPath, '_Sidebar.md');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

    let transformedContent = '<h3>\n';

    // Handle CRLF line endings
    const lines = sidebarContent.split(/\r?\n/);
    let lastLevel = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
            let headingText = trimmedLine.substring(2).trim();
            // Replace spaces with dashes and trim the text
            const svgFileName = headingText.replace(/ /g, '-');
            const svgContent = `<?xml version="1.0" encoding="UTF-8" ?>
<svg enable-background="new" version="1.1" viewBox="0 -18 200 32" xmlns="http://www.w3.org/2000/svg">
    <text font-size="1.05em" font-weight="600" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Noto Sans,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" fill="black">${headingText}</text>
</svg>`;
            fs.writeFileSync(path.join(filesPath, `${svgFileName}.svg`), svgContent);
            transformedContent += `<img src="wiki/${svgFileName}.svg" width="80%" valign="middle" />\n`;
            lastLevel = 0;
        } else if (trimmedLine.startsWith('- ') && line.startsWith('- ')) {
            if (lastLevel === 2) {
                transformedContent += `${line}<img src="wiki/trans.png" width="2" height="26" valign="bottom">\n`;
            } else {
                transformedContent += `${line}<img src="wiki/trans.png" width="2" height="22" valign="bottom">\n`;
            }
            lastLevel = 1;
        } else if (trimmedLine.startsWith('- ')) {
            if (lastLevel === 1) {
                transformedContent += `${line}<img src="wiki/trans.png" width="2" height="26" valign="bottom">\n`;
            } else {
                transformedContent += `${line}<img src="wiki/trans.png" width="2" height="22" valign="bottom">\n`;
            }
            lastLevel = 2;
        } else {
            transformedContent += line + '\n';
        }
    }

    transformedContent += '</h3>';
    fs.writeFileSync(sidebarPath, transformedContent);
};

// Run the transformation
transformSidebar();
