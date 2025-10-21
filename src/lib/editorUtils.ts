export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getLanguageFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'html': 'html',
    'json': 'json',
  };
  return languageMap[extension || ''] || 'javascript';
};

export const getDefaultContent = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const baseName = fileName.split('.')[0];

  switch (extension) {
    case 'jsx':
      return `import React from 'react';

export default function ${baseName}() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        ${baseName} Component
      </h1>
      <p className="text-gray-600 mb-4">
        This is your new React component.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Click me!
      </button>
    </div>
  );
}`;
    case 'tsx':
      return `import React from 'react';

interface ${baseName}Props {
  title?: string;
  children?: React.ReactNode;
}

export default function ${baseName}({ title = '${baseName} Component', children }: ${baseName}Props): JSX.Element {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        This is your new TypeScript React component.
      </p>
      {children}
    </div>
  );
}`;
    case 'css':
      return `/* Custom CSS styles */
.${baseName.toLowerCase()}-container {
  @apply p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md;
}

.${baseName.toLowerCase()}-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-4;
}

.${baseName.toLowerCase()}-content {
  @apply text-gray-600 dark:text-gray-300;
}`;
    case 'js':
      return `// ${baseName}.js

export const ${baseName} = {
  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },
  
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};`;
    case 'json':
      return `{
  "name": "${baseName}",
  "version": "1.0.0",
  "description": "Configuration for ${baseName}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {},
  "devDependencies": {}
}`;
    case 'md':
      return `# ${baseName}

## Description
This is a markdown file for ${baseName}.

## Features
- Feature 1
- Feature 2
- Feature 3

## Usage
\`\`\`javascript
const ${baseName.toLowerCase()} = new ${baseName}();
\`\`\`
`;
    default:
      return `// ${fileName}
// Add your code here`;
  }
};
