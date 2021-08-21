export const COMPONENT_FILE = `import React from 'react'
import * as Styles from './{{fileName}}.styles'
{{#each imports}}
{{encodeMyString this}}
{{/each}}

interface {{componentName}}Props {}

const {{componentName}} = (props:{{componentName}}Props) => {
    return (
        <Styles.{{componentName}}Wrapper>
            {{ encodeMyString componentBody}}
        </Styles.{{componentName}}Wrapper>
    )
}

export default {{componentName}}
`;

export const STYLES_FILE = `import styled from 'styled-components'

export const {{componentName}}Wrapper = styled.div\`\`;

{{#each additionalComponents}}
{{encodeMyString this}}
{{/each}}
`;

export const INDEX_FILE = `export {default} from './{{fileName}}'`;
