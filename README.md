## Dependency Analyzer

Analyze file dependencies and imports

Watch the files

```
import { buildDM } from 'dependency-analyzer';

buildDM(appDir).then(dm => {

    // analyze dependencies and imports

    const node = dm.find(absolutedPath);

    node.dependencies // file dependencies;

    node.imports // file imports;

    dm.on('add', path => listener);
    dm.on('change', path => listener);
    dm.on('unlink', path => listener);
});
```



