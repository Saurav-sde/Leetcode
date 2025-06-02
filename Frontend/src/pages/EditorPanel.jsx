import Editor from '@monaco-editor/react';

function CodeEditor() {
  return(
        <div className='min-h-screen flex justify-center items-center'>
            <div>
                
            </div>
            <Editor width="50vw" height="90vh" defaultLanguage="javascript" defaultValue="// Write your JS Code" />
        </div>
    ) 
}

export default CodeEditor;