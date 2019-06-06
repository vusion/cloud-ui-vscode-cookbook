const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
import * as path from 'path';
const ensureVPre = function (markdown) {
    if (markdown && markdown.renderer && markdown.renderer.rules) {
        const rules = ['code_inline', 'code_block', 'fence'];
        const rendererRules = markdown.renderer.rules;
        rules.forEach((rule) => {
            if (rendererRules.hasOwnProperty(rule) && typeof rendererRules[rule] === 'function') {
                const saved = rendererRules[rule];
                rendererRules[rule] = function (...args) {
                    return saved.apply(this, args).replace(/(<pre|<code)(?![^\s])/g, '$1 v-pre');
                };
            }
        });
    }
};
class Parser {
    constructor(){

        const defaultMarkdownOptions = {
            html: true,
            langPrefix: 'lang-',
            highlight: (content:string, lang: string) => {
                content = content.trim();
                lang = lang.trim();

                let hlLang = lang;
                if (lang === 'vue' || lang === 'htm')
                    hlLang = 'html';

                let code = '';
                if (hlLang && hljs.getLanguage(hlLang)) {
                    try {
                        const result = hljs.highlight(hlLang, content).value;
                        code = `<pre class="hljs lang-${lang}"><code>${result}</code></pre>\n`;
                    } catch (e) {}
                } else {
                    const result = markdown.utils.escapeHtml(content);
                    code = `<pre class="hljs"><code>${result}</code></pre>\n`;
                }


                return this.codeProcess.call(this, content, code, lang);
            },
        };
        const markdown = new MarkdownIt(defaultMarkdownOptions);
        markdown.renderer.rules.fence = function (tokens: any, idx:number, options:object) {
            const token = tokens[idx];
            const info = token.info ? markdown.utils.unescapeAll(token.info).trim() : '';
            const langName = info.split(/\s+/g)[0];
            return options.highlight(token.content, langName);
        };
    }

    codeProcess(live:string, code:string, lang:string) {
        const relativePath = path.relative(process.cwd(), this.loader.resourcePath).replace(/\\/g, '/').replace(/^(\.\.\/)+/, '');

        if (live) {
            return `<u-code-example
                    :show-code="false"
                    :show-detail="${lang === 'vue'}"
                    file-path="${relativePath}">
                    <div>${live}</div>
                    <div slot="code">${code}</div>
                    </u-code-example>\n\n`;
        } else
            return code;
}