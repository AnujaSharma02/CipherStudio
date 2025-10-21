# CipherStudio - Browser-Based React IDE

A powerful, browser-based React IDE that allows you to create, edit, and preview React projects in real-time. Built with Next.js, Monaco Editor, and Sandpack.

## 🚀 Features

### Core Features
- **File Management**: Create, delete, rename, and organize project files and folders
- **Code Editor**: Rich code editing experience with Monaco Editor
- **Live Preview**: Real-time React project preview using Sandpack
- **Project Persistence**: Save and load projects using localStorage
- **Theme Support**: Light and dark theme switching
- **Responsive Design**: Works on desktop and tablet devices

### Additional Features
- **Autosave**: Automatic project saving with toggle option
- **Export/Import**: Export projects as JSON files and import them back
- **Welcome Screen**: Intuitive onboarding for new users
- **Mobile Support**: Responsive sidebar for mobile devices
- **File Templates**: Quick-start templates for common file types

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Code Editor**: Monaco Editor
- **Code Execution**: Sandpack (CodeSandbox)
- **Icons**: Lucide React
- **State Management**: React hooks with localStorage persistence

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-ide
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Getting Started
1. Open CipherStudio in your browser
2. Use the welcome screen to create your first file or folder
3. Start coding in the editor panel
4. See your changes live in the preview panel

### File Management
- **Create Files**: Click the "+" button in the file explorer
- **Create Folders**: Click the folder icon in the file explorer
- **Rename**: Right-click on a file/folder and select "Rename"
- **Delete**: Right-click on a file/folder and select "Delete"

### Project Management
- **Save**: Click the save button or enable autosave
- **Export**: Export your project as a JSON file
- **Import**: Load a previously exported project
- **Theme**: Toggle between light and dark themes

### Code Editor
- **Syntax Highlighting**: Full support for JavaScript, TypeScript, CSS, HTML, and more
- **Auto-completion**: IntelliSense support for React and JavaScript
- **Error Detection**: Real-time error highlighting
- **Code Formatting**: Built-in code formatting

### Live Preview
- **Real-time Updates**: See changes instantly as you type
- **React Support**: Full React component rendering
- **Hot Reload**: Automatic refresh when files change
- **Error Display**: Clear error messages in the preview

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── CodeEditor.tsx    # Monaco Editor wrapper
│   ├── FileExplorer.tsx  # File management component
│   ├── IDE.tsx           # Main IDE component
│   ├── Preview.tsx       # Sandpack preview component
│   ├── ResponsiveSidebar.tsx # Mobile-responsive sidebar
│   └── WelcomeScreen.tsx # Onboarding component
├── types/                # TypeScript type definitions
│   └── index.ts
└── lib/                  # Utility functions
    └── utils.ts
```

## 🎨 Customization

### Themes
The IDE supports light and dark themes. The theme preference is saved in localStorage and persists across sessions.

### File Types
The editor supports various file types with appropriate syntax highlighting:
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- CSS (.css)
- HTML (.html)
- JSON (.json)
- Markdown (.md)

### Default Templates
When creating new files, the IDE provides helpful templates:
- React components with proper structure
- CSS files with basic styling
- JavaScript files with console.log examples

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create new components in the `src/components/` directory
2. Add type definitions in `src/types/index.ts`
3. Update the main IDE component to integrate new features
4. Test responsiveness across different screen sizes

## 📱 Responsive Design

The IDE is fully responsive and works on:
- **Desktop**: Full sidebar and multi-panel layout
- **Tablet**: Collapsible sidebar with touch-friendly controls
- **Mobile**: Sheet-based sidebar with optimized touch interface

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Sandpack](https://sandpack.codesandbox.io/) for code execution
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ using Next.js and modern web technologies.