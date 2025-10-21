'use client';

import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react';
import { PreviewProps, ProjectFile } from '@/types';

export default function Preview({ files }: PreviewProps) {
  const flattenFiles = (fileList: ProjectFile[]): ProjectFile[] => {
    const result: ProjectFile[] = [];
    fileList.forEach(file => {
      result.push(file);
      if (file.children && file.children.length > 0) {
        result.push(...flattenFiles(file.children));
      }
    });
    return result;
  };

  const allFiles = flattenFiles(files);

  const sandpackFiles = allFiles.reduce((acc, file) => {
    if (!file.isDirectory && file.content && file.content.trim()) {
      acc[file.path] = file.content;
    }
    return acc;
  }, {} as Record<string, string>);

  const hasContent = Object.values(sandpackFiles).some(content => content && content.trim());

  if (Object.keys(sandpackFiles).length === 0 || !hasContent) {
    sandpackFiles['/App.jsx'] = `import React from 'react';

export default function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to CipherStudio!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Create your first file to get started.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Use the file explorer on the left to create new files and start building your React application.
        </p>
      </div>
    </div>
  );
}`;

    sandpackFiles['/index.js'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);`;
  } else {
    if (sandpackFiles['/index.js'] && !sandpackFiles['/App.jsx']) {
      sandpackFiles['/App.jsx'] = `import React from 'react';

export default function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to CipherStudio!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Create your first file to get started.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Use the file explorer on the left to create new files and start building your React application.
        </p>
      </div>
    </div>
  );
}`;
    }
  }

  sandpackFiles['/index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

  return (
    <div className="h-full w-full bg-preview-bg border border-preview-border">
      <SandpackProvider
        key={JSON.stringify(sandpackFiles)}
        template="react"
        files={sandpackFiles}
        theme="light"
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          autorun: true,
        }}
        customSetup={{
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'lucide-react': '^0.263.1',
          },
          devDependencies: {
            '@types/react': '^18.0.0',
            '@types/react-dom': '^18.0.0',
          },
        }}
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
        }}
      >
        <SandpackLayout style={{ height: '100%', width: '100%', border: 'none' }}>
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={true}
            showOpenInCodeSandbox={false}
            showOpenNewtab={false}
            showSandpackErrorOverlay={true}
            style={{
              height: ' 100%',
              width: '100%',
              border: 'none',
            }}
            onError={(error) => console.error('Preview error:', error)}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
