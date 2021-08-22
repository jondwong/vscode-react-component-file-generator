# React Component File Generator

> A simple vscode extension to create template files for new react components.

Executing will result in the creation of a directory with the following structure:

```
| - component-name
|      | - component-name.tsx
|      | - component-name.styles.ts
|      | - index.ts
```

## Usage

### Generate New Component

##### Supported Execution Methods

-   Via Command Palette
-   Via Right Click in the File Navigator  
    **NOTE**: Will create this in the clicked on location

Executing this command will prompt you to enter in a component name in pascalcase, and will generate the following files:

```
/* component-name.tsx */

import React from 'react'
import * as Styles from './component-name.styles'

interface ComponentNameProps {}

const ComponentName = (props:ComponentNameProps) => {
    return (
        <Styles.ComponentNameWrapper></Styles.ComponentNameWrapper>
    )
}

export default ComponentName
```

```
/* component-name.styles.ts */

import styled from 'styled-components'

export const ComponentNameWrapper = styled.div``
```

```
/* index.ts */

export {default} from './component-name'
```

### Copy Component To New Location

##### Supported Execution Methods

-   Via Command Palette
-   Via Right Click in the File Navigator on existing component

Executing this assumes a directory containing a component, and will try to copy and convert everything to kebab-cased file names, as will as create an index.ts file in the location you supply.

### Create Component from Selection

##### Supported Execution Methods

-   Via right click with selected JSX

Executing this will create a new component folder structure, and place the selected jsx into the body of the new component. It will do it's best to add the appropriate imports, as well as copy over selected styled components from the source styles file into the new components file.

### Create Styled Component From Selection

-   Via right click with selected JSX

Executing this will add a styled div component in the current component directory styles file with the name of the selected text.
