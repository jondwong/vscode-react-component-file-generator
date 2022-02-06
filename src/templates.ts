export const COMPONENT_FILE = `import React from 'react'
{{encodeMyString styleImportStatement}}

{{#each imports}}
{{encodeMyString this}}
{{/each}}

interface {{componentName}}Props {}

const {{componentName}} = (props:{{componentName}}Props) => {
    return (
        <{{encodeMyString baseComponentOpenTag}}>
            {{ encodeMyString componentBody}}
        </{{baseComponentCloseTag}}>
    )
}

export default {{componentName}}
`;

export const STYLED_COMPONENT_STYLE_FILE = `import styled from 'styled-components'

export const {{componentName}}Wrapper = styled.div\`\`;

{{#each additionalComponents}}
{{encodeMyString this}}
{{/each}}
`;

export const SCSS_STYLE_FILE = `

.{{uncapitalize componentName}} {
    box-sizing: border-box;
}

`;



export const INDEX_FILE = `export {default} from './{{fileName}}'`;
